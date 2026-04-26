const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ OpenRouter endpoint
const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";

app.post("/api/gemini", async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "OpenRouter API key missing" });
    }

    // 🔥 Extract prompt from frontend body
    const userText =
      req.body?.contents?.[0]?.parts?.[0]?.text || "Hello";

    const response = await fetch(OPENROUTER_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // optional
        "X-Title": "TalentScout AI", // optional
      },
      body: JSON.stringify({
        model: "openrouter/auto", // ✅ free model
        messages: [
          {
            role: "user",
            content: userText,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "OpenRouter failed",
      });
    }

    // 🔥 Convert response → Gemini-like format (no frontend change needed)
    const formatted = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: data.choices?.[0]?.message?.content || "",
              },
            ],
          },
        },
      ],
    };

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(8000, () =>
  console.log("✅ OpenRouter backend running at http://localhost:8000")
);

app.get("/", (_, res) => {
  res.send("Backend is running 🚀");
});

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});