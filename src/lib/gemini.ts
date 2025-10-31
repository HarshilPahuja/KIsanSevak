import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;


if (!API_KEY) {
  console.error("Gemini API key is not configured");
  throw new Error("Gemini API key is not configured. Please check your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Function to convert file to generative part for Gemini
function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Function to convert base64 image to generative part
function base64ToGenerativePart(base64String: string, mimeType: string = "image/jpeg") {
  // Remove data URL prefix if present
  const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
  
  return {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };
}

// Text-only chat function
export async function sendTextMessage(message: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Add agricultural context to the message
    const agriculturalContext = `
      You are an AI assistant specialized in agriculture and farming.
      Respond briefly and practically like a farmer-to-farmer conversation.
      Do NOT use Markdown, asterisks, bullet points, or formatting symbols.
      Your reply must be in plain text only, in a single paragraph.

User message: ${message}`;


    const result = await model.generateContent(agriculturalContext);
    const response = await result.response;
    const responseText = response.text();
    return responseText;
  } catch (error) {
    console.error("Detailed error sending text message to Gemini:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Provide more specific error messages
    if (error.message?.includes('API key')) {
      throw new Error("Invalid API key. Please check your Gemini API key.");
    } else if (error.message?.includes('quota')) {
      throw new Error("API quota exceeded. Please try again later.");
    } else if (error.message?.includes('blocked')) {
      throw new Error("Request was blocked. Please rephrase your message.");
    } else {
      throw new Error(`AI Error: ${error.message || 'Failed to get response from AI assistant. Please try again.'}`);
    }
  }
}

// Image analysis function
export async function analyzeImage(imageBase64: string, additionalText?: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Detect mime type from base64 string
    let mimeType = "image/jpeg";
    if (imageBase64.includes("data:image/")) {
      const mimeMatch = imageBase64.match(/data:image\/([^;]+)/);
      if (mimeMatch) {
        mimeType = `image/${mimeMatch[1]}`;
      }
    }
    
    const imagePart = base64ToGenerativePart(imageBase64, mimeType);
    
    // 👇 Updated plain-text prompt
    const prompt = additionalText
      ? `
        You are an agricultural expert AI assistant.
        Analyze this crop or plant image for any diseases, pests, nutrient deficiencies, or other visible problems.
        Provide clear, short, and practical farming advice based on what you see.
        Also respond to this additional question: ${additionalText}.
        Respond in plain text only — no Markdown, symbols, or bullet points. Keep it concise, one paragraph maximum.
      `
      : `
        You are an agricultural expert AI assistant.
        Analyze this crop or plant image for any diseases, pests, nutrient deficiencies, or other visible problems.
        Identify the plant or crop if possible and provide simple farming advice or treatment suggestions.
        Respond in plain text only — no Markdown, symbols, or bullet points. Keep it concise, one paragraph maximum.
      `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const responseText = response.text();
    return responseText;
  } catch (error) {
    console.error("Detailed error analyzing image with Gemini:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Provide more specific error messages
    if (error.message?.includes('API key')) {
      throw new Error("Invalid API key. Please check your Gemini API key.");
    } else if (error.message?.includes('quota')) {
      throw new Error("API quota exceeded. Please try again later.");
    } else if (error.message?.includes('blocked')) {
      throw new Error("Image content was blocked. Please try a different image.");
    } else {
      throw new Error(`Image Analysis Error: ${error.message || 'Failed to analyze the image. Please try again.'}`);
    }
  }
}

// Combined function for text + image
export async function sendMessageWithImage(text: string, imageBase64: string): Promise<string> {
  try {
    return await analyzeImage(imageBase64, text);
  } catch (error) {
    console.error("Error sending message with image to Gemini:", error);
    throw new Error("Failed to process your message and image. Please try again.");
  }
}