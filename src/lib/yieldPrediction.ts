import { Crop } from './supabase';
import { WeatherData } from './weatherService';

export interface YieldPredictionResult {
  predictedYieldKg: number;
  predictedRevenue: number;
  confidenceScore: number;
  factors: {
    area: number;
    cropType: string;
    weather: number;
    investment: number;
    location: number;
  };
  metadata: {
    model: string;
    calculatedAt: string;
    assumptions: string[];
  };
}

// Crop yield data (kg per sqm) based on typical yields
const CROP_YIELD_DATA: { [key: string]: { yieldPerSqm: number; pricePerKg: number; season: number } } = {
  rice: { yieldPerSqm: 0.6, pricePerKg: 25, season: 150 }, // 6 tons/hectare, ₹25/kg
  wheat: { yieldPerSqm: 0.4, pricePerKg: 22, season: 120 }, // 4 tons/hectare, ₹22/kg
  corn: { yieldPerSqm: 0.8, pricePerKg: 18, season: 100 }, // 8 tons/hectare, ₹18/kg
  maize: { yieldPerSqm: 0.8, pricePerKg: 18, season: 100 }, // Same as corn
  tomatoes: { yieldPerSqm: 4.0, pricePerKg: 30, season: 90 }, // 40 tons/hectare, ₹30/kg
  tomato: { yieldPerSqm: 4.0, pricePerKg: 30, season: 90 },
  potatoes: { yieldPerSqm: 2.5, pricePerKg: 20, season: 100 }, // 25 tons/hectare, ₹20/kg
  potato: { yieldPerSqm: 2.5, pricePerKg: 20, season: 100 },
  onions: { yieldPerSqm: 2.0, pricePerKg: 25, season: 120 }, // 20 tons/hectare, ₹25/kg
  onion: { yieldPerSqm: 2.0, pricePerKg: 25, season: 120 },
  beans: { yieldPerSqm: 1.2, pricePerKg: 60, season: 75 }, // 12 tons/hectare, ₹60/kg
  peas: { yieldPerSqm: 1.0, pricePerKg: 50, season: 80 }, // 10 tons/hectare, ₹50/kg
  spinach: { yieldPerSqm: 2.5, pricePerKg: 40, season: 45 }, // 25 tons/hectare, ₹40/kg
  lettuce: { yieldPerSqm: 2.0, pricePerKg: 35, season: 60 }, // 20 tons/hectare, ₹35/kg
  carrots: { yieldPerSqm: 3.0, pricePerKg: 30, season: 90 }, // 30 tons/hectare, ₹30/kg
  cucumbers: { yieldPerSqm: 3.5, pricePerKg: 25, season: 70 }, // 35 tons/hectare, ₹25/kg
  peppers: { yieldPerSqm: 2.5, pricePerKg: 45, season: 85 }, // 25 tons/hectare, ₹45/kg
  eggplant: { yieldPerSqm: 2.0, pricePerKg: 35, season: 100 }, // 20 tons/hectare, ₹35/kg
};

/**
 * Simple yield prediction model
 */
