const PostService = require('../services/post.service');

const PostController = {
  generatePost: async (req, res) => {
    try {
      
      const socialMediaPost = await PostService.generateSocialMediaPost(req.body);
      console.log(socialMediaPost);
      res.json({ success: true, post: socialMediaPost });
      
    } catch (error) {
      res.status(500).json({ 
        error: error.message || 'Failed to generate post' 
      });
    }
  }
};

module.exports = PostController;