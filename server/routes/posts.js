const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth } = require('express-oauth2-jwt-bearer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Police department email mapping (you should expand this based on your needs)
const getPoliceDepartmentEmail = (location) => {
    // This is a simplified example - you should implement proper location-based mapping
    const locationMap = {
        'Pune': 'pune.police@example.com',
        'Mumbai': 'mumbai.police@example.com',
        // Add more mappings as needed
        'default': 'police.department@example.com'
    };

    // Extract city name from location (implement more sophisticated parsing as needed)
    const city = location.split(',')[0].trim();
    return locationMap[city] || locationMap.default;
};

// Get feed (all posts with anonymized user data) - Public route
// router.get('/feed', async (req, res) => {
//     try {
//         console.log('Fetching feed posts');
//         const posts = await Post.find({})
//             .sort({ createdAt: -1 });

//         console.log(`Found ${posts.length} posts for feed`);

//         // Anonymize user data
//         const anonymizedPosts = posts.map(post => {
//             const anonymousId = generateAnonymousId(post.userId);
//             return {
//                 ...post.toObject({ getters: true }),
//                 authorName: `Anonymous User ${anonymousId}`,
//                 authorEmail: undefined, // Remove email for privacy
//                 userId: undefined // Remove actual userId for privacy
//             };
//         });

//         res.json(anonymizedPosts);
//     } catch (err) {
//         console.error('Error fetching feed:', err);
//         res.status(500).json({ message: err.message });
//     }
// });


const axios = require('axios');

const randomNames = [
    'Gotham', 'Metropolis', 'Atlantis', 'Hogwarts', 'Narnia', 'Wakanda',
    'Springfield', 'Rivendell', 'Asgard', 'Pandora', 'Zion', 'Neverland'
];

// Helper function to get a random name
const getRandomName = () => {
    const randomIndex = Math.floor(Math.random() * randomNames.length);
    return randomNames[randomIndex];
};

// Helper function to generate a 4-digit random number
const getRandomNumber = () => {
    return Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
};
router.get('/feed', async (req, res) => {
    try {
        console.log('Fetching feed posts');
        const posts = await Post.find({}).sort({ createdAt: -1 });
        console.log(`Found ${posts.length} posts for feed`);

        // Anonymize user data using Midnight API
        const anonymizedPosts = await Promise.all(
            posts.map(async (post) => {
                try {
                    // Generate a unique salt for the user
                    // const salt = generateSaltForUser(post.userId);
                    // const consistencyCheck = transientCommit('PostType', post.content + salt, BigInt(0)); // Use appropriate CompactType and opening value

                    // Call Midnight API to anonymize user data
                    const response = await axios.post('https://rpc.testnet-02.midnight.network/', {
                        jsonrpc: "2.0",
                        method: "system_chain", // Hypothetical method for anonymization
                        params: [], // Include salt for uniqueness
                        id: 1
                    });

                    // Retrieve a unique identifier from the response
                    console.log('Midnight API Response:', response.data);
                    const anonymousId = response.data.result.anonymousId ;
                    const randomName = getRandomName();
                    const randomNumber = getRandomNumber();
                    // const uniqueHash = generateUniqueHash(post.userId + anonymousId);
                    return {
                        ...post.toObject({ getters: true }),
                        authorName: `${randomName}-${randomNumber}`, // Add unique ID
                        authorEmail: undefined, // Remove email for privacy
                        userId: undefined // Remove actual userId for privacy
                    };
                } catch (error) {
                    console.error('Error anonymizing user with Midnight API:', error);
                    return {
                        ...post.toObject({ getters: true }),
                        authorName: 'Anonymous- user',
                        authorEmail: undefined,
                        userId: undefined
                    };
                }
            })
        );

        res.json(enrichedPosts);
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

// Report post to authorities
router.patch('/:id/report-to-authorities', checkJwt, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Verify that the user is the owner of the post
        if (post.userId !== req.auth?.payload?.sub) {
            return res.status(403).json({ message: 'Not authorized to report this post' });
        }

        // Update the post status to reported
        post.status = 'reported';
        const updatedPost = await post.save();
        
        res.json({
            message: 'Post has been reported to authorities',
            post: updatedPost
        });
    } catch (err) {
        console.error('Error reporting post to authorities:', err);
        res.status(500).json({ message: 'Failed to report post to authorities' });
    }
});

// Upvote a post
router.post('/upvote/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error upvoting post' });
  }
});

// Downvote a post
router.post('/downvote/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { downvotes: 1 } },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error downvoting post' });
  }
});


// Notify authorities via email
router.post('/:id/notify-authorities', checkJwt, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Verify that the user is the owner of the post
        if (post.userId !== req.auth?.payload?.sub) {
            return res.status(403).json({ message: 'Not authorized to report this post' });
        }

        // Get police department email based on location
        const policeEmail = getPoliceDepartmentEmail(post.location);

        // Prepare email content
        const emailContent = {
            from: process.env.EMAIL_USER,
            to: policeEmail,
            subject: `Anonymous Incident Report: ${post.category}`,
            html: `
                <h2>Anonymous Incident Report</h2>
                <p><strong>Category:</strong> ${post.category}</p>
                <p><strong>Location:</strong> ${post.location}</p>
                <p><strong>Date Reported:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Incident Details:</strong></p>
                <p>${post.content}</p>
                <hr>
                <p><em>This is an automated report from the WhistleBlower platform. The reporter's identity has been kept anonymous for their protection.</em></p>
            `
        };

        try {
            // First try to send the email
            await transporter.sendMail(emailContent);
            
            // If email is sent successfully, then update the post status
            post.status = 'reported';
            await post.save();
            
            res.json({
                message: 'Report has been sent to authorities and post status updated',
                sentTo: policeEmail
            });
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            res.status(500).json({ 
                message: 'Failed to send report to authorities',
                error: 'Email service error. Please check email configuration.'
            });
        }
    } catch (err) {
        console.error('Error in notify-authorities route:', err);
        res.status(500).json({ message: 'Server error while processing report' });
    }
});

module.exports = router; 