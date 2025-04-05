const express = require('express');
const router = express.Router();
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

// Create or update user on login/signup
router.post('/sync', jwtCheck, async (req, res) => {
    try {
        const { sub, email, name, picture } = req.body;

        // Try to find existing user
        let user = await User.findOne({ auth0Id: sub });

        if (user) {
            // Update existing user
            user.lastLogin = new Date();
            if (email) user.email = email;
            if (name) user.name = name;
            if (picture) user.picture = picture;
            await user.save();
        } else {
            // Create new user
            user = new User({
                auth0Id: sub,
                email,
                name,
                picture
            });
            await user.save();
        }

        res.json(user);
    } catch (err) {
        console.error('Error syncing user:', err);
        res.status(500).json({ message: 'Error syncing user data' });
    }
});

// Get user profile
router.get('/profile', jwtCheck, async (req, res) => {
    try {
        const user = await User.findOne({ auth0Id: req.auth.sub })
            .populate('posts');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

// Get user's posts
router.get('/posts', jwtCheck, async (req, res) => {
    try {
        const user = await User.findOne({ auth0Id: req.auth.sub });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 });
        
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user posts' });
    }
});

module.exports = router; 