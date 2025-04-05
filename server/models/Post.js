const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        set: function(title) {
            return CryptoJS.AES.encrypt(title, process.env.ENCRYPTION_KEY).toString();
        },
        get: function(title) {
            return CryptoJS.AES.decrypt(title, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        }
    },
    content: {
        type: String,
        required: true,
        set: function(content) {
            return CryptoJS.AES.encrypt(content, process.env.ENCRYPTION_KEY).toString();
        },
        get: function(content) {
            return CryptoJS.AES.decrypt(content, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        }
    },
    category: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Index for faster queries
postSchema.index({ user: 1 });
postSchema.index({ status: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema); 