export async function predictYield(crop: Crop, weatherData?: WeatherData): Promise<YieldPredictionResult> {
  try {
    const cropKey = crop.crop_type.toLowerCase();
    const baseYieldData = CROP_YIELD_DATA[cropKey] || CROP_YIELD_DATA['rice']; // Default to rice

    // Calculate area (prefer AI detected area, fallback to user input)
    const areaSqm = crop.detected_area_sqm || crop.farm_area_sqm || 1000; // Default 1000 sqm

    // Base yield calculation
    let predictedYield = areaSqm * baseYieldData.yieldPerSqm;

    // Factors affecting yield (0.5 to 1.5 multiplier)
    const factors = {
      area: calculateAreaFactor(areaSqm),
      cropType: calculateCropTypeFactor(cropKey),
      weather: weatherData ? calculateWeatherFactor(weatherData) : 1.0,
      investment: calculateInvestmentFactor(crop.investment_amount || 0, areaSqm),
      location: calculateLocationFactor(crop.latitude, crop.longitude),
    };

    // Apply all factors
    const totalFactor = Object.values(factors).reduce((acc, factor) => acc * factor, 1.0);
    predictedYield *= Math.max(0.3, Math.min(2.0, totalFactor)); // Cap between 30% and 200% of base

    // Calculate revenue
    const predictedRevenue = predictedYield * baseYieldData.pricePerKg;

    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(crop, weatherData, factors);

    return {
      predictedYieldKg: Math.round(predictedYield),
      predictedRevenue: Math.round(predictedRevenue),
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      factors,
      metadata: {
        model: 'AgriConnect Simple Yield Prediction v1.0',
        calculatedAt: new Date().toISOString(),
        assumptions: [
          `Base yield: ${baseYieldData.yieldPerSqm} kg/sqm for ${crop.crop_type}`,
          `Market price: ₹${baseYieldData.pricePerKg}/kg`,
          `Growing season: ${baseYieldData.season} days`,
          'Factors: area efficiency, crop type, weather, investment, location',
        ],
      },
    };
  } catch (error) {
    console.error('Error in yield prediction:', error);
    throw new Error(`Failed to predict yield: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Area efficiency factor (larger areas tend to be more efficient)
 */
function calculateAreaFactor(areaSqm: number): number {
  if (areaSqm < 500) return 0.8; // Very small plot
  if (areaSqm < 2000) return 0.9; // Small plot
  if (areaSqm < 5000) return 1.0; // Medium plot
  if (areaSqm < 20000) return 1.1; // Large plot
  return 1.15; // Very large plot
}

/**
 * Crop type factor (some crops are easier to grow)
 */
function calculateCropTypeFactor(cropType: string): number {
  const easyTier = ['spinach', 'lettuce', 'beans', 'peas'];
  const mediumTier = ['tomatoes', 'tomato', 'onions', 'onion', 'carrots', 'cucumbers'];
  const hardTier = ['rice', 'wheat', 'corn', 'maize', 'potatoes', 'potato'];
  
  if (easyTier.includes(cropType)) return 1.1;
  if (mediumTier.includes(cropType)) return 1.0;
  if (hardTier.includes(cropType)) return 0.9;
  return 1.0; // Default
}

/**
 * Weather factor based on temperature and rainfall
 */
function calculateWeatherFactor(weatherData: WeatherData): number {
  const temp = weatherData.current.temperature;
  const humidity = weatherData.current.humidity;
  
  let factor = 1.0;
  
  // Temperature factor
  if (temp >= 20 && temp <= 30) {
    factor *= 1.1; // Optimal temperature
  } else if (temp < 10 || temp > 40) {
    factor *= 0.7; // Extreme temperature
  } else {
    factor *= 0.9; // Suboptimal temperature
  }
  
  // Humidity factor
  if (humidity >= 50 && humidity <= 70) {
    factor *= 1.05; // Good humidity
  } else if (humidity < 30 || humidity > 90) {
    factor *= 0.85; // Poor humidity
  }
  
  // Rainfall factor from forecast
  if (weatherData.forecast && weatherData.forecast.length > 0) {
    const avgRainfall = weatherData.forecast.reduce((sum, day) => sum + day.precipitation, 0) / weatherData.forecast.length;
    if (avgRainfall >= 2 && avgRainfall <= 10) {
      factor *= 1.1; // Good rainfall
    } else if (avgRainfall < 0.5 || avgRainfall > 20) {
      factor *= 0.8; // Too little or too much rain
    }
  }
  
  return Math.max(0.5, Math.min(1.5, factor));
}

/**
 * Investment factor (more investment = better inputs = better yield)
 */
function calculateInvestmentFactor(investment: number, areaSqm: number): number {
  const investmentPerSqm = investment / areaSqm;
  
  if (investmentPerSqm < 5) return 0.7; // Very low investment
  if (investmentPerSqm < 15) return 0.85; // Low investment  
  if (investmentPerSqm < 30) return 1.0; // Normal investment
  if (investmentPerSqm < 50) return 1.15; // High investment
  return 1.25; // Very high investment
}

/**
 * Location factor (some regions are better for farming)
 */
function calculateLocationFactor(lat?: number, lon?: number): number {
  if (!lat || !lon) return 1.0;
  
  // Simple heuristic for Indian subcontinent
  // Better areas: Punjab, Haryana, UP plains, coastal areas
  // This is a very simplified model
  
  if (lat >= 28 && lat <= 32 && lon >= 75 && lon <= 78) {
    return 1.2; // North Indian plains (Punjab, Haryana)
  }
  
  if (lat >= 10 && lat <= 15 && lon >= 75 && lon <= 80) {
    return 1.1; // South Indian agricultural regions
  }
  
  if (lat >= 20 && lat <= 25 && lon >= 80 && lon <= 85) {
    return 1.05; // Central India
  }
  
  return 1.0; // Default factor
}

/**
 * Calculate confidence score based on data quality
 */
function calculateConfidenceScore(crop: Crop, weatherData?: WeatherData, factors?: any): number {
  let confidence = 0.5; // Base confidence
  
  // Area data quality
  if (crop.detected_area_sqm) {
    confidence += 0.2; // AI detected area is more reliable
  } else if (crop.farm_area_sqm) {
    confidence += 0.1; // User input area
  }
  
  // Crop details
  if (crop.crop_details && crop.variety) {
    confidence += 0.1;
  }
  
  // Location data
  if (crop.latitude && crop.longitude) {
    confidence += 0.1;
  }
  
  // Investment data
  if (crop.investment_amount && crop.investment_amount > 0) {
    confidence += 0.1;
  }
  
  // Weather data
  if (weatherData) {
    confidence += 0.1;
  }
  
  return Math.max(0.2, Math.min(1.0, confidence));
}

/**
 * Get yield prediction for multiple crops
 */
export async function predictMultipleCropsYield(crops: Crop[], weatherData?: WeatherData): Promise<YieldPredictionResult[]> {
  const predictions = await Promise.allSettled(
    crops.map(crop => predictYield(crop, weatherData))
  );
  
  return predictions
    .filter((result): result is PromiseFulfilledResult<YieldPredictionResult> => result.status === 'fulfilled')
    .map(result => result.value);
}