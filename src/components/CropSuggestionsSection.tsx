import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CloudRain, 
  Sun, 
  Thermometer, 
  Droplets, 
  RefreshCw, 
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useCropSuggestions } from '@/hooks/useCropSuggestions';
import { CropSuggestion } from '@/lib/cropSuggestions';

interface CropSuggestionsSectionProps {
  location?: string;
  currentCrops?: string[];
  className?: string;
}

const CropSuggestionsSection: React.FC<CropSuggestionsSectionProps> = ({
  location,
  currentCrops,
  className = '',
}) => {
  const { 
    suggestions, 
    weatherData, 
    isLoading, 
    error, 
    isLocationLoading,
    refreshSuggestions,
    clearError 
  } = useCropSuggestions({ location, currentCrops });

  if (isLoading || isLocationLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Weather-Based Crop Suggestions
          </h3>
          {isLocationLoading && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Getting location...
            </Badge>
          )}
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Weather-Based Crop Suggestions
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { clearError(); refreshSuggestions(); }}
            className="flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unable to Load Suggestions</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!suggestions || !weatherData) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Weather-Based Crop Suggestions
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshSuggestions}
          className="flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Current Weather Summary */}
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

      {/* General Advice */}
      {suggestions.generalAdvice && (
        <Alert>
          <Sun className="h-4 w-4" />
          <AlertTitle>General Farming Advice</AlertTitle>
          <AlertDescription>{suggestions.generalAdvice}</AlertDescription>
        </Alert>
      )}

      {/* Risk Factors */}
      {suggestions.riskFactors && suggestions.riskFactors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Weather Risks to Monitor</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {suggestions.riskFactors.map((risk, index) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Crop Suggestions */}
      <div className="space-y-3">
        {suggestions.suggestions.map((suggestion, index) => (
          <CropSuggestionCard 
            key={`${suggestion.cropName}-${index}`} 
            suggestion={suggestion} 
          />
        ))}
      </div>

      {suggestions.suggestions.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Specific Suggestions Available</AlertTitle>
          <AlertDescription>
            Current weather conditions may not be optimal for new plantings. 
            Consider consulting local agricultural experts for region-specific advice.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

interface CropSuggestionCardProps {
  suggestion: CropSuggestion;
}

const CropSuggestionCard: React.FC<CropSuggestionCardProps> = ({ suggestion }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              {suggestion.cropName}
              {suggestion.variety && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({suggestion.variety})
                </span>
              )}
            </CardTitle>
            <CardDescription>{suggestion.reasonForSuggestion}</CardDescription>
          </div>
          {suggestion.marketDemand && (
            <Badge 
              variant={
                suggestion.marketDemand === 'High' ? 'default' :
                suggestion.marketDemand === 'Medium' ? 'secondary' : 'outline'
              }
              className="flex items-center gap-1"
            >
              <TrendingUp className="w-3 h-3" />
              {suggestion.marketDemand}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-medium flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" />
              Planting Time
            </div>
            <p className="text-muted-foreground">{suggestion.plantingTimeframe}</p>
          </div>
          
          <div>
            <div className="font-medium flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" />
              Expected Harvest
            </div>
            <p className="text-muted-foreground">{suggestion.expectedHarvestTime}</p>
          </div>
        </div>

        <div>
          <div className="font-medium flex items-center gap-2 mb-1">
            <Droplets className="w-4 h-4" />
            Watering Requirements
          </div>
          <p className="text-muted-foreground text-sm">{suggestion.wateringRequirements}</p>
        </div>

        {suggestion.soilPreparation && (
          <div>
            <div className="font-medium mb-1">Soil Preparation</div>
            <p className="text-muted-foreground text-sm">{suggestion.soilPreparation}</p>
          </div>
        )}

        {suggestion.potentialYield && (
          <div>
            <div className="font-medium mb-1">Expected Yield</div>
            <p className="text-muted-foreground text-sm">{suggestion.potentialYield}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CropSuggestionsSection;