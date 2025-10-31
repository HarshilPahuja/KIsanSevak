import { supabase, Crop, CreateCropData } from './supabase';

export interface CropsQueryOptions {
  farmerName?: string;
  status?: 'active' | 'harvested' | 'failed';
  limit?: number;
  offset?: number;
}

export interface YieldPredictionData {
  predicted_yield_kg: number;
  predicted_revenue: number;
  confidence_score: number;
  prediction_metadata?: any;
}

/**
 * Create a new crop record
 */
export async function createCrop(cropData: CreateCropData): Promise<Crop> {
  try {
    const { data, error } = await supabase
      .from('crops')
      .insert([cropData])
      .select()
      .single();

    if (error) {
      console.error('Error creating crop:', error);
      throw new Error(`Failed to create crop: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in createCrop:', error);
    throw error;
  }
}

/**
 * Get crops by farmer name
 */
export async function getCropsByFarmer(farmerName: string, options: CropsQueryOptions = {}): Promise<Crop[]> {
  try {
    let query = supabase
      .from('crops')
      .select('*')
      .eq('farmer_name', farmerName)
      .order('created_at', { ascending: false });

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching crops:', error);
      throw new Error(`Failed to fetch crops: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCropsByFarmer:', error);
    throw error;
  }
}

/**
 * Get all active crops
 */
export async function getActiveCrops(options: CropsQueryOptions = {}): Promise<Crop[]> {
  try {
    let query = supabase
      .from('crops')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (options.farmerName) {
      query = query.eq('farmer_name', options.farmerName);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching active crops:', error);
      throw new Error(`Failed to fetch active crops: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveCrops:', error);
    throw error;
  }
}

/**
 * Update crop with yield prediction
 */
export async function updateCropYieldPrediction(cropId: string, yieldData: YieldPredictionData): Promise<Crop> {
  try {
    const { data, error } = await supabase
      .from('crops')
      .update({
        ...yieldData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cropId)
      .select()
      .single();

    if (error) {
      console.error('Error updating crop yield prediction:', error);
      throw new Error(`Failed to update yield prediction: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateCropYieldPrediction:', error);
    throw error;
  }
}

/**
 * Update crop status (active, harvested, failed)
 */
export async function updateCropStatus(cropId: string, status: 'active' | 'harvested' | 'failed'): Promise<Crop> {
  try {
    const { data, error } = await supabase
      .from('crops')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cropId)
      .select()
      .single();

    if (error) {
      console.error('Error updating crop status:', error);
      throw new Error(`Failed to update crop status: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateCropStatus:', error);
    throw error;
  }
}

/**
 * Delete a crop record
 */
export async function deleteCrop(cropId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('crops')
      .delete()
      .eq('id', cropId);

    if (error) {
      console.error('Error deleting crop:', error);
      throw new Error(`Failed to delete crop: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteCrop:', error);
    throw error;
  }
}

/**
 * Get crop by ID
 */
export async function getCropById(cropId: string): Promise<Crop | null> {
  try {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .eq('id', cropId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error fetching crop by ID:', error);
      throw new Error(`Failed to fetch crop: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getCropById:', error);
    throw error;
  }
}

/**
 * Get crops summary statistics
 */
export async function getCropsSummary(farmerName: string): Promise<{
  totalCrops: number;
  activeCrops: number;
  harvestedCrops: number;
  totalInvestment: number;
  totalPredictedRevenue: number;
  totalArea: number;
}> {
  try {
    const { data, error } = await supabase
      .from('crops')
      .select('status, investment_amount, predicted_revenue, detected_area_sqm, farm_area_sqm')
      .eq('farmer_name', farmerName);

    if (error) {
      console.error('Error fetching crops summary:', error);
      throw new Error(`Failed to fetch crops summary: ${error.message}`);
    }

    const crops = data || [];
    
    return {
      totalCrops: crops.length,
      activeCrops: crops.filter(c => c.status === 'active').length,
      harvestedCrops: crops.filter(c => c.status === 'harvested').length,
      totalInvestment: crops.reduce((sum, c) => sum + (c.investment_amount || 0), 0),
      totalPredictedRevenue: crops.reduce((sum, c) => sum + (c.predicted_revenue || 0), 0),
      totalArea: crops.reduce((sum, c) => sum + (c.detected_area_sqm || c.farm_area_sqm || 0), 0),
    };
  } catch (error) {
    console.error('Error in getCropsSummary:', error);
    throw error;
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('crops')
      .select('count(*)')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}