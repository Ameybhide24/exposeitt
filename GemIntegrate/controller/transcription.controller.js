// controller/transcription.controller.js
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
                  mimeType: req.file.mimetype, // adjust if you're using mp3/wav
                  data: audioBase64,
                },
              },
              { text: "Transcribe this audio into clean readable English." },
            ],
          },
        ],
      });

      const response = await result.response;
      const transcript = response.text();

      // Use existing pipeline to generate post
      const socialPost = await PostService.generateSocialMediaPost(transcript);
      res.json({ success: true, post: socialPost, transcript });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Audio transcription failed" });
    } finally {
      // cleanup
      fs.unlinkSync(req.file.path);
    }
  },
};

module.exports = TranscriptionController;
