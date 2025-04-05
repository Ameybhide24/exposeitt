const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { expressjwt: jwt } = require('express-jwt');
const jwks = require('jwks-rsa');

const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
});

// Get all approved posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'approved' })
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new post
router.post('/', jwtCheck, async (req, res) => {
    try {
        // Find user
        const user = await User.findOne({ auth0Id: req.auth.sub });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            category: req.body.category,
            user: user._id
        });

        const newPost = await post.save();
        
        // Add post to user's posts array
        user.posts.push(newPost._id);
        await user.save();

        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get a single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update post status (admin only)
router.patch('/:id/status', jwtCheck, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        post.status = req.body.status;
        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router; 