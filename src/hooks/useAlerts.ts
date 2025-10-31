import { useState, useEffect, useMemo } from 'react';
import { useCropSuggestions } from './useCropSuggestions';
import { Alert, generateAlertsFromWeatherAndCrops, getTopAlerts, generateFallbackAlerts } from '@/lib/alertsService';

export interface UseAlertsOptions {
  location?: string;
  currentCrops?: string[];
}

export interface UseAlertsReturn {
  allAlerts: Alert[];
  topAlerts: Alert[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAlerts(options: UseAlertsOptions = {}): UseAlertsReturn {
  const { location, currentCrops } = options;
  
  const {
    suggestions,
    weatherData,
    isLoading,
    error,
    refreshSuggestions,
  } = useCropSuggestions({ location, currentCrops });

  const allAlerts = useMemo(() => {
    if (isLoading) {
      return [];
    }

    if (error || (!weatherData && !suggestions)) {
      return generateFallbackAlerts();
    }

    return generateAlertsFromWeatherAndCrops(weatherData, suggestions);
  }, [weatherData, suggestions, isLoading, error]);

  const topAlerts = useMemo(() => {
    return getTopAlerts(allAlerts, 2);
  }, [allAlerts]);

  const refresh = async () => {
    await refreshSuggestions();
  };

  return {
    allAlerts,
    topAlerts,
    isLoading,
    error,
    refresh,
  };
}