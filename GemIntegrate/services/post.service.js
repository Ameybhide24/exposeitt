const { textModel } = require('../config/gemini.config');

class PostService {
  static async generateSocialMediaPost(body) {
    console.log(body);
    const prompt = `
    Convert this crime report into a structured social media post with these EXACT sections:
    
    1. title: A short, attention-grabbing headline (include relevant emoji), take reference from ${body.title}
    2. category: ${body.category}
    3. location: Combine location (format: "📍 [location]") and time (format: "🕒 [time]") if available in ${body.location}
    4. content: a description of what happened. Add Any safety advice or follow-up actions. 
    Return ONLY a RAW JSON object without any markdown formatting or additional text.
    Example:
    {
      "title": "🚨 Purse Snatching Reported",
      "location": "📍 Central Park 🕒 Yesterday at 5pm",
      "content": "Two suspects in black jackets stole a woman's purse..., Avoid the area and report any suspicious activity...",
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

static async assessDescriptionRelevance(userDescription) {
  const prompt = `
  Please assess the following description for its relevance to crime reporting. 
  Respond with a JSON object containing the following field:

  1. isRelevant: "yes" if this description pertains to crime reporting, otherwise "no".

  Description: "${userDescription}"

  Response format:
  {
      "isRelevant": "yes | no"
  }
  `;

  try {
      // Call Gemini model with the constructed prompt
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
      console.log(cleanedResponse);
      return JSON.parse(cleanedResponse); // Return the assessment results
  } catch (error) {
      console.error('Error assessing description:', error);
      throw new Error('Failed to assess description relevance');
  }
}
}

module.exports = PostService;