const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const { GoogleGenerativeAI } = require("@google/generative-ai");

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Express Server!");
});

app.post("/api/data", async (req, res) => {
  const { language, topic } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 10000,
    responseMimeType: "application/json",
  };

  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  try {
    const result = await chatSession.sendMessage(
      `Generate a structured response in JSON format for notes on the topic "${topic}" in the "${language}" language. 
      The response should have the following structure:
      {
        "title": "Title of the Notes",
        "topics": [
          {
            "name": "Section Title",
            "points": ["Point 1", "Point 2", "..."],
            "code": "Optional code snippet (if applicable)"
          },
          ...
        ]
      }
      Provide the data only in this structure, no additional explanations or context.`
    );

    const rawResponse = JSON.parse(result.response.text());
    res.json(rawResponse);
  } catch (error) {
    console.error("Error generating notes:", error);
    res.status(500).json({ error: "Failed to generate notes." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
