import { useMemo } from 'react';
import { useWeatherData } from '@/hooks/useCropSuggestions';
import { Alert, generateAlertsFromWeatherAndCrops, getTopAlerts, generateFallbackAlerts } from '@/lib/alertsService';

export interface UseWeatherAlertsOptions {
  location?: string;
}

export interface UseWeatherAlertsReturn {
  allAlerts: Alert[];
  topAlerts: Alert[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWeatherAlerts(options: UseWeatherAlertsOptions = {}): UseWeatherAlertsReturn {
  const { location } = options;
  const { weatherData, isLoading, error, refresh } = useWeatherData(location);

  const allAlerts = useMemo(() => {
    if (isLoading) return [];
    if (error || !weatherData) return generateFallbackAlerts();
    return generateAlertsFromWeatherAndCrops(weatherData, null);
  }, [weatherData, isLoading, error]);

  const topAlerts = useMemo(() => getTopAlerts(allAlerts, 2), [allAlerts]);

  return {
    allAlerts,
    topAlerts,
    isLoading,
    error,
    refresh,
  };
}
