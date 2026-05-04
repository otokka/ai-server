require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENROUTER_API_KEY;

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "OurStore AI"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content: `You are a shopping assistant for an ecommerce website.

RULES:
- Keep replies SHORT (max 2–3 lines)
- Do NOT ask too many questions
- If user asks general questions, answer briefly
- Focus mainly on helping find products in the store
- Be friendly but concise`
          },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices) {
      return res.json({ reply: "AI error: " + (data.error?.message || "Unknown error") });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error(error);
    res.json({ reply: "AI server error." });
  }
});

app.get("/", (req, res) => {
  res.send("AI Server is running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("AI Server running on port " + PORT));