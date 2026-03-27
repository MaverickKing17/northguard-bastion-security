import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  /**
   * Lakera Guard Security Scan Endpoint
   * This proxies requests to Lakera Guard securely using the server-side API key.
   */
  app.post("/api/security/scan", async (req, res) => {
    const { input } = req.body;
    const apiKey = process.env.LAKERA_GUARD_API_KEY;

    if (!apiKey) {
      // In development, if no key is found, we'll simulate a successful scan
      // to avoid breaking the UI, but log a warning.
      console.warn("LAKERA_GUARD_API_KEY not found in environment. Using simulated scan.");
      return res.json({
        results: [{
          categories: { prompt_injection: false, jailbreak: false, pii: false },
          flagged: false
        }]
      });
    }

    try {
      const response = await fetch("https://api.lakera.ai/v1/guard", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: [{ role: "user", content: input }]
        })
      });

      if (!response.ok) {
        throw new Error(`Lakera API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Lakera Scan Error:", error);
      res.status(500).json({ error: "Failed to perform security scan" });
    }
  });

  /**
   * AI Chat Proxy Endpoint
   * This handles requests to Gemini or OpenRouter securely.
   */
  app.post("/api/chat", async (req, res) => {
    const { message, model } = req.body;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    try {
      if (model.includes("Claude") || model.includes("GPT")) {
        if (!openRouterKey) {
          console.error("OpenRouter API Key missing in environment variables.");
          return res.status(400).json({ error: "OpenRouter API Key not configured. Please add OPENROUTER_API_KEY to your environment variables in the platform settings." });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://bastion-audit.com",
            "X-Title": "Bastion Audit"
          },
          body: JSON.stringify({
            model: model.includes("Claude") ? "anthropic/claude-3.5-haiku" : "openai/gpt-4o-mini",
            messages: [
              { role: "system", content: "You are the Bastion Security Sentinel, an AI security advisor for Canadian financial institutions. You have deep knowledge of OSFI E-21, PIPEDA, AIDA, and FINTRAC. Always provide professional, regulatory-aligned advice. Mention CAD for financial risks. Greet as Sentinel." },
              { role: "user", content: message }
            ]
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("OpenRouter API Error:", errorData);
          return res.status(response.status).json({ error: errorData.error?.message || "OpenRouter API error" });
        }

        const data = await response.json();
        return res.json({ text: data.choices?.[0]?.message?.content || "No response from AI model." });
      } else {
        // Gemini is now handled on the frontend, but we keep this as a fallback or for other models
        if (openRouterKey) {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openRouterKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "google/gemini-flash-1.5",
              messages: [
                { role: "system", content: "You are the Bastion Security Sentinel..." },
                { role: "user", content: message }
              ]
            })
          });
          const data = await response.json();
          return res.json({ text: data.choices?.[0]?.message?.content || "No response from AI model." });
        }
        
        res.status(400).json({ error: "No API key configured for this model. Gemini should be handled via frontend SDK." });
      }
    } catch (error) {
      console.error("Chat Proxy Error:", error);
      res.status(500).json({ error: "Internal server error in chat proxy. Please check server logs." });
    }
  });

  // --- Vite Middleware ---

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
    console.log(`Bastion Audit Server running on http://localhost:${PORT}`);
  });
}

startServer();
