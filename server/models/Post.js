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

module.exports = mongoose.model('Post', postSchema); 