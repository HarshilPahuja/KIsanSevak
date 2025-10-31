import { sendTextMessage } from './gemini';
import { WeatherSummary } from './weatherService';

export interface CropSuggestion {
  cropName: string;
  variety?: string;
  plantingTimeframe: string;
  reasonForSuggestion: string;
  expectedHarvestTime: string;
  wateringRequirements: string;
  soilPreparation?: string;
  potentialYield?: string;
  marketDemand?: 'High' | 'Medium' | 'Low';
}

export interface CropSuggestionsResponse {
  location: string;
  analysisDate: string;
  suggestions: CropSuggestion[];
  generalAdvice: string;
  riskFactors: string[];
}

/**
 * Generate crop suggestions based on weather forecast using Gemini AI
 */
export async function getCropSuggestions(
  weatherSummary: WeatherSummary,
  userLocation?: string,
  currentCrops?: string[]
): Promise<CropSuggestionsResponse> {
  try {
    // Build detailed prompt for Gemini
    const prompt = buildCropSuggestionPrompt(weatherSummary, userLocation, currentCrops);
    
    // Get AI response
    const aiResponse = await sendTextMessage(prompt);
    
    // Parse the structured response
    const parsedResponse = parseAIResponse(aiResponse, weatherSummary);
    
    return parsedResponse;
  } catch (error) {
    console.error('Error generating crop suggestions:', error);
    
    // Fallback with basic suggestions
    return {
      location: weatherSummary.location,
      analysisDate: new Date().toISOString(),
      suggestions: getBasicFallbackSuggestions(weatherSummary),
      generalAdvice: 'AI analysis temporarily unavailable. Please consult local agricultural experts for detailed advice.',
      riskFactors: ['Unable to analyze current weather risks. Monitor weather conditions closely.'],
    };
  }
}

/**
 * Build comprehensive prompt for Gemini AI
 */
function buildCropSuggestionPrompt(
  weatherSummary: WeatherSummary,
  userLocation?: string,
  currentCrops?: string[]
): string {
  const currentCropsText = currentCrops && currentCrops.length > 0 
    ? `Current crops being grown: ${currentCrops.join(', ')}`
    : 'No current crop information provided';

  return `You are an expert agricultural consultant. Based on the weather forecast data provided, suggest the best crops to plant in the coming weeks.

WEATHER ANALYSIS FOR: ${weatherSummary.location}
Current Conditions: ${weatherSummary.currentConditions}
Forecast Summary:
- Average Temperature: ${weatherSummary.nextTwoMonths.averageTemperature}°C
- Expected Rainfall: ${weatherSummary.nextTwoMonths.averageRainfall}mm
- Average Humidity: ${weatherSummary.nextTwoMonths.averageHumidity}%
- Rainy Days: ${weatherSummary.nextTwoMonths.rainyDays}
- Dry Days: ${weatherSummary.nextTwoMonths.dryDays}
- Best Planting Windows: ${weatherSummary.nextTwoMonths.bestPlantingPeriods.join(', ')}

${userLocation ? `Additional Location Info: ${userLocation}` : ''}
${currentCropsText}

Please provide your response in the following JSON format:
{
  "suggestions": [
    {
      "cropName": "crop name",
      "variety": "specific variety if applicable",
      "plantingTimeframe": "when to plant (e.g., 'Next 2-3 weeks', 'End of this month')",
      "reasonForSuggestion": "why this crop is good for current conditions",
      "expectedHarvestTime": "when to expect harvest",
      "wateringRequirements": "irrigation needs based on weather",
      "soilPreparation": "soil prep recommendations",
      "potentialYield": "expected yield range",
      "marketDemand": "High/Medium/Low"
    }
  ],
  "generalAdvice": "overall farming advice for the period",
  "riskFactors": ["list of potential weather or environmental risks to watch for"]
}

IMPORTANT GUIDELINES:
1. Suggest 3-5 appropriate crops maximum
2. Consider the specific climate patterns shown in the forecast
3. Prioritize crops that will thrive in the predicted conditions
4. Include both food crops and cash crops where appropriate
5. Consider water availability based on rainfall predictions
6. Factor in temperature ranges for crop suitability
7. Give practical, actionable advice
8. If rainfall is high, suggest crops that can handle moisture
9. If rainfall is low, suggest drought-resistant varieties
10. Consider seasonal appropriateness for the region

Provide only the JSON response, no additional text.`;
}

/**
 * Parse AI response and structure it properly
 */
function parseAIResponse(aiResponse: string, weatherSummary: WeatherSummary): CropSuggestionsResponse {
  try {
    // Try to extract JSON from the response
    let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      // If no JSON found, try to find content between code blocks
      jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        location: weatherSummary.location,
        analysisDate: new Date().toISOString(),
        suggestions: parsed.suggestions || [],
        generalAdvice: parsed.generalAdvice || 'Consider weather conditions carefully when planning your crops.',
        riskFactors: parsed.riskFactors || ['Monitor weather changes closely'],
      };
    }
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
  }

  // Fallback parsing - try to extract information manually
  return parseUnstructuredResponse(aiResponse, weatherSummary);
}

