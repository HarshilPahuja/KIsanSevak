import { CropSuggestionsResponse } from './cropSuggestions';
import { WeatherData } from './weatherService';

export interface Alert {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  severity: 'urgent' | 'warning' | 'normal';
  icon: string;
  time: string;
  category: 'weather' | 'crop' | 'market' | 'general';
}

/**
 * Generate dynamic alerts from weather data and crop suggestions
 */
export function generateAlertsFromWeatherAndCrops(
  weatherData: WeatherData | null,
  suggestions: CropSuggestionsResponse | null
): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  // Weather-based alerts
  if (weatherData) {
    alerts.push(...generateWeatherAlerts(weatherData, now));
  }

  // Crop suggestion alerts
  if (suggestions) {
    alerts.push(...generateCropSuggestionAlerts(suggestions, now));
  }

  // Sort by severity (urgent first, then warning, then normal) and time
  return alerts.sort((a, b) => {
    const severityOrder = { urgent: 0, warning: 1, normal: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });
}

/**
 * Generate alerts from weather data
 */
function generateWeatherAlerts(weatherData: WeatherData, now: Date): Alert[] {
  const alerts: Alert[] = [];

  // Temperature alerts
  if (weatherData.current.temperature > 35) {
    alerts.push({
      id: `temp-high-${now.getTime()}`,
      title: 'High Temperature Alert',
      subtitle: 'Extreme Heat Warning',
      description: `Current temperature is ${Math.round(weatherData.current.temperature)}°C. Protect crops from heat stress. Increase watering frequency and consider shade nets for sensitive crops.`,
      severity: 'warning',
      icon: '🌡️',
      time: formatRelativeTime(now),
      category: 'weather',
    });
  }

  if (weatherData.current.temperature < 5) {
    alerts.push({
      id: `temp-low-${now.getTime()}`,
      title: 'Frost Warning',
      subtitle: 'Low Temperature Alert',
      description: `Temperature has dropped to ${Math.round(weatherData.current.temperature)}°C. Risk of frost damage. Cover sensitive plants and ensure adequate protection.`,
      severity: 'urgent',
      icon: '❄️',
      time: formatRelativeTime(now),
      category: 'weather',
    });
  }

  // Humidity alerts
  if (weatherData.current.humidity > 90) {
    alerts.push({
      id: `humidity-high-${now.getTime()}`,
      title: 'High Humidity Warning',
      subtitle: 'Disease Risk Alert',
      description: `Humidity is at ${weatherData.current.humidity}%. High risk of fungal diseases. Ensure proper ventilation and consider fungicide application if needed.`,
      severity: 'warning',
      icon: '💧',
      time: formatRelativeTime(now),
      category: 'weather',
    });
  }

  // Wind alerts
  if (weatherData.current.windSpeed > 15) {
    alerts.push({
      id: `wind-high-${now.getTime()}`,
      title: 'Strong Wind Warning',
      subtitle: 'Crop Protection Alert',
      description: `Wind speed is ${weatherData.current.windSpeed} m/s. Secure loose equipment and provide support to tall crops. Risk of mechanical damage to plants.`,
      severity: 'warning',
      icon: '🌬️',
      time: formatRelativeTime(now),
      category: 'weather',
    });
  }

  // Rainfall forecasts from forecast data
  if (weatherData.forecast && weatherData.forecast.length > 0) {
    const upcomingRain = weatherData.forecast.slice(0, 3).reduce((sum, day) => sum + day.precipitation, 0);
    
    if (upcomingRain > 50) {
      alerts.push({
        id: `rain-heavy-${now.getTime()}`,
        title: 'Heavy Rainfall Expected',
        subtitle: 'Flooding Risk',
        description: `${Math.round(upcomingRain)}mm of rain expected in the next 3 days. Risk of waterlogging. Ensure proper drainage and protect harvested crops.`,
        severity: 'warning',
        icon: '🌧️',
        time: formatRelativeTime(now),
        category: 'weather',
      });
    } else if (upcomingRain < 2) {
      alerts.push({
        id: `rain-low-${now.getTime()}`,
        title: 'Dry Period Ahead',
        subtitle: 'Irrigation Alert',
        description: `Very little rainfall expected (${Math.round(upcomingRain)}mm). Plan irrigation schedule carefully and monitor soil moisture levels.`,
        severity: 'normal',
        icon: '☀️',
        time: formatRelativeTime(now),
        category: 'weather',
      });
    }
  }

  return alerts;
}

/**
 * Generate alerts from crop suggestions
 */
function generateCropSuggestionAlerts(suggestions: CropSuggestionsResponse, now: Date): Alert[] {
  const alerts: Alert[] = [];

  // Risk factor alerts (high priority)
  suggestions.riskFactors.forEach((risk, index) => {
    alerts.push({
      id: `risk-${index}-${now.getTime()}`,
      title: 'Weather Risk Detected',
      subtitle: 'Monitor Conditions',
      description: risk,
      severity: 'warning',
      icon: '⚠️',
      time: formatRelativeTime(now),
      category: 'weather',
    });
  });

  // Planting opportunity alerts
  if (suggestions.suggestions.length > 0) {
    const urgentCrops = suggestions.suggestions.filter(crop => 
      crop.plantingTimeframe.toLowerCase().includes('immediate') ||
      crop.plantingTimeframe.toLowerCase().includes('now') ||
      crop.plantingTimeframe.toLowerCase().includes('1-2 week')
    );

    if (urgentCrops.length > 0) {
      alerts.push({
        id: `planting-urgent-${now.getTime()}`,
        title: 'Optimal Planting Window',
        subtitle: 'Time-Sensitive Opportunity',
        description: `Current conditions are ideal for planting ${urgentCrops.map(c => c.cropName).join(', ')}. ${urgentCrops[0].reasonForSuggestion}`,
        severity: 'normal',
        icon: '🌱',
        time: formatRelativeTime(now),
        category: 'crop',
      });
    }
  }

  // General farming advice as normal alert
  if (suggestions.generalAdvice) {
    alerts.push({
      id: `advice-${now.getTime()}`,
      title: 'Farming Recommendation',
      subtitle: 'Weather-Based Advice',
      description: suggestions.generalAdvice,
      severity: 'normal',
      icon: '💡',
      time: formatRelativeTime(now),
      category: 'general',
    });
  }

  return alerts;
}

/**
 * Get the top N high-severity alerts for home screen
 */
export function getTopAlerts(alerts: Alert[], count: number = 2): Alert[] {
  return alerts
    .filter(alert => alert.severity === 'urgent' || alert.severity === 'warning')
    .slice(0, count);
}

/**
 * Format relative time (e.g., "2 hours ago", "just now")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

/**
 * Generate fallback alerts when weather data is not available
 */
export function generateFallbackAlerts(): Alert[] {
  const now = new Date();
  
  return [
    {
      id: `fallback-weather-${now.getTime()}`,
      title: 'Weather Data Unavailable',
      subtitle: 'Check Connection',
      description: 'Unable to fetch current weather data. Please check your internet connection or API configuration.',
      severity: 'normal',
      icon: '📡',
      time: formatRelativeTime(now),
      category: 'general',
    },
    {
      id: `fallback-general-${now.getTime()}`,
      title: 'Monitor Weather Conditions',
      subtitle: 'General Advice',
      description: 'Keep an eye on local weather patterns and adjust farming activities accordingly. Consult local meteorological sources for updates.',
      severity: 'normal',
      icon: '🌤️',
      time: formatRelativeTime(now),
      category: 'general',
    },
  ];
}