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

// --- Hybrid Anchor Dict (BERTScore B-CoT keyword map) ---
const HYBRID_ANCHOR_DICT = `
ANCHOR DICTIONARY (B-CoT Localization Map):
- "E choke"         = Extreme satisfaction / awe
- "I wan cry"       = Overwhelmed with joy / extreme value
- "Omo"             = Surprise / disbelief
- "Abeg"            = Polite request / urgency
- "Head dey there"  = Acknowledged quality
Use these anchors when choosing which angle to highlight in each review persona.
`;

/**
 * SABI Multi-Agent API
 * This endpoint orchestrates the User Psychology, Localization, Review, Balogun, and Agbero agents.
 */
app.post("/api/sabi/simulate", async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  const { query, mode } = req.body;

  const systemPrompt = `
${HYBRID_ANCHOR_DICT}
You are the SABI Director Agent. You lead a team of behavioral sub-agents.

TASK: Analyze the user query and generate a full behavioral intelligence report.

1. BEHAVIORAL INFERENCE:
- Analyze the query for: Emotional State, Financial Sensitivity (Lagos vs Abuja pricing context), Location Transition (Nostalgia for Abuja), and Atmosphere Preferences.
- Reasoning Perspectives: Psychology Agent (Nostalgia/Emotional), Local Context Agent (Lagos Logistics/Social Energy), Financial Agent (Value/Budget).

1a. BALOGUN (Pricing & Trust):
- Evaluate whether the vendor disclosed price upfront. Flag "DM for price" as a trust-killer (negative signal).
- Assess willingness to "bend" — does the vendor negotiate or stay firm?
- Output: "pricing_signal" ("transparent" | "obscured" | "haggling-friendly"), "trust_delta" (−1 to +1, number).

2. FIDELITY SIMULATION (Task A):
- Simulate how 3 distinct Nigerian personas would experience the recommended solution.
- Persona 1: The Analytical Critic (3-4 stars, focused on salt, portion, and "value for money").
- Persona 2: The Emotional Enthusiast (5 stars, uses Pidgin, focused on "vibes" and treatment).
- Persona 3: The Skeptical Hustler (2-3 stars, focused on speed and "not getting cheated").
- Each review MUST include:
  • "vibe_score" (1-10): how warmly the vendor greeted the customer (emojis, honorifics: "My customer," "Boss," "Dear").
  • "dialect": "genz" or "pidgin" based on linguistic register.
- Use authentic Nigerian linguistic patterns.

2a. AGBERO (Logistical Risk):
- Detect logistical friction signals: delivery rider delays, interstate transport, "what I ordered vs what I got."
- Distinguish vendor quality from delivery failures.
- Output top-level: "logistics_risk" ("low" | "medium" | "high"), "logistics_note" (brief text explanation).

3. INTELLIGENT RECS (Task B):
- Provide 2-3 specific recommendations that align with both the explicit request and the inferred behavioral state.
- For each recommendation, provide:
  • "social_proof": a social-proxy string e.g., "3 Lekki-phase-1 lifestyle influencers use this vendor → trust +40%."
  • "nostalgia_bridge": if user mentions cross-city relocation, map preference to hidden-gem equivalents in new city (one short sentence).
  • "dialect_match": "genz" or "pidgin" — dialect used in the recommendation copy.

4. NAIRAN NO-STORY METRIC (CritiqueAgent, Section 7):
- If vendor text or review contains excuse signals ("light", "data issue", "network wahala", "network problem"), flag "no_story" = true (structural trust drop, empathy gain).
- Otherwise, "no_story" = false.
- Output top-level "no_story" boolean.

5. CRITIQUE & AUTHENTICITY (Section 8):
- CritiqueAgent reviews all output for robotic tone, injects more Pidgin/slang where natural, and ensures emotional fidelity.

REQUIRED JSON OUTPUT SCHEMA:
{
  "reasoning": [
    {"agent": "Psychology", "thought": "..."},
    {"agent": "Context", "thought": "..."},
    {"agent": "Financial", "thought": "..."},
    {"agent": "Balogun", "thought": "..."},
    {"agent": "Agbero", "thought": "..."},
    {"agent": "Critique", "thought": "..."}
  ],
  "recommendations": [
    {
      "title": "...",
      "reason": "...",
      "match": "94%",
      "social_proof": "...",
      "nostalgia_bridge": "...",
      "dialect_match": "genz"
    }
  ],
  "pricing_signal": "transparent" | "obscured" | "haggling-friendly",
  "trust_delta": 0.5,
  "logistics_risk": "low" | "medium" | "high",
  "logistics_note": "...",
  "no_story": false,
  "reviews": [
    {
      "persona": "The Critic",
      "rating": 3,
      "text": "...",
      "vibe_score": 4,
      "dialect": "pidgin",
      "logistics_risk": "low" | "medium" | "high"
    }
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
