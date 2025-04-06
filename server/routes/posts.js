const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth } = require('express-oauth2-jwt-bearer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');



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

const axios = require('axios');
 
const randomNames = [
    'Gotham', 'Metropolis', 'Atlantis', 'Hogwarts', 'Narnia', 'Wakanda',
    'Springfield', 'Rivendell', 'Asgard', 'Pandora', 'Zion', 'Neverland'
];

// Helper to get a random name
const getRandomName = () => {
    const randomIndex = Math.floor(Math.random() * randomNames.length);
    return randomNames[randomIndex];
};

// Helper to generate a 4-digit number
const getRandomNumber = () => {
    return Math.floor(1000 + Math.random() * 9000);
};

const userAnonMap = new Map();

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'media-' + uniqueSuffix + ext);
    }
});

// File filter to allow only images and videos
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    
    if (allowedImageTypes.includes(file.mimetype)) {
        req.fileType = 'image';
        cb(null, true);
    } else if (allowedVideoTypes.includes(file.mimetype)) {
        req.fileType = 'video';
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Only images and videos are allowed.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Get feed (all posts with anonymized user data) - Public route
router.get('/feed', async (req, res) => {
    try {
        console.log('Fetching feed posts');
        const posts = await Post.find({}).sort({ createdAt: -1 });
        console.log(`Found ${posts.length} posts for feed`);

        // Anonymize user data
        const enrichedPosts = await Promise.all(
            posts.map(async (post) => {
                const userId = post.userId.toString();
                const postObj = post.toObject({ getters: true });

                if (postObj.media && postObj.media.length > 0) {
                    console.log(`Post ${postObj._id} has ${postObj.media.length} media items`);
                }
                // If already mapped, reuse the same anonymous name
                if (!userAnonMap.has(userId)) {
                    const randomName = getRandomName();
                    const randomNumber = getRandomNumber();
                    const anonymousName = `${randomName}-${randomNumber}`;
                    userAnonMap.set(userId, anonymousName);
                }

                const authorName = userAnonMap.get(userId);

                let anonymousId = 'anon';

                try {
                    const response = await axios.post('https://rpc.testnet-02.midnight.network/', {
                        jsonrpc: "2.0",
                        method: "system_chain",
                        params: [],
                        id: 1
                    });

                    if (response.data && response.data.result) {
                        anonymousId = response.data.result.anonymousId || 'anon';
                    }
                } catch (error) {
                    console.error('Midnight API anonymization failed:', error.message);
                }

                // Scam detection
                const recentPosts = await Post.find({ userId: post.userId })
                    .sort({ createdAt: -1 })
                    .limit(5);

                let upvoteSum = 0;
                let downvoteSum = 0;

                recentPosts.forEach(p => {
                    upvoteSum += p.upvotes || 0;
                    downvoteSum += p.downvotes || 0;
                });

                const isScammer = downvoteSum > 3 * upvoteSum;

                return {
                    ...postObj,
                    authorName,
                    anonymousId,
                    authorEmail: undefined,
                    userId: undefined,
                    isScammer
                };
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
        const { title, content, category, location, authorName, authorEmail, media } = req.body;
        const userId = req.auth?.payload?.sub;  // Access sub from payload

        console.log('Creating new post:');
        console.log('Auth token data:', req.auth);
        console.log('User ID from token:', userId);
        console.log('Request body:', { 
            title, 
            category, 
            location, 
            authorName, 
            authorEmail, 
            media: media ? `${media.length} media items` : 'No media'
        });

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
            authorEmail,
            media: media || []  // Handle multiple media files
        });

        console.log('Saving post with data:', {
            title: post.title,
            mediaCount: post.media ? post.media.length : 0
        });
        
        const newPost = await post.save();
        console.log('Post created successfully:', {
            id: newPost._id,
            title: newPost.title,
            mediaCount: newPost.media ? newPost.media.length : 0
        });
        
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
        { $inc: { upvotes: 1 }, $dec: {downvotes: -1} },
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
        { $inc: { downvotes: 1 }, $dec: {upvotes: -1} },
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
                <p><em>This is an automated report from the ExposeIt platform. The reporter's identity has been kept anonymous for their protection.</em></p>
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

// Upload multiple media files for a post
router.post('/upload-media', checkJwt, upload.array('media', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        console.log(`Received ${req.files.length} files for upload`);
        
        // Process each uploaded file
        const mediaFiles = req.files.map(file => {
            console.log('File uploaded:', {
                originalname: file.originalname,
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path
            });

            // Determine media type from mimetype
            let mediaType = null;
            if (file.mimetype.startsWith('image/')) {
                mediaType = 'image';
            } else if (file.mimetype.startsWith('video/')) {
                mediaType = 'video';
            }

            return {
                filename: file.filename,
                mediaType: mediaType
            };
        });

        console.log('Processed media files:', mediaFiles);

        res.status(200).json({
            message: 'Files uploaded successfully',
            media: mediaFiles
        });
    } catch (err) {
        console.error('Error uploading files:', err);
        res.status(500).json({ 
            message: 'Error uploading files',
            error: err.message
        });
    }
});

// Serve media files with proper headers and caching
router.get('/media/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const uploadDir = path.join(__dirname, '../uploads');
        const filePath = path.join(uploadDir, filename);
        
        // Log the media request
        console.log(`Media request for: ${filename}`);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(`Media file not found: ${filename}`);
            return res.status(404).send('File not found');
        }
        
        // Get file extension to determine content type
        const ext = path.extname(filename).toLowerCase();
        
        // Set appropriate content type based on file extension
        let contentType = 'application/octet-stream'; // default
        
        if (['.jpg', '.jpeg'].includes(ext)) {
            contentType = 'image/jpeg';
        } else if (ext === '.png') {
            contentType = 'image/png';
        } else if (ext === '.gif') {
            contentType = 'image/gif';
        } else if (ext === '.webp') {
            contentType = 'image/webp';
        } else if (ext === '.mp4') {
            contentType = 'video/mp4';
        } else if (ext === '.webm') {
            contentType = 'video/webm';
        } else if (['.mov', '.qt'].includes(ext)) {
            contentType = 'video/quicktime';
        }
        
        // Set headers for better caching and performance
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow cross-origin access
        
        // Stream the file to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
        // Handle errors in the stream
        fileStream.on('error', (error) => {
            console.error(`Error streaming file ${filename}:`, error);
            if (!res.headersSent) {
                res.status(500).send('Error streaming file');
            }
        });
    } catch (error) {
        console.error(`Error serving media file:`, error);
        res.status(500).send('Server error when accessing media file');
    }
});

module.exports = router; 