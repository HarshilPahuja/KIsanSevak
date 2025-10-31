import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface Crop {
  id: string;
  created_at: string;
  updated_at: string;
  farmer_name: string;
  crop_type: string;
  variety?: string;
  crop_details?: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  farm_area_sqm?: number;
  detected_area_sqm?: number;
  satellite_image_url?: string;
  investment_amount?: number;
  planting_date?: string;
  expected_harvest_date?: string;
  predicted_yield_kg?: number;
  predicted_revenue?: number;
  confidence_score?: number;
  status: 'active' | 'harvested' | 'failed';
  weather_data?: any;
  soil_data?: any;
  prediction_metadata?: any;
}

export interface CreateCropData {
  farmer_name: string;
  crop_type: string;
  variety?: string;
  crop_details?: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  farm_area_sqm?: number;
  detected_area_sqm?: number;
  satellite_image_url?: string;
  investment_amount?: number;
  planting_date?: string;
  expected_harvest_date?: string;
}

export default supabase;