import { useState } from "react";
import { ArrowLeft, MapPin, Satellite, Loader2, Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getCurrentLocation, fetchSatelliteImage, isMapboxConfigured } from "@/lib/mapbox";
import { detectCropAreaFromSatellite, validateAreaDetection } from "@/lib/areaDetection";
import { createCrop } from "@/lib/cropsRepository";
import { useLanguage } from "@/contexts/LanguageContext";

interface CropsScreenProps {
  onBack: () => void;
  onNameChange: (name: string) => void;
  currentName: string;
}

const CropsScreen = ({ onBack, onNameChange, currentName }: CropsScreenProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: currentName,
    cropType: "",
    variety: "",
    cropDetails: "",
    locationName: "",
    coordinates: "" as string,
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    userArea: "",
    investment: "",
  });
  
  const [areaDetection, setAreaDetection] = useState({
    isDetecting: false,
    satelliteImageUrl: "" as string,
    detectedArea: 0,
    confidence: 0,
    description: "" as string,
    hasDetection: false,
  });
  
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLocationClick = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      setFormData({
        ...formData,
        coordinates: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      toast({
        title: t('crops.form.location.captured'),
        description: t('crops.form.location.captured.desc'),
      });
    } catch (error) {
      toast({
        title: t('crops.form.location.error'),
        description: error instanceof Error ? error.message : t('crops.form.location.error.desc'),
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };
  
  const handleAreaDetection = async () => {
    if (!formData.latitude || !formData.longitude) {
      toast({
        title: t('crops.form.location.required'),
        description: t('crops.form.location.required.desc'),
        variant: "destructive",
      });
      return;
    }
    
    if (!isMapboxConfigured()) {
      toast({
        title: t('crops.form.mapbox.error'),
        description: t('crops.form.mapbox.error.desc'),
        variant: "destructive",
      });
      return;
    }
    
    setAreaDetection({ ...areaDetection, isDetecting: true });
    
    try {
      // Fetch satellite image
      const satelliteResult = await fetchSatelliteImage({
        latitude: formData.latitude,
        longitude: formData.longitude,
        zoom: 17, // High zoom for area detection
        width: 640,
        height: 640,
      });
      
      // Detect area using Gemini AI
      const detectionResult = await detectCropAreaFromSatellite({
        imageBase64: satelliteResult.imageBase64,
        expectedCropType: formData.cropType,
        farmAreaHint: formData.userArea ? parseFloat(formData.userArea) : undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });
      
      // Validate the result
      const validatedResult = validateAreaDetection(detectionResult);
      
      setAreaDetection({
        isDetecting: false,
        satelliteImageUrl: satelliteResult.imageUrl,
        detectedArea: validatedResult.detectedAreaSqm,
        confidence: validatedResult.confidence,
        description: validatedResult.description,
        hasDetection: true,
      });
      
      toast({
        title: t('crops.form.area.detected'),
        description: `${t('crops.form.detected.area')} ${validatedResult.detectedAreaSqm} sqm ${t('crops.form.confidence')} ${Math.round(validatedResult.confidence * 100)}%`,
      });
      
    } catch (error) {
      console.error('Area detection error:', error);
      setAreaDetection({ ...areaDetection, isDetecting: false });
      toast({
        title: t('crops.form.area.failed'),
        description: error instanceof Error ? error.message : t('crops.form.area.failed.desc'),
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Parse crop details to extract crop type
      const cropType = formData.cropType || extractCropTypeFromDetails(formData.cropDetails);
      
      // Create crop record in Supabase
      const cropData = {
        farmer_name: formData.name,
        crop_type: cropType,
        variety: formData.variety || undefined,
        crop_details: formData.cropDetails,
        location_name: formData.locationName,
        latitude: formData.latitude,
        longitude: formData.longitude,
        farm_area_sqm: formData.userArea ? parseFloat(formData.userArea) : undefined,
        detected_area_sqm: areaDetection.hasDetection ? areaDetection.detectedArea : undefined,
        satellite_image_url: areaDetection.satelliteImageUrl || undefined,
        investment_amount: formData.investment ? parseFloat(formData.investment) : undefined,
      };
      
      const savedCrop = await createCrop(cropData);
      
      onNameChange(formData.name);
      
      toast({
        title: t('crops.form.crop.saved'),
        description: `${t('crops.form.crop.saved.desc')} Crop ID: ${savedCrop.id.substring(0, 8)}`,
      });
      
      // Reset form for next crop entry
      setFormData({
        ...formData,
        cropType: "",
        variety: "",
        cropDetails: "",
        userArea: "",
        investment: "",
      });
      
      setAreaDetection({
        isDetecting: false,
        satelliteImageUrl: "",
        detectedArea: 0,
        confidence: 0,
        description: "",
        hasDetection: false,
      });
      
    } catch (error) {
      console.error('Error saving crop:', error);
      toast({
        title: t('crops.form.save.failed'),
        description: error instanceof Error ? error.message : t('crops.form.save.failed.desc'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const extractCropTypeFromDetails = (details: string): string => {
    const commonCrops = ['rice', 'wheat', 'corn', 'maize', 'tomato', 'potato', 'onion', 'beans', 'peas'];
    const lowerDetails = details.toLowerCase();
    
    for (const crop of commonCrops) {
      if (lowerDetails.includes(crop)) {
        return crop.charAt(0).toUpperCase() + crop.slice(1);
      }
    }
    
    return 'Unknown';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card px-6 py-4 border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t('crops.form.title')}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">{t('crops.form.farmer.name')}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('crops.form.farmer.name.placeholder')}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cropType">{t('crops.form.crop.type')}</Label>
            <Input
              id="cropType"
              value={formData.cropType}
              onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
              placeholder={t('crops.form.crop.type.placeholder')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="variety">{t('crops.form.variety')}</Label>
            <Input
              id="variety"
              value={formData.variety}
              onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
              placeholder={t('crops.form.variety.placeholder')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cropDetails">{t('crops.form.additional.details')}</Label>
          <Textarea
            id="cropDetails"
            value={formData.cropDetails}
            onChange={(e) => setFormData({ ...formData, cropDetails: e.target.value })}
            placeholder={t('crops.form.additional.details.placeholder')}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="locationName">{t('crops.form.location.name')}</Label>
            <Input
              id="locationName"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              placeholder={t('crops.form.location.name.placeholder')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coordinates">{t('crops.form.gps.coordinates')}</Label>
            <div className="flex gap-2">
              <Input
                id="coordinates"
                value={formData.coordinates}
                onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                placeholder={t('crops.form.gps.placeholder')}
                readOnly
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleLocationClick}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('crops.form.gps.help')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userArea">{t('crops.form.estimated.area')}</Label>
            <Input
              id="userArea"
              type="number"
              value={formData.userArea}
              onChange={(e) => setFormData({ ...formData, userArea: e.target.value })}
              placeholder={t('crops.form.estimated.area.placeholder')}
            />
            <p className="text-xs text-muted-foreground">
              {t('crops.form.area.help')}
            </p>
          </div>
          
          {/* Area Detection Section */}
          <Card className="border-2 border-dashed border-muted">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{t('crops.form.ai.area.detection')}</CardTitle>
                  <CardDescription>{t('crops.form.ai.area.description')}</CardDescription>
                </div>
                {areaDetection.hasDetection && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {t('crops.form.detecting')}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleAreaDetection}
                disabled={areaDetection.isDetecting || !formData.latitude || !formData.longitude}
                className="w-full"
              >
                {areaDetection.isDetecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('crops.form.analyzing')}
                  </>
                ) : (
                  <>
                    <Satellite className="w-4 h-4 mr-2" />
                    {t('crops.form.detect.satellite')}
                  </>
                )}
              </Button>
              
              {!formData.latitude && (
                <p className="text-xs text-muted-foreground text-center">
                  {t('crops.form.gps.required')}
                </p>
              )}
              
              {areaDetection.hasDetection && (
                <div className="space-y-2 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('crops.form.detected.area')}</span>
                    <span className="text-sm font-bold">{areaDetection.detectedArea.toLocaleString()} sqm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('crops.form.confidence')}</span>
                    <Badge variant={areaDetection.confidence > 0.7 ? "default" : areaDetection.confidence > 0.4 ? "secondary" : "outline"}>
                      {Math.round(areaDetection.confidence * 100)}%
                    </Badge>
                  </div>
                  {areaDetection.satelliteImageUrl && (
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(areaDetection.satelliteImageUrl, '_blank')}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {t('crops.form.view.satellite')}
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{areaDetection.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <Label htmlFor="investment">{t('crops.form.investment')}</Label>
          <Input
            id="investment"
            type="number"
            value={formData.investment}
            onChange={(e) => setFormData({ ...formData, investment: e.target.value })}
            placeholder={t('crops.form.investment.placeholder')}
          />
          <p className="text-xs text-muted-foreground">
            {t('crops.form.investment.help')}
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('crops.form.saving')}
            </>
          ) : (
            t('crops.form.save')
          )}
        </Button>
      </form>
    </div>
  );
};

export default CropsScreen;
