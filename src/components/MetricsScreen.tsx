import { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getActiveCrops, getCropsSummary, updateCropYieldPrediction } from "@/lib/cropsRepository";
import { predictYield, predictMultipleCropsYield } from "@/lib/yieldPrediction";
import { useWeatherData } from "@/hooks/useCropSuggestions";
import { Crop } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

interface MetricsScreenProps {
  onBack: () => void;
  farmerName?: string;
}

interface CropMetrics {
  crop: Crop;
  prediction: {
    predictedYieldKg: number;
    predictedRevenue: number;
    confidenceScore: number;
  };
}

const MetricsScreen = ({ onBack, farmerName = "Farmer" }: MetricsScreenProps) => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [cropMetrics, setCropMetrics] = useState<CropMetrics[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { weatherData } = useWeatherData();
  const { t } = useLanguage();

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load active crops
      const activeCrops = await getActiveCrops({ farmerName, limit: 10 });
      setCrops(activeCrops);
      
      if (activeCrops.length === 0) {
        setIsLoading(false);
        return;
      }
      
      // Load summary statistics
      const summaryData = await getCropsSummary(farmerName);
      setSummary(summaryData);
      
      // Generate yield predictions
      const predictions = await predictMultipleCropsYield(activeCrops, weatherData);
      
      // Combine crops with their predictions
      const metricsData: CropMetrics[] = activeCrops.map((crop, index) => ({
        crop,
        prediction: predictions[index] || {
          predictedYieldKg: 0,
          predictedRevenue: 0,
          confidenceScore: 0.3,
        },
      }));
      
      setCropMetrics(metricsData);
      
      // Update predictions in database
      for (let i = 0; i < metricsData.length; i++) {
        const { crop, prediction } = metricsData[i];
        try {
          await updateCropYieldPrediction(crop.id, {
            predicted_yield_kg: prediction.predictedYieldKg,
            predicted_revenue: prediction.predictedRevenue,
            confidence_score: prediction.confidenceScore,
            prediction_metadata: {
              updated_at: new Date().toISOString(),
              weather_included: Boolean(weatherData),
            },
          });
        } catch (updateError) {
          console.warn('Failed to update prediction for crop:', crop.id, updateError);
        }
      }
      
    } catch (err) {
      console.error('Error loading metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshMetrics = async () => {
    setIsRefreshing(true);
    await loadMetrics();
    setIsRefreshing(false);
  };
  
  useEffect(() => {
    loadMetrics();
  }, [farmerName, weatherData]);
  
  const totalPredictedYield = cropMetrics.reduce((sum, m) => sum + m.prediction.predictedYieldKg, 0);
  const totalPredictedRevenue = cropMetrics.reduce((sum, m) => sum + m.prediction.predictedRevenue, 0);
  const averageConfidence = cropMetrics.length > 0 
    ? cropMetrics.reduce((sum, m) => sum + m.prediction.confidenceScore, 0) / cropMetrics.length 
    : 0;
  const totalInvestment = summary?.totalInvestment || 0;
  const projectedProfit = totalPredictedRevenue - totalInvestment;
  const profitMargin = totalInvestment > 0 ? (projectedProfit / totalInvestment) * 100 : 0;
  
  // Chart data
  const yieldChartData = cropMetrics.map(m => ({
    name: m.crop.crop_type,
    yield: m.prediction.predictedYieldKg,
    revenue: m.prediction.predictedRevenue,
  }));

  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-card px-6 py-4 border-b border-border flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t('nav.metrics')}</h1>
        </header>
        <div className="px-6 py-6 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">{t('metrics.title')}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={refreshMetrics} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('metrics.error.loading')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {crops.length === 0 && !error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('metrics.no.crops')}</AlertTitle>
            <AlertDescription>
              {t('metrics.no.crops.desc')}
            </AlertDescription>
          </Alert>
        )}
        
        {crops.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{t('metrics.total.active.crops')}</CardDescription>
                  <CardTitle className="text-2xl">{summary?.activeCrops || 0}</CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{t('metrics.total.area')}</CardDescription>
                  <CardTitle className="text-2xl">{Math.round(summary?.totalArea || 0).toLocaleString()} m²</CardTitle>
                </CardHeader>
              </Card>
            </div>
            
            {/* Yield Prediction */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('metrics.yield.predictions')}</CardTitle>
                    <CardDescription>
                      {t('metrics.yield.predictions.desc')}
                    </CardDescription>
                  </div>
                  <Badge variant={averageConfidence > 0.7 ? "default" : averageConfidence > 0.4 ? "secondary" : "outline"}>
                    {Math.round(averageConfidence * 100)}% {t('metrics.confidence')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-foreground">{totalPredictedYield.toLocaleString()}</span>
                    <span className="text-xl text-muted-foreground">kg</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t('metrics.total.expected.yield')}</p>
                </div>
                
                {yieldChartData.length > 0 && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 16, right: 24, bottom: 24, left: 24 }}>
                        <Pie
                          data={yieldChartData}
                          cx="50%"
                          cy="58%"
                          outerRadius={72}
                          fill="#8884d8"
                          dataKey="yield"
                          label={({ name, value }) => `${name}: ${Math.round(value)}kg`}
                        >
                          {yieldChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profit/Loss Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>{t('metrics.financial.analysis')}</CardTitle>
                <CardDescription>{t('metrics.investment.vs.returns')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('metrics.projected.revenue')}</p>
                    <p className="text-2xl font-bold text-foreground">₹ {totalPredictedRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('metrics.total.investment')}</p>
                    <p className="text-2xl font-bold text-foreground">₹ {totalInvestment.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">{t('metrics.projected.profit')}</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${projectedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹ {projectedProfit.toLocaleString()}
                    </span>
                    {profitMargin !== 0 && (
                      <Badge variant={profitMargin > 0 ? "default" : "destructive"}>
                        {profitMargin > 0 ? '+' : ''}{Math.round(profitMargin)}%
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Individual Crop Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">{t('metrics.crop.breakdown')}</h4>
                  {cropMetrics.map((metric, index) => (
                    <div key={metric.crop.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{metric.crop.crop_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((metric.crop.detected_area_sqm || metric.crop.farm_area_sqm || 0)).toLocaleString()} m² • 
                          {Math.round(metric.prediction.predictedYieldKg)} kg
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹ {Math.round(metric.prediction.predictedRevenue).toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(metric.prediction.confidenceScore * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default MetricsScreen;
