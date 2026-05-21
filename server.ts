import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add middleware to parse large JSON (images)
  app.use(express.json({ limit: '50mb' }));

  // API endpoints
  app.post('/api/analyze-omr', async (req, res) => {
    try {
      const { imageBase64, numQuestions } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY tidak dikonfigurasi pada server.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Pass the raw base64 data to Gemini without the data URI prefix
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            text: `You are an automated OMR (Optical Mark Recognition) grading assistant. I have provided an image of a student's OMR answer sheet. Read the marked answers carefully. There are ${numQuestions} questions. Return a JSON array where each item represents a question. Each item MUST be an object with:
- "question": The number of the question.
- "answer": The letter of the marked answer ('A', 'B', 'C', 'D', 'E'). If multiple are marked, return 'ERROR'. If none are marked, return 'BLANK'.
Only return the array up to Question ${numQuestions}. Start from 1.`
          },
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg'
            }
          }
        ],
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
        throw new Error('Tiada respons daripada model AI');
      }

      const results = JSON.parse(resultsText);
      res.json({ results });
    } catch (error: any) {
      console.error('Error analyzing OMR:', error);
      res.status(500).json({ error: error.message || 'Gagal menganalisis gambar OMR' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
