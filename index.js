const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(__dirname));
app.use(express.json());

// Security Note: In production, use environment variables for API keys
const API_KEY = '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';

// API endpoint to handle chat messages
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  const chatHistory = req.body.chatHistory || [];
  const cleanMsg = userMessage.toLowerCase();

  // Custom replies
  if (/who (made|created|developed) you/.test(cleanMsg)) {
    return res.json({ reply: "I was created by Omkar 💻" });
  }

  if (/(who|what).*built.*you|your creator|developer|origin/.test(cleanMsg)) {
    return res.json({ reply: "I was built by a passionate developer 😉" });
  }

  if (/are you made by openai|is this chatgpt|are you chatgpt/i.test(cleanMsg)) {
    return res.json({ reply: "I'm based on OpenAI tech, but customized by Omkar ✨" });
  }

  // Add user message to history
  const updatedHistory = [...chatHistory, { role: "user", content: userMessage }];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Neuron AI Chatbot"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: updatedHistory,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("API Error:", data);
      return res.status(500).json({ reply: "⚠️ Sorry, I'm having trouble processing your request." });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "I didn't get that. Could you try again?";
    return res.json({ reply });

  } catch (err) {
    console.error("❌ Server Error:", err);
    return res.status(500).json({ reply: "❌ Error reaching AI server. Please try again later." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`💡 Try opening http://localhost:${PORT} in your browser`);
});