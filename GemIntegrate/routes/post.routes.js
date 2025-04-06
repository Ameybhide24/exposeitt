const express = require('express');
const router = express.Router();
const PostController = require('../controller/post.controller');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const TranscriptionController = require('../controller/transcription.controller');
const PostService = require('../services/post.service')


router.post('/generate', (req, res) => {
      console.log("inside this");
      PostController.generatePost(req, res);
});

router.post('/transcribe-audio', upload.single("audio"), TranscriptionController.transcribeAudio);

router.post('/assess-description', async (req, res) => {
      const userDescription = req.body.description;
  
      if (!userDescription) {
          return res.status(400).json({ error: "Description is required." });
      }
  
      try {
      console.log(userDescription);
          const assessment = await PostService.assessDescriptionRelevance(userDescription);
          res.json(assessment); 
      } catch (error) {
          console.error('Error assessing description:', error);
          res.status(500).json({ error: "Failed to assess description" });
      }
  });
  
module.exports = router;