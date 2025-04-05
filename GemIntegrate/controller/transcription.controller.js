const fs = require("fs");
const path = require("path");
const { textModel } = require("../config/gemini.config");
const PostService = require("../services/post.service");

const TranscriptionController = {
    transcribeAudio: async (req, res) => {
        try {
            const audioFilePath = req.file.path;
            const audioBuffer = fs.readFileSync(audioFilePath);
            const audioBase64 = audioBuffer.toString("base64");

            const result = await textModel.generateContent({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                inlineData: {
                                    mimeType: req.file.mimetype, // Adjust this for the audio format
                                    data: audioBase64,
                                },
                            },
                            { 
                                text: `Transcribe this audio into clean readable English while including the following sections: 
                                - title: A short, attention-grabbing headline relevant to the content.
                                - category: The category of the incident.
                                - location: Combine location (format: "📍 [location]") and time (format: "🕒 [time]") if mentioned.
                                - description: A detailed description of what happened, including any safety advice or follow-up actions.
                                
                                Please format the response as a JSON object with only these fields and without any additional information.
                                
                                Example output format:
                                {
                                    "title": "🚨 Event Title",
                                    "category": "Category Name",
                                    "location": "📍 Event Location 🕒 Time",
                                    "description": "Detailed description of the event."
                                }`
                            },
                        ],
                    },
                ],
            });

            const response = await result.response;
            const transcript = response.text();

            // Clean and parse the JSON from the transcript string
            const cleanedTranscript = transcript
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            
            let structuredData;
            try {
                structuredData = JSON.parse(cleanedTranscript); // Parse the cleaned JSON
            } catch (error) {
                console.error('Failed to parse transcript JSON:', error);
                return res.status(500).json({ error: 'Error parsing the transcript' });
            }

            // Call the PostService to generate a social media post
            const socialPost = await PostService.generateSocialMediaPost(structuredData);
            
            res.json({ success: true, post: socialPost, transcript: structuredData });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Audio transcription failed" });
        } finally {
            // Cleanup: Remove the temporarily uploaded audio file
            fs.unlinkSync(req.file.path);
        }
    },
};

module.exports = TranscriptionController;