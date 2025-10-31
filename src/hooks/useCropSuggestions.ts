import { useState, useEffect, useCallback } from 'react';
import { getCurrentLocationWeather, getWeatherForecast, generateWeatherSummary, WeatherData, WeatherSummary } from '@/lib/weatherService';
import { getCropSuggestions, CropSuggestionsResponse } from '@/lib/cropSuggestions';

export interface UseCropSuggestionsOptions {
  location?: string; // If provided, use this location instead of GPS
  currentCrops?: string[]; // Current crops being grown
  autoRefresh?: boolean; // Auto-refresh suggestions periodically
}

export interface UseCropSuggestionsReturn {
  suggestions: CropSuggestionsResponse | null;
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  isLocationLoading: boolean;
  refreshSuggestions: () => Promise<void>;
  clearError: () => void;
}

export function useCropSuggestions(options: UseCropSuggestionsOptions = {}): UseCropSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<CropSuggestionsResponse | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { location, currentCrops, autoRefresh = false } = options;

  const loadSuggestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let weather: WeatherData;

      if (location) {
        // Use provided location
        weather = await getWeatherForecast(location);
      } else {
        // Use current GPS location
        setIsLocationLoading(true);
        weather = await getCurrentLocationWeather();
        setIsLocationLoading(false);
      }

      setWeatherData(weather);

      // Generate weather summary for AI analysis
      const weatherSummary: WeatherSummary = generateWeatherSummary(weather);

      // Get AI-powered crop suggestions
      const cropSuggestions = await getCropSuggestions(
        weatherSummary,
        location,
        currentCrops
      );

      setSuggestions(cropSuggestions);
    } catch (err) {
      console.error('Error loading crop suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load crop suggestions');
    } finally {
      setIsLoading(false);
      setIsLocationLoading(false);
    }
  }, [location, currentCrops]);

  const refreshSuggestions = useCallback(async () => {
    await loadSuggestions();
  }, [loadSuggestions]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load suggestions on mount or when dependencies change
  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  // Auto-refresh periodically if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadSuggestions();
    }, 30 * 60 * 1000); // Refresh every 30 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, loadSuggestions]);

  return {
    suggestions,
    weatherData,
    isLoading,
    error,
    isLocationLoading,
    refreshSuggestions,
    clearError,
  };
}

/**
 * Hook for just weather data without crop suggestions
 */
export function useWeatherData(location?: string) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const weather = location 
        ? await getWeatherForecast(location)
        : await getCurrentLocationWeather();

      setWeatherData(weather);
    } catch (err) {
      console.error('Error loading weather data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  return {
    weatherData,
    isLoading,
    error,
    refresh: loadWeather,
    clearError: () => setError(null),
  };
}