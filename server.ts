import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

app.use(express.json());

/**
 * SABI Multi-Agent API
 * This endpoint orchestrates the User Psychology, Localization, and Review agents.
 */
app.post("/api/sabi/simulate", async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  const { query, mode } = req.body;

  const systemPrompt = `
    You are the SABI Director Agent. You lead a team of behavioral sub-agents.
    
    TASK: Analyze the user query and generate a full behavioral intelligence report.
    
    1. BEHAVIORAL INFERENCE:
    - Analyze the query for: Emotional State, Financial Sensitivity (Lagos vs Abuja pricing context), Location Transition (Nostalgia for Abuja), and Atmosphere Preferences.
    - Reasoning Perspectives: Psychology Agent (Nostalgia/Emotional), Local Context Agent (Lagos Logistics/Social Energy), Financial Agent (Value/Budget).
    
    2. FIDELITY SIMULATION (Task A):
    - Simulate how 3 distinct Nigerian personas would experience the recommended solution.
    - Persona 1: The Analytical Critic (3-4 stars, focused on salt, portion, and "value for money").
    - Persona 2: The Emotional Enthusiast (5 stars, uses Pidgin, focused on "vibes" and treatment).
    - Persona 3: The Skeptical Hustler (2-3 stars, focused on speed and "not getting cheated").
    - Use authentic Nigerian linguistic patterns.

    3. INTELLIGENT RECS (Task B):
    - Provide 2-3 specific recommendations that align with both the explicit request and the inferred behavioral state.

    REQUIRED JSON OUTPUT:
    {
      "reasoning": [
        {"agent": "Psychology", "thought": "..."},
        {"agent": "Context", "thought": "..."},
        {"agent": "Financial", "thought": "..."}
      ],
      "recommendations": [
        {"title": "...", "reason": "...", "match": "94%"}
      ],
      "reviews": [
        {"persona": "The Critic", "rating": 3, "text": "..."},
        {"persona": "The Vist (Enthusiast)", "rating": 5, "text": "..."},
        {"persona": "The Hustler", "rating": 4, "text": "..."}
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `${systemPrompt}\n\nUser Input: ${query || "I just relocated to Lagos. Budget is tight. I miss Abuja food. Need somewhere calm for Friday night."}`
    });
    
    const text = response.text || "";
    
    // Attempt to parse JSON, if it fails, return the raw text cleaned up
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        res.json(JSON.parse(jsonMatch[0]));
      } else {
        res.json({ raw: text });
      }
    } catch (e) {
      res.json({ raw: text });
    }
  } catch (error: any) {
    console.error("SABI Engine Error:", error);
    
    // Handle Quota Exceeded (429) gracefully
    if (error?.status === 429 || error?.message?.includes("Quota exceeded") || error?.message?.includes("429")) {
      return res.status(429).json({ 
        error: "QUOTA_EXCEEDED",
        message: "Omo, the AI is tired! Gemini quota exceeded. Please try again in 1 minute or check your Spark plan limits." 
      });
    }

    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to simulate behavioral response" });
  }
});

// Vite middleware for development
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SABI Server running on http://localhost:${PORT}`);
  });
}

setupServer();
