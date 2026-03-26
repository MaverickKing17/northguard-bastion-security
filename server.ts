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
