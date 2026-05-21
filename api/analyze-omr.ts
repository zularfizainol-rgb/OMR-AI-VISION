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
            text: `You are an automated OMR (Optical Mark Recognition) grading assistant. I have provided an image of a student's OMR answer sheet. Read the marked answers carefully. There are ${numQuestions} questions. Return a JSON array where each item represents a question. Each item MUST be an object with:
- "question": The number of the question.
- "answer": The letter of the marked answer ('A', 'B', 'C', 'D', 'E'). If multiple are marked, return 'ERROR'. If none are marked, return 'BLANK'.
Only return the array up to Question ${numQuestions}. Start from 1.`
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
