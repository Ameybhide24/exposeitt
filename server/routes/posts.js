const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth } = require('express-oauth2-jwt-bearer');

// Auth0 middleware
const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

// Get all approved posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'approved' })
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error('Error fetching approved posts:', err);
        res.status(500).json({ message: err.message });
    }
});

// Create a new post
router.post('/', checkJwt, async (req, res) => {
    try {
        const { title, content, category, authorName, authorEmail } = req.body;
        const userId = req.auth?.payload?.sub;  // Access sub from payload

        console.log('Creating new post:');
        console.log('Auth token data:', req.auth);
        console.log('User ID from token:', userId);
        console.log('Request body:', { title, category, authorName, authorEmail });

        if (!userId) {
            return res.status(400).json({ 
                message: 'Invalid token: User ID is required',
                tokenData: req.auth
            });
        }

        const post = new Post({
            title,
            content,
            category,
            userId,
            authorName,
            authorEmail
        });

        console.log('Saving post with data:', post);
        const newPost = await post.save();
        console.log('Post created successfully:', newPost);
        
        res.status(201).json(newPost);
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(400).json({ 
            message: 'Error creating post',
            error: err.message,
            details: err.errors 
        });
    }
});

// Get user's posts
router.get('/my-posts', checkJwt, async (req, res) => {
    try {
        const userId = req.auth?.payload?.sub;  // Access sub from payload
        console.log('Fetching posts for user:', userId);

        if (!userId) {
            return res.status(400).json({ message: 'Invalid token: User ID is required' });
        }

        const posts = await Post.find({ userId })
            .sort({ createdAt: -1 });
        
        console.log(`Found ${posts.length} posts for user`);
        res.json(posts);
    } catch (err) {
        console.error('Error fetching user posts:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get a single post
router.get('/:id', checkJwt, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if the id parameter is 'user' and return appropriate error
        if (id === 'user') {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Only allow access if user is the author or post is approved
        if (post.userId !== req.auth?.payload?.sub && post.status !== 'approved') {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(post);
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).json({ message: err.message });
    }
});

// Update post status (admin only)
router.patch('/:id/status', checkJwt, async (req, res) => {
    try {
        // TODO: Add admin check here
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        post.status = req.body.status;
        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (err) {
        console.error('Error updating post status:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router; 