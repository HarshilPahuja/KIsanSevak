import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  IndianRupee,
  Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { localPrices } from '@/data/localPrices';
import { useLanguage } from '@/contexts/LanguageContext';

// Types mapped to simplified UI showing only current price
interface CurrentMarketPrice {
  cropName: string;
  modelPrice: number; // Model Price from API
  minPrice?: number;
  maxPrice?: number;
  unit: string; // e.g., 'per quintal'
  market?: string; // City/Market
  state?: string;
  date?: string; // latest date string from API
}

interface MarketPricesSectionProps {
  className?: string;
}

const ENV_STATE = import.meta.env.VITE_AGMARKNET_STATE as string | undefined;
const DEFAULT_STATE = (import.meta.env.VITE_DEFAULT_STATE as string | undefined) || ENV_STATE;

const MarketPricesSection: React.FC<MarketPricesSectionProps> = ({
  className = '',
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<CurrentMarketPrice[]>([]);

  useEffect(() => {
    let isMounted = true;


    const toTitleCase = (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));

    const normalizeCommodity = (name: string): { forApi: string; forDisplay: string } => {
      const m = name.trim().toLowerCase();
      const map: Record<string, string> = {
        tomato: 'Tomato',
        tomatoes: 'Tomato',
        potato: 'Potato',
        potatoes: 'Potato',
        onion: 'Onion',
        onions: 'Onion',
        paddy: 'Rice',
        rice: 'Rice',
        wheat: 'Wheat',
        maize: 'Maize',
        corn: 'Maize',
        'green gram': 'Green Gram',
        moong: 'Green Gram',
        'black gram': 'Black Gram',
        urad: 'Black Gram',
        bengalgram: 'Gram',
        'bengal gram': 'Gram',
        chana: 'Gram',
        soybean: 'Soybean',
        soyabean: 'Soybean',
        groundnut: 'Groundnut',
        peanut: 'Groundnut',
        turmeric: 'Turmeric',
        haldi: 'Turmeric',
        chilli: 'Chili (Dry)',
        chili: 'Chili (Dry)',
        'red chilli': 'Chili (Dry)',
        'red chili': 'Chili (Dry)',
        coriander: 'Coriander',
        dhania: 'Coriander',
        cabbage: 'Cabbage',
        cauliflower: 'Cauliflower',
        brinjal: 'Brinjal',
        eggplant: 'Brinjal',
        okra: 'Okra',
        'lady finger': 'Okra',
        'ladys finger': 'Okra',
        bhindi: 'Okra',
        peas: 'Green Peas',
        'green peas': 'Green Peas',
      };
      const forApi = map[m] || toTitleCase(m);
      return { forApi, forDisplay: forApi };
    };

    const INDIAN_STATES = [
      'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Andaman and Nicobar Islands','Lakshadweep'
    ];

    const inferStateFromLocation = (loc?: string): string | undefined => {
      if (!loc) return undefined;
      const lower = loc.toLowerCase();
      const match = INDIAN_STATES.find(st => lower.includes(st.toLowerCase()));
      return match;
    };

    const fetchCropTypesWithLocations = async (): Promise<{ crop: string; state?: string }[]> => {
      const { data, error } = await supabase
        .from('crops')
        .select('crop_type, location_name');
      if (error) throw error;
      const rows = (data || []) as any[];
      const items = rows
        .map(r => ({ crop: String(r.crop_type || '').trim().toLowerCase(), state: inferStateFromLocation(r.location_name || undefined) }))
        .filter(i => i.crop.length > 0);

      // Reduce to unique crop with most frequent state (if any)
      const byCrop: Record<string, { counts: Record<string, number> }> = {};
      for (const i of items) {
        if (!byCrop[i.crop]) byCrop[i.crop] = { counts: {} };
        const key = i.state || '__none__';
        byCrop[i.crop].counts[key] = (byCrop[i.crop].counts[key] || 0) + 1;
      }
      const result: { crop: string; state?: string }[] = [];
      for (const crop of Object.keys(byCrop)) {
        const counts = byCrop[crop].counts;
        let bestState: string | undefined = undefined;
        let bestCount = 0;
        for (const k of Object.keys(counts)) {
          const c = counts[k];
          if (c > bestCount && k !== '__none__') {
            bestCount = c;
            bestState = k;
          }
        }
        result.push({ crop, state: bestState });
      }
      return result;
    };

    const getLocalPriceForCrop = (cropName: string, stateName: string): CurrentMarketPrice | null => {
      const norm = normalizeCommodity(cropName);
      const statePrices = localPrices[stateName as keyof typeof localPrices] || {};
      const national = localPrices['India'] || {};
      const band = (statePrices as any)[norm.forDisplay] || (national as any)[norm.forDisplay];
      if (!band) return null;
      return {
        cropName: norm.forDisplay,
        modelPrice: band.modal,
        minPrice: band.min,
        maxPrice: band.max,
        unit: 'per quintal',
        market: undefined,
        state: stateName,
        date: undefined,
      };
    };

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const cropsWithState = await fetchCropTypesWithLocations();
        if (cropsWithState.length === 0) {
          if (!isMounted) return;
          setPrices([]);
          setLoading(false);
          return;
        }

        // Determine which state to use: prefer .env default, else majority inferred, else India
        let stateToUse = DEFAULT_STATE;
        if (!stateToUse) {
          const counts: Record<string, number> = {};
          for (const { state } of cropsWithState) {
            if (!state) continue;
            counts[state] = (counts[state] || 0) + 1;
          }
          let best: string | undefined;
          let bestCount = 0;
          for (const k of Object.keys(counts)) {
            if (counts[k] > bestCount) {
              best = k; bestCount = counts[k];
            }
          }
          stateToUse = best || 'India';
        }

        // Build prices from local map
        const uniqueCrops = Array.from(new Set(cropsWithState.map(c => c.crop)));
        const ok: CurrentMarketPrice[] = [];
        for (const crop of uniqueCrops) {
          const p = getLocalPriceForCrop(crop, stateToUse as string);
          if (p) ok.push(p);
        }

        if (!isMounted) return;
        if (ok.length === 0) {
          setError(`No local price entries found for your crops in ${stateToUse}.`);
        }
        setPrices(ok);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Failed to load market prices');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-foreground">{t('home.market.prices')}</h3>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{t('home.market.prices')}</h3>
        <Badge variant="outline" className="text-xs">Live Prices</Badge>
      </div>

      {error && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Market data unavailable</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {prices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prices.map((price, index) => (
            <MarketPriceCard key={`${price.cropName}-${index}`} price={price} />
          ))}
        </div>
      ) : !error ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Market Data</AlertTitle>
          <AlertDescription>
            Add crops to your farm profile to see live mandi prices.
          </AlertDescription>
        </Alert>
      ) : null}

      <p className="text-xs text-muted-foreground text-center">
        * Prices are indicative and may vary by location and quality
      </p>
    </div>
  );
};