/**
 * Fallback parser for unstructured responses
 */
function parseUnstructuredResponse(response: string, weatherSummary: WeatherSummary): CropSuggestionsResponse {
  const suggestions: CropSuggestion[] = [];
  const lines = response.split('\n');
  
  // Simple extraction logic - look for crop names and recommendations
  const commonCrops = ['rice', 'wheat', 'maize', 'corn', 'tomato', 'potato', 'onion', 'beans', 'peas', 'spinach', 'lettuce', 'carrots', 'cucumbers', 'peppers', 'eggplant'];
  
  for (const crop of commonCrops) {
    if (response.toLowerCase().includes(crop)) {
      suggestions.push({
        cropName: crop.charAt(0).toUpperCase() + crop.slice(1),
        plantingTimeframe: 'Next 2-4 weeks',
        reasonForSuggestion: 'Suitable for current weather conditions',
        expectedHarvestTime: '2-4 months',
        wateringRequirements: 'Moderate watering required',
        marketDemand: 'Medium' as const,
      });
      
      if (suggestions.length >= 3) break;
    }
  }

  return {
    location: weatherSummary.location,
    analysisDate: new Date().toISOString(),
    suggestions: suggestions.length > 0 ? suggestions : getBasicFallbackSuggestions(weatherSummary),
    generalAdvice: 'Based on current weather patterns, focus on crops that match your local climate conditions.',
    riskFactors: ['Monitor weather changes', 'Ensure proper drainage if heavy rains expected'],
  };
}

/**
 * Basic fallback suggestions when AI is unavailable
 */
function getBasicFallbackSuggestions(weatherSummary: WeatherSummary): CropSuggestion[] {
  const suggestions: CropSuggestion[] = [];
  const temp = weatherSummary.nextTwoMonths.averageTemperature;
  const rainfall = weatherSummary.nextTwoMonths.averageRainfall;

  if (temp >= 20 && temp <= 30) {
    if (rainfall > 50) {
      suggestions.push({
        cropName: 'Rice',
        plantingTimeframe: 'Next 2-3 weeks',
        reasonForSuggestion: 'Good temperature and adequate rainfall',
        expectedHarvestTime: '3-4 months',
        wateringRequirements: 'Regular flooding required',
        marketDemand: 'High',
      });
    } else {
      suggestions.push({
        cropName: 'Wheat',
        plantingTimeframe: 'Next 2-4 weeks',
        reasonForSuggestion: 'Suitable temperature, can tolerate lower rainfall',
        expectedHarvestTime: '4-5 months',
        wateringRequirements: 'Moderate irrigation',
        marketDemand: 'High',
      });
    }
  }

  if (temp >= 15 && temp <= 25) {
    suggestions.push({
      cropName: 'Tomatoes',
      plantingTimeframe: 'Next 1-2 weeks',
      reasonForSuggestion: 'Optimal temperature range',
      expectedHarvestTime: '2-3 months',
      wateringRequirements: 'Regular watering, avoid overwatering',
      marketDemand: 'High',
    });
  }

  return suggestions.slice(0, 3); // Maximum 3 suggestions
}

/**
 * Get quick seasonal crop recommendations (fallback)
 */
export function getSeasonalCrops(month: number, region?: string): string[] {
  const cropsByMonth: { [key: number]: string[] } = {
    1: ['Wheat', 'Barley', 'Peas', 'Spinach', 'Lettuce'],  // January
    2: ['Wheat', 'Barley', 'Peas', 'Spinach', 'Carrots'],  // February
    3: ['Tomatoes', 'Peppers', 'Cucumbers', 'Beans'],      // March
    4: ['Tomatoes', 'Peppers', 'Cucumbers', 'Corn'],       // April
    5: ['Corn', 'Beans', 'Tomatoes', 'Peppers'],           // May
    6: ['Rice', 'Cotton', 'Sugarcane', 'Corn'],            // June
    7: ['Rice', 'Cotton', 'Sugarcane', 'Vegetables'],      // July
    8: ['Rice', 'Vegetables', 'Fodder crops'],             // August
    9: ['Wheat preparation', 'Vegetables', 'Fodder'],      // September
    10: ['Wheat', 'Barley', 'Mustard', 'Peas'],           // October
    11: ['Wheat', 'Barley', 'Mustard', 'Peas'],           // November
    12: ['Wheat', 'Barley', 'Peas', 'Spinach'],           // December
  };

  return cropsByMonth[month] || ['Consult local experts for seasonal recommendations'];
}