/**
 * Configuration management for AgriConnect
 * 
 * Required Environment Variables:
 * - VITE_GEMINI_API_KEY: Google Gemini API key for AI crop suggestions
 * - VITE_WEATHER_API_KEY: OpenWeatherMap API key for weather data
 * - VITE_MAPBOX_ACCESS_TOKEN: Mapbox access token for satellite imagery
 * - VITE_SUPABASE_URL: Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Supabase anonymous key
 */

export interface AppConfig {
  geminiApiKey: string | undefined;
  weatherApiKey: string | undefined;
  mapboxAccessToken: string | undefined;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
  isDevelopment: boolean;
}

/**
 * Load and validate configuration
 */
export function loadConfig(): AppConfig {
  const config: AppConfig = {
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
    weatherApiKey: import.meta.env.VITE_WEATHER_API_KEY,
    mapboxAccessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    isDevelopment: import.meta.env.DEV,
  };

  return config;
}

/**
 * Check if all required API keys are configured
 */
export function validateConfig(): { isValid: boolean; missingKeys: string[] } {
  const config = loadConfig();
  const missingKeys: string[] = [];

  if (!config.geminiApiKey) {
    missingKeys.push('VITE_GEMINI_API_KEY');
  }

  if (!config.weatherApiKey) {
    missingKeys.push('VITE_WEATHER_API_KEY');
  }

  if (!config.mapboxAccessToken) {
    missingKeys.push('VITE_MAPBOX_ACCESS_TOKEN');
  }

  if (!config.supabaseUrl) {
    missingKeys.push('VITE_SUPABASE_URL');
  }

  if (!config.supabaseAnonKey) {
    missingKeys.push('VITE_SUPABASE_ANON_KEY');
  }

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
}

/**
 * Get configuration status for debugging
 */
export function getConfigStatus(): {
  hasGeminiKey: boolean;
  hasWeatherKey: boolean;
  hasMapboxToken: boolean;
  hasSupabaseConfig: boolean;
  environment: string;
} {
  const config = loadConfig();
  
  return {
    hasGeminiKey: Boolean(config.geminiApiKey),
    hasWeatherKey: Boolean(config.weatherApiKey),
    hasMapboxToken: Boolean(config.mapboxAccessToken),
    hasSupabaseConfig: Boolean(config.supabaseUrl && config.supabaseAnonKey),
    environment: config.isDevelopment ? 'development' : 'production',
  };
}

/**
 * Example .env file content for setup
 */
export const EXAMPLE_ENV = `
# AgriConnect Environment Configuration

# Google Gemini API Key (get from https://ai.google.dev/)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# OpenWeatherMap API Key (get from https://openweathermap.org/api)
VITE_WEATHER_API_KEY=your_openweather_api_key_here

# Mapbox Access Token (get from https://mapbox.com/)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

# Supabase Configuration (get from your Supabase dashboard)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Note: The VITE_ prefix is required for Vite to expose these variables to the client
`;

export default loadConfig();