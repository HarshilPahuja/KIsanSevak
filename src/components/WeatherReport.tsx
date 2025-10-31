import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CloudRain, 
  Thermometer, 
  Droplets, 
  RefreshCw, 
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { useWeatherData } from '@/hooks/useCropSuggestions';

interface WeatherReportProps {
  location?: string;
  className?: string;
}

const WeatherReport: React.FC<WeatherReportProps> = ({
  location,
  className = '',
}) => {
  const { weatherData, isLoading, error, refresh } = useWeatherData(location);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Weather Report</h3>
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Weather Report</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Weather Data Unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Weather Report</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {weatherData.location}
              </CardTitle>
              <CardDescription className="capitalize">
                {weatherData.current.conditions}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold flex items-center gap-1">
                <Thermometer className="w-5 h-5" />
                {Math.round(weatherData.current.temperature)}°C
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>{weatherData.current.humidity}% humidity</span>
            </div>
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-gray-500" />
              <span>{weatherData.current.windSpeed} m/s wind</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherReport;