const { textModel } = require('../config/gemini.config');

class PostService {
  static async generateSocialMediaPost(body) {
    console.log(body);
    const prompt = `
    Convert this crime report into a structured social media post with these EXACT sections:
    
    1. heading: A short, attention-grabbing headline (include relevant emoji), take reference from ${body.title}
    2. category: ${body.category}
    3. locationTime: Combine location (format: "📍 [location]") and time (format: "🕒 [time]") if available in ${body.location}
    4. summary: 2-3 sentence description of what happened
    5. additionalInfo: Any safety advice or follow-up actions
    
    Return ONLY a RAW JSON object without any markdown formatting or additional text.
    Example:
    {
      "heading": "🚨 Purse Snatching Reported",
      "locationTime": "📍 Central Park 🕒 Yesterday at 5pm",
      "summary": "Two suspects in black jackets stole a woman's purse...",
      "additionalInfo": "Avoid the area and report any suspicious activity."
    }

    Crime description: ${body.description}
    `;

    try {
      const result = await textModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      
      const response = await result.response;
      const text = response.text();
      
      // Clean the response before parsing
      const cleanedResponse = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        responseText: error.response?.text(),
        stack: error.stack
      });
      throw new Error('Failed to process the crime report');
    }
  }
}

module.exports = PostService;