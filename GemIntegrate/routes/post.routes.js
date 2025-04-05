const express = require('express');
const router = express.Router();
const PostController = require('../controller/post.controller');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const TranscriptionController = require('../controller/transcription.controller');


router.post('/generate', (req, res) => {
      console.log("inside this");
      PostController.generatePost(req, res);
});

router.post('/transcribe-audio', upload.single("audio"), TranscriptionController.transcribeAudio);


module.exports = router;