const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth } = require('express-oauth2-jwt-bearer');
const crypto = require('crypto');

// Auth0 middleware
const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

// Helper function to generate consistent anonymous ID
const generateAnonymousId = (userId) => {
    const hash = crypto.createHash('sha256').update(userId).digest('hex');
    return hash.substring(0, 8); // Take first 8 characters for shorter ID
};

// Get feed (all posts with anonymized user data) - Public route
router.get('/feed', async (req, res) => {
    try {
        console.log('Fetching feed posts');
        const posts = await Post.find({})
            .sort({ createdAt: -1 });

        console.log(`Found ${posts.length} posts for feed`);

        // Anonymize user data
        const anonymizedPosts = posts.map(post => {
            const anonymousId = generateAnonymousId(post.userId);
            return {
                ...post.toObject({ getters: true }),
                authorName: `Anonymous User ${anonymousId}`,
                authorEmail: undefined, // Remove email for privacy
                userId: undefined // Remove actual userId for privacy
            };
        });

        res.json(anonymizedPosts);
    } catch (err) {
        console.error('Error fetching feed:', err);
        res.status(500).json({ message: err.message });
    }
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
        const { title, content, category, location, authorName, authorEmail } = req.body;
        const userId = req.auth?.payload?.sub;  // Access sub from payload

        console.log('Creating new post:');
        console.log('Auth token data:', req.auth);
        console.log('User ID from token:', userId);
        console.log('Request body:', { title, category, location, authorName, authorEmail });

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
            location,
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