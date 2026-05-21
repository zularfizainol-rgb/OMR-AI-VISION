import { GoogleGenAI, Type } from "@google/genai";

// Konfigurasi ini khusus untuk Vercel untuk membenarkan saiz fail gambar yang lebih besar (50MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64, numQuestions } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY tidak dikonfigurasi pada server." });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [
          {
            text: `Extract marked multiple-choice answers from the provided cropped image representing an OMR sheet. There are ${numQuestions} questions. Return ONLY a JSON array. For each question 1 to ${numQuestions}, provide the 'question' number and the 'answer' ('A', 'B', 'C', 'D', 'E', 'BLANK', or 'ERROR' for multiple).`
          },
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg"
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.INTEGER, description: "Question number" },
              answer: { type: Type.STRING, description: "Answer letter, 'BLANK', or 'ERROR'" }
            },
            required: ["question", "answer"]
          }
        }
      }
    });
    
    const resultsText = response.text;
    if (!resultsText) {
      throw new Error("Tiada respons daripada model AI");
    }

    const results = JSON.parse(resultsText);
    res.status(200).json({ results });
  } catch (error: any) {
    console.error("Error analyzing OMR:", error);
    res.status(500).json({ error: error.message || "Gagal menganalisis gambar OMR" });
  }
}
