const PostService = require('../services/post.service');

const PostController = {
  generatePost: async (req, res) => {
    try {
      const { description } = req.body;
      
      if (!description || description.trim().length < 10) {
        return res.status(400).json({ 
          error: 'Description must be at least 10 characters long' 
        });
      }

      const socialMediaPost = await PostService.generateSocialMediaPost(description);
      res.json({ success: true, post: socialMediaPost });
      
    } catch (error) {
      res.status(500).json({ 
        error: error.message || 'Failed to generate post' 
      });
    }
  }
};

module.exports = PostController;