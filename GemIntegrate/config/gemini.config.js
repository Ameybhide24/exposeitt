const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

module.exports = {
  textModel,
  visionModel,
};