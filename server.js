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
            content: `You are a friendly shopping assistant for OurStore.

OUR PRODUCTS: Wireless Headphones ₹2500, Smart Watch ₹4000, Running Shoes ₹3200, Handbag ₹1800, Men's Watch ₹4000, Car Edition Watch ₹7500, Men's Outfits ₹5000, Men's Formal Outfits ₹8000, Sneaker Shoes ₹3500, Men's Shoes ₹4500, Women's Casual Outfits ₹5499, Women's Formal Outfits ₹8499, Women's Bags ₹1500, Levi Bags ₹2500, Necklace ₹1250, Diamond Necklace ₹12500.

RULES:
- Keep ALL replies to maximum 2 lines
- For greetings like "hello" → reply friendly in 1 line
- NEVER ask follow up questions
- If user asks for something we sell → say "We have [product] for ₹[price]! Check it out below"
- If user asks for something we DON'T sell → ALWAYS start with "Sorry, we don't have that in our store!" then say "But you can find it on <a href='https://www.amazon.in/s?k=[product]' target='_blank'>Amazon</a> or <a href='https://www.flipkart.com/search?q=[product]' target='_blank'>Flipkart</a>!"
- Replace [product] with the actual product name in the URL
- Never give long responses`
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