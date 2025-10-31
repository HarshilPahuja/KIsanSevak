import { analyzeImage } from './gemini';

export interface AreaDetectionResult {
  detectedAreaSqm: number;
  confidence: number;
  cropType?: string;
  description: string;
  boundingBox?: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
}

export interface AreaDetectionOptions {
  imageBase64: string;
  expectedCropType?: string;
  farmAreaHint?: number; // User-provided area in sqm as hint
  latitude?: number;
  longitude?: number;
}

/**
 * Detect crop area from satellite image using Gemini Vision
 */
export async function detectCropAreaFromSatellite(options: AreaDetectionOptions): Promise<AreaDetectionResult> {
  const { imageBase64, expectedCropType, farmAreaHint, latitude, longitude } = options;

  try {
    // Build comprehensive prompt for area detection
    const prompt = buildAreaDetectionPrompt(expectedCropType, farmAreaHint, latitude, longitude);
    
    // Analyze image with Gemini
    const aiResponse = await analyzeImage(imageBase64, prompt);
    
    // Parse the response
    const result = parseAreaDetectionResponse(aiResponse, farmAreaHint);
    
    return result;
  } catch (error) {
    console.error('Error in crop area detection:', error);
    throw new Error(`Failed to detect crop area: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build structured prompt for Gemini area detection
 */
function buildAreaDetectionPrompt(expectedCropType?: string, farmAreaHint?: number, latitude?: number, longitude?: number): string {
  const cropInfo = expectedCropType ? `Expected crop type: ${expectedCropType}` : 'Crop type: Unknown';
  const areaInfo = farmAreaHint ? `Approximate farm area hint: ${farmAreaHint} square meters` : '';
  const locationInfo = latitude && longitude ? `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : '';

  return `You are an agricultural AI expert analyzing a satellite image to detect crop areas. Please analyze this satellite/aerial image and provide crop area measurements.

TASK: Detect and measure cultivated crop areas in this satellite image.

IMAGE CONTEXT:
${cropInfo}
${areaInfo}
${locationInfo}

ANALYSIS REQUIREMENTS:
1. Identify all visible cultivated/agricultural areas (fields, plots, crop areas)
2. Distinguish between crops and other features (buildings, roads, water, forest, bare land)
3. Estimate the total cultivated area in square meters
4. Provide confidence level (0.0 to 1.0)
5. Identify crop type if possible
6. Describe what you see

RESPONSE FORMAT (JSON only):
{
  "detectedAreaSqm": number,
  "confidence": number,
  "cropType": "string or null",
  "description": "detailed description of what you see",
  "boundingBox": {
    "topLeft": {"x": number, "y": number},
    "topRight": {"x": number, "y": number},
    "bottomLeft": {"x": number, "y": number},
    "bottomRight": {"x": number, "y": number}
  }
}

MEASUREMENT GUIDELINES:
- Use pixel analysis to estimate area relative to image dimensions
- Consider typical field sizes for the region
- Factor in image resolution and zoom level
- Account for partial field visibility
- Be conservative in measurements if uncertain

IMPORTANT: Respond ONLY with valid JSON. No additional text or explanations outside the JSON.`;
}

/**
 * Parse Gemini response and extract area detection data
 */
function parseAreaDetectionResponse(aiResponse: string, farmAreaHint?: number): AreaDetectionResult {
  try {
    // Try to extract JSON from the response
    let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      // Try to find JSON in code blocks
      jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the response
      const result: AreaDetectionResult = {
        detectedAreaSqm: Math.max(0, Number(parsed.detectedAreaSqm) || 0),
        confidence: Math.min(1.0, Math.max(0.0, Number(parsed.confidence) || 0.5)),
        cropType: parsed.cropType || undefined,
        description: parsed.description || 'Area detected from satellite image',
        boundingBox: parsed.boundingBox || undefined,
      };

      // Apply some validation and fallbacks
      if (result.detectedAreaSqm === 0 && farmAreaHint) {
        result.detectedAreaSqm = farmAreaHint * 0.8; // Conservative estimate
        result.confidence = 0.3; // Low confidence fallback
        result.description += ' (Fallback estimate based on user input)';
      }

      return result;
    }
  } catch (parseError) {
    console.error('Error parsing area detection response:', parseError);
  }

  // Fallback parsing - extract numbers from text
  return parseUnstructuredAreaResponse(aiResponse, farmAreaHint);
}

/**
 * Fallback parser for unstructured responses
 */
function parseUnstructuredAreaResponse(response: string, farmAreaHint?: number): AreaDetectionResult {
  // Look for area measurements in the text
  const areaPatterns = [
    /(\d+(?:\.\d+)?)\s*(?:square\s*)?(?:meters?|m²|sqm)/gi,
    /area[:\s]*(\d+(?:\.\d+)?)/gi,
    /(\d+(?:\.\d+)?)\s*hectares?/gi,
  ];

  let detectedAreaSqm = 0;
  let confidence = 0.3;

  for (const pattern of areaPatterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      let area = parseFloat(match[1]);
      
      // Convert hectares to square meters if needed
      if (match[0].toLowerCase().includes('hectare')) {
        area *= 10000; // 1 hectare = 10,000 sqm
      }
      
      if (area > 0) {
        detectedAreaSqm = Math.max(detectedAreaSqm, area);
        confidence = 0.4;
        break;
      }
    }
    if (detectedAreaSqm > 0) break;
  }

  // Final fallback
  if (detectedAreaSqm === 0 && farmAreaHint) {
    detectedAreaSqm = farmAreaHint * 0.8;
    confidence = 0.2;
  }

  // Look for crop type mentions
  const cropTypes = ['rice', 'wheat', 'corn', 'maize', 'tomato', 'potato', 'onion', 'beans', 'peas', 'spinach', 'lettuce', 'carrots', 'cucumber', 'pepper', 'eggplant'];
  let detectedCropType: string | undefined;
  
  for (const crop of cropTypes) {
    if (response.toLowerCase().includes(crop)) {
      detectedCropType = crop.charAt(0).toUpperCase() + crop.slice(1);
      break;
    }
  }

  return {
    detectedAreaSqm: Math.round(detectedAreaSqm),
    confidence: Math.round(confidence * 100) / 100,
    cropType: detectedCropType,
    description: `Estimated crop area from satellite analysis. ${response.substring(0, 200)}...`,
  };
}

/**
 * Validate area detection result
 */
export function validateAreaDetection(result: AreaDetectionResult, maxReasonableArea: number = 100000): AreaDetectionResult {
  // Cap the area at reasonable limits (10 hectares = 100,000 sqm)
  if (result.detectedAreaSqm > maxReasonableArea) {
    result.detectedAreaSqm = maxReasonableArea;
    result.confidence = Math.min(result.confidence, 0.5);
    result.description += ' (Area capped at maximum reasonable size)';
  }

  // Minimum area check
  if (result.detectedAreaSqm < 10) {
    result.confidence = Math.min(result.confidence, 0.3);
    result.description += ' (Very small area detected, low confidence)';
  }

  return result;
}