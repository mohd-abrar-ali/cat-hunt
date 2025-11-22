import { GoogleGenAI } from "@google/genai";
import { ToyConfig, ToySchema } from "../types";
import { v4 as uuidv4 } from 'uuid';

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateToyFromDescription = async (description: string): Promise<ToyConfig | null> => {
  const ai = getAI();
  if (!ai) {
    console.error("No API Key found");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a game toy configuration based on this description: "${description}". 
      It should be fun for a cat to chase on a tablet screen.
      Select the most appropriate 'visualType' from the list (mouse, fly, butterfly, beetle, laser) that matches the description. 
      If nothing matches well, use 'mouse' or 'beetle'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ToySchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    
    return {
      id: uuidv4(),
      name: data.name,
      emoji: data.emoji,
      visualType: data.visualType,
      color: data.color,
      speed: data.speed,
      size: data.size,
      movementStyle: data.movementStyle,
      isSystem: false
    };

  } catch (error) {
    console.error("Error generating toy:", error);
    return null;
  }
};