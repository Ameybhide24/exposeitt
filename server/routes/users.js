const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('express-oauth2-jwt-bearer');

// Auth0 middleware
const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

// Create or update user
router.post('/', checkJwt, async (req, res) => {
    try {
        const { email, name, picture } = req.body;
        const auth0Id = req.auth?.payload?.sub;

        console.log('Received user creation request:');
        console.log('Auth token data:', req.auth);
        console.log('Auth0 ID from token:', auth0Id);
        console.log('Request body:', { email, name, picture });

        if (!auth0Id) {
            console.error('No auth0Id found in token');
            return res.status(400).json({ 
                message: 'Invalid token: Auth0 ID is required',
                tokenData: req.auth
            });
        }

        const user = await User.findOneAndUpdate(
            { auth0Id },
            {
                auth0Id,
                email,
                name,
                picture,
                lastLogin: new Date()
            },
            { 
                upsert: true, 
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        console.log('User created/updated successfully:', user);
        res.json(user);
    } catch (err) {
        console.error('Detailed error in user creation:', err);
        console.error('Stack trace:', err.stack);
        res.status(500).json({ 
            message: 'Error creating/updating user',
            error: err.message,
            details: err.errors,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Get current user
router.get('/me', checkJwt, async (req, res) => {
    try {
        const auth0Id = req.auth?.payload?.sub;
        console.log('Fetching user profile for:', auth0Id);

        if (!auth0Id) {
            return res.status(400).json({ message: 'Invalid token: Auth0 ID is required' });
        }

        const user = await User.findOne({ auth0Id });
        if (!user) {
            console.log('User not found:', auth0Id);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User found:', user);
        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ 
            message: 'Error fetching user',
            error: err.message 
        });
    }
});

module.exports = router; 