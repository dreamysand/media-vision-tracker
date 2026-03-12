
import { GoogleGenAI, Type } from "@google/genai";

export interface MediaMetadata {
  title: string;
  synopsis: string;
  genres: string[];
  globalScore: number;
  year: number;
}

/**
 * Fetches media metadata from Gemini based on a title.
 * Uses gemini-3-flash-preview for structured text metadata generation.
 */
export const fetchMediaMetadata = async (title: string): Promise<MediaMetadata | null> => {
  try {
    // CRITICAL: Initialize a new GoogleGenAI instance right before making an API call 
    // to ensure it always uses the most up-to-date API key from the execution context.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide metadata for the media titled: "${title}". Use realistic global ratings out of 10.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            synopsis: { type: Type.STRING },
            genres: { type: Type.ARRAY, items: { type: Type.STRING } },
            globalScore: { type: Type.NUMBER },
            year: { type: Type.INTEGER }
          },
          required: ["title", "synopsis", "genres", "globalScore", "year"]
        }
      }
    });

    // The text property returns the generated string output directly. Do not use text().
    const text = response.text;
    if (!text) return null;
    
    // Parse the JSON output from the model.
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Error fetching metadata from Gemini:", error);
    return null;
  }
};
