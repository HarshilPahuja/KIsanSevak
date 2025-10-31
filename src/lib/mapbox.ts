const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export interface SatelliteImageOptions {
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: number;
  height?: number;
  retina?: boolean;
}

export interface SatelliteImageResult {
  imageUrl: string;
  imageBase64: string;
  metadata: {
    latitude: number;
    longitude: number;
    zoom: number;
    dimensions: { width: number; height: number };
  };
}

/**
 * Generate Mapbox Static Image URL for satellite imagery
 */
export function generateSatelliteImageUrl(options: SatelliteImageOptions): string {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('VITE_MAPBOX_ACCESS_TOKEN is not configured. Please add it to your .env file.');
  }

  const {
    latitude,
    longitude,
    zoom = 16, // Good zoom level for farm area detection
    width = 512,
    height = 512,
    retina = true
  } = options;

  const retinaSuffix = retina ? '@2x' : '';
  
  // Mapbox Static Images API URL format:
  // https://api.mapbox.com/styles/v1/{username}/{style_id}/static/{lon},{lat},{zoom},{bearing},{pitch}/{width}x{height}{@2x}?access_token={access_token}
  const baseUrl = 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static';
  const coordinates = `${longitude},${latitude},${zoom},0,0`; // lon,lat,zoom,bearing,pitch
  const size = `${width}x${height}${retinaSuffix}`;
  
  return `${baseUrl}/${coordinates}/${size}?access_token=${MAPBOX_ACCESS_TOKEN}`;
}

/**
 * Fetch satellite image and convert to base64
 */
export async function fetchSatelliteImage(options: SatelliteImageOptions): Promise<SatelliteImageResult> {
  try {
    const imageUrl = generateSatelliteImageUrl(options);
    
    // Fetch the image
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch satellite image: ${response.status} ${response.statusText}`);
    }
    
    // Convert to blob then to base64
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    
    return {
      imageUrl,
      imageBase64: base64,
      metadata: {
        latitude: options.latitude,
        longitude: options.longitude,
        zoom: options.zoom || 16,
        dimensions: {
          width: options.width || 512,
          height: options.height || 512
        }
      }
    };
  } catch (error) {
    console.error('Error fetching satellite image:', error);
    throw new Error(`Failed to fetch satellite image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data:image/jpeg;base64, prefix if present
      const base64 = result.includes('base64,') ? result.split('base64,')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Get current user location for satellite image
 */
export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

/**
 * Check if Mapbox is properly configured
 */
export function isMapboxConfigured(): boolean {
  return Boolean(MAPBOX_ACCESS_TOKEN);
}

/**
 * Reverse geocode coordinates to State and Market (City) using Mapbox
 */
export async function reverseGeocodeToStateMarket(latitude: number, longitude: number): Promise<{ state?: string; market?: string }> {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('VITE_MAPBOX_ACCESS_TOKEN is not configured. Please add it to your .env file.');
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=place,region,district,locality&language=en&access_token=${MAPBOX_ACCESS_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Reverse geocode failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();

  // Helper to find a feature by type in either top-level features or their context
  const findByType = (typePrefix: string) => {
    const top = (data.features || []).find((f: any) => Array.isArray(f.place_type) && f.place_type.includes(typePrefix));
    if (top) return top;
    for (const f of data.features || []) {
      const ctx = (f.context || []).find((c: any) => typeof c.id === 'string' && c.id.startsWith(typePrefix + '.'));
      if (ctx) return ctx;
    }
    return undefined;
  };

  const regionFeat = findByType('region');
  const placeFeat = (data.features || []).find((f: any) => Array.isArray(f.place_type) && (f.place_type.includes('place') || f.place_type.includes('locality') || f.place_type.includes('district')));

  let state: string | undefined = (regionFeat && (regionFeat.text || regionFeat.properties?.short_code)) || undefined;
  let market: string | undefined = (placeFeat && (placeFeat.text || placeFeat.place_name)) || undefined;

  const normalize = (s?: string) => (s ? s.replace(/\s+/g, ' ').trim() : s);
  const alias = (s?: string) => {
    if (!s) return s;
    const m = s.toLowerCase();
    if (m === 'bengaluru') return 'Bangalore';
    if (m === 'bengaluru urban') return 'Bangalore';
    if (m === 'bengaluru rural') return 'Bangalore';
    if (m === 'new delhi') return 'Delhi';
    return s;
  };

  return {
    state: normalize(state),
    market: alias(normalize(market)),
  };
}
