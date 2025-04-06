const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const encrypt = (value) => {
    if (!value) return value;
    try {
        return CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString();
    } catch (err) {
        console.error('Encryption error:', err);
        return value;
    }
};

const decrypt = (value) => {
    if (!value) return value;
    try {
        const bytes = CryptoJS.AES.decrypt(value, process.env.ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
        console.error('Decryption error:', err);
        return value;
    }
};

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        set: encrypt,
        get: decrypt
    },
    content: {
        type: String,
        required: true,
        set: encrypt,
        get: decrypt
    },
    category: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true,
        set: encrypt,
        get: decrypt
    },
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    authorName: {
        type: String,
        required: true,
        set: encrypt,
        get: decrypt
    },
    authorEmail: {
        type: String,
        required: true,
        set: encrypt,
        get: decrypt
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['posted', 'reported'],
        default: 'posted'
    },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
},
 {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Add pre-save middleware to ensure all required fields are present
postSchema.pre('save', function(next) {
    if (!this.location) {
        next(new Error('Location is required'));
        return;
    }
    next();
});

module.exports = mongoose.model('Post', postSchema); 