// Helper function to get translated crop name
const getCropTranslationKey = (cropName: string): string => {
  const cropMap: Record<string, string> = {
    'Rice': 'market.rice',
    'Wheat': 'market.wheat', 
    'Tomato': 'market.tomato',
    'Onion': 'market.onion',
    'Potato': 'market.potato',
    'Maize': 'market.maize',
    'Green Gram': 'market.green.gram',
    'Black Gram': 'market.black.gram',
    'Gram': 'market.gram',
    'Soybean': 'market.soybean',
    'Groundnut': 'market.groundnut',
    'Turmeric': 'market.turmeric',
    'Chili (Dry)': 'market.chili',
    'Coriander': 'market.coriander',
    'Cabbage': 'market.cabbage',
    'Cauliflower': 'market.cauliflower',
    'Brinjal': 'market.brinjal',
    'Okra': 'market.okra',
    'Green Peas': 'market.green.peas'
  };
  return cropMap[cropName] || 'market.other';
};

interface MarketPriceCardProps {
  price: CurrentMarketPrice;
}

const MarketPriceCard: React.FC<MarketPriceCardProps> = ({ price }) => {
  const { t } = useLanguage();
  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{t(getCropTranslationKey(price.cropName))}</CardTitle>
            <CardDescription>
              {(price.market || '') + (price.state ? (price.market ? ', ' : '') + price.state : '')}
              {price.date ? ` • ${price.date}` : ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-1">
          <IndianRupee className="w-5 h-5" />
          <span className="text-2xl font-bold">
            {price.modelPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-sm text-muted-foreground">
            {price.unit}
          </span>
        </div>
        {(price.minPrice || price.maxPrice) && (
          <div className="mt-1 text-xs text-muted-foreground">
            {price.minPrice ? `Min: ₹${price.minPrice.toLocaleString('en-IN')}` : ''}
            {price.minPrice && price.maxPrice ? ' • ' : ''}
            {price.maxPrice ? `Max: ₹${price.maxPrice.toLocaleString('en-IN')}` : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketPricesSection;
