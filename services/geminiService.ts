
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export const processPixelArt = async (
  base64Image: string, 
  userPrompt: string = "",
  strength: number = 2,
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1"
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Define explicit grid sizes and hardware constraints for Gemini
  // These specific resolutions help the model understand the "chunky" requirement
  const hardwareProfiles = [
    {
      name: "32-bit High Resolution",
      desc: "Detailed 128x128 grid style. Sharp edges, rich color palette, subtle dithering, professional arcade game aesthetic.",
    },
    {
      name: "16-bit Console Style",
      desc: "64x64 grid style. Restricted color palette (max 64 colors), visible checkerboard dithering, SNES/Genesis aesthetic.",
    },
    {
      name: "8-bit Home Computer",
      desc: "32x32 grid style. Highly restricted 16-color palette, chunky pixels, simplified silhouettes, NES/C64 aesthetic.",
    },
    {
      name: "Vintage 4-bit Handheld",
      desc: "16x16 or 24x24 grid style. 4-tone monochrome or highly limited color, massive chunky blocks, minimalist Atari/GameBoy aesthetic."
    }
  ];

  const profile = hardwareProfiles[strength - 1] || hardwareProfiles[1];
  
  const systemPrompt = `ACT AS A MASTER PIXEL ARTIST.
Transform the input image into AUTHENTIC pixel art.

TARGET HARDWARE: ${profile.name}
TECHNICAL SPECS: ${profile.desc}

STRICT GUIDELINES:
1. SHARP EDGES: Absolutely NO anti-aliasing or blurry gradients. Every pixel must be a solid, distinct square.
2. COLOR INDEXING: Quantize colors into a limited, retro-style palette. No smooth photographic gradients.
3. GRID ALIGNMENT: The output must appear as if drawn on a fixed coordinate grid.
4. SPRITE SILHOUETTE: Simplify complex forms into clear, readable game-style icons or sprites.
5. NO DOWNSCALED PHOTO LOOK: Do not just make a low-resolution photo. Create a stylized piece of digital art that looks hand-placed.
6. Use classic dithering patterns for shading instead of transparency or fades.`;

  const fullPrompt = userPrompt 
    ? `${systemPrompt} \nUSER MODIFICATION: ${userPrompt}`
    : systemPrompt;

  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { 
      parts: [
        { text: fullPrompt },
        imagePart
      ] 
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio
      }
    }
  });

  if (!response.candidates?.[0]?.content?.parts) {
    throw new Error("The AI engine failed to generate the pixel data. Please try a different image.");
  }

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No pixel data returned. The prompt might be too restrictive or the image too complex.");
};
