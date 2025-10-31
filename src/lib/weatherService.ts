import axios from 'axios';

export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    humidity: number;
    conditions: string;
    windSpeed: number;
    pressure: number;
  };
  forecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    humidity: number;
    precipitation: number;
    conditions: string;
    windSpeed: number;
  }>;
}

export interface WeatherSummary {
  location: string;
  currentConditions: string;
  nextTwoMonths: {
    averageRainfall: number;
    averageTemperature: number;
    averageHumidity: number;
    rainyDays: number;
    dryDays: number;
    bestPlantingPeriods: string[];
  };
}

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

if (!WEATHER_API_KEY) {
  console.error('Weather API key is not configured');
}

/**
 * Get weather forecast for a location (coordinates or city name)
 */
export async function getWeatherForecast(location: string): Promise<WeatherData> {
  if (!WEATHER_API_KEY) {
    throw new Error('Weather API key is not configured. Please check your .env file.');
  }

  try {
    // Parse location - if it's coordinates (lat, lon) or city name
    let weatherUrl: string;
    
    if (location.includes(',') && location.split(',').length === 2) {
      // Coordinates format: "lat,lon"
      const [lat, lon] = location.split(',').map(s => s.trim());
      weatherUrl = `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    } else {
      // City name
      weatherUrl = `${WEATHER_BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric`;
    }

    const response = await axios.get(weatherUrl);
    const data = response.data;

    // Process the forecast data (OpenWeatherMap gives 5-day forecast with 3-hour intervals)
    const processedForecast = processForecastData(data);
    
    return {
      location: data.city.name + ', ' + data.city.country,
      current: {
        temperature: data.list[0].main.temp,
        humidity: data.list[0].main.humidity,
        conditions: data.list[0].weather[0].description,
        windSpeed: data.list[0].wind.speed,
        pressure: data.list[0].main.pressure,
      },
      forecast: processedForecast,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid weather API key. Please check your configuration.');
      } else if (error.response?.status === 404) {
        throw new Error('Location not found. Please check the location name or coordinates.');
      }
    }
    
    throw new Error('Failed to fetch weather data. Please try again later.');
  }
}

/**
 * Process OpenWeatherMap forecast data to daily summaries
 */
function processForecastData(data: any) {
  const dailyForecasts = new Map();
  
  data.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    
    if (!dailyForecasts.has(date)) {
      dailyForecasts.set(date, {
        date,
        maxTemp: item.main.temp_max,
        minTemp: item.main.temp_min,
        humidity: item.main.humidity,
        precipitation: item.rain?.['3h'] || 0,
        conditions: item.weather[0].description,
        windSpeed: item.wind.speed,
        tempReadings: [item.main.temp],
        humidityReadings: [item.main.humidity],
      });
    } else {
      const existing = dailyForecasts.get(date);
      existing.maxTemp = Math.max(existing.maxTemp, item.main.temp_max);
      existing.minTemp = Math.min(existing.minTemp, item.main.temp_min);
      existing.precipitation += item.rain?.['3h'] || 0;
      existing.tempReadings.push(item.main.temp);
      existing.humidityReadings.push(item.main.humidity);
    }
  });

  // Convert to array and calculate averages
  return Array.from(dailyForecasts.values()).map((day: any) => ({
    date: day.date,
    maxTemp: Math.round(day.maxTemp),
    minTemp: Math.round(day.minTemp),
    humidity: Math.round(day.humidityReadings.reduce((a: number, b: number) => a + b, 0) / day.humidityReadings.length),
    precipitation: Math.round(day.precipitation * 10) / 10, // Round to 1 decimal
    conditions: day.conditions,
    windSpeed: Math.round(day.windSpeed * 10) / 10,
  }));
}

/**
 * Generate weather summary for Gemini analysis
 */
export function generateWeatherSummary(weatherData: WeatherData): WeatherSummary {
  const forecast = weatherData.forecast;
  
  // Calculate statistics for the available forecast period
  const totalRainfall = forecast.reduce((sum, day) => sum + day.precipitation, 0);
  const avgTemperature = forecast.reduce((sum, day) => sum + (day.maxTemp + day.minTemp) / 2, 0) / forecast.length;
  const avgHumidity = forecast.reduce((sum, day) => sum + day.humidity, 0) / forecast.length;
  const rainyDays = forecast.filter(day => day.precipitation > 0.5).length;
  const dryDays = forecast.length - rainyDays;

  // Identify potential planting periods based on weather patterns
  const bestPlantingPeriods: string[] = [];
  
  // Look for consecutive days with good conditions (moderate temp, some humidity, not too much rain)
  for (let i = 0; i < forecast.length - 2; i++) {
    const period = forecast.slice(i, i + 3);
    const avgTempInPeriod = period.reduce((sum, day) => sum + (day.maxTemp + day.minTemp) / 2, 0) / 3;
    const totalRainInPeriod = period.reduce((sum, day) => sum + day.precipitation, 0);
    
    if (avgTempInPeriod >= 15 && avgTempInPeriod <= 35 && totalRainInPeriod < 10 && totalRainInPeriod > 1) {
      const startDate = new Date(period[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endDate = new Date(period[2].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      bestPlantingPeriods.push(`${startDate} - ${endDate}`);
    }
  }

  return {
    location: weatherData.location,
    currentConditions: weatherData.current.conditions,
    nextTwoMonths: {
      averageRainfall: Math.round(totalRainfall * 10) / 10,
      averageTemperature: Math.round(avgTemperature * 10) / 10,
      averageHumidity: Math.round(avgHumidity),
      rainyDays,
      dryDays,
      bestPlantingPeriods: bestPlantingPeriods.slice(0, 3), // Limit to top 3 periods
    },
  };
}

/**
 * Get current location weather (requires user location)
 */
export async function getCurrentLocationWeather(): Promise<WeatherData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const weatherData = await getWeatherForecast(`${latitude},${longitude}`);
          resolve(weatherData);
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        reject(new Error('Unable to get your location. Please allow location access or enter a city name.'));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}