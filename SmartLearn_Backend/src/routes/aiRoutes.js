import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" }); // or gemini-1.5-pro

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const result = await model.generateContent(message);
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Something went wrong with Gemini API" });
  }
});

export default router;
