const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log(process.env.GEMINI_API_KEY);

const textModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

module.exports = {
  textModel,
  visionModel,
};