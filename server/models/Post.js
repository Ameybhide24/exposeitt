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
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    authorName: {
        type: String,
        required: true,
        set: function(name) {
            return CryptoJS.AES.encrypt(name, process.env.ENCRYPTION_KEY).toString();
        },
        get: function(name) {
            return CryptoJS.AES.decrypt(name, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        }
    },
    authorEmail: {
        type: String,
        required: true,
        set: function(email) {
            return CryptoJS.AES.encrypt(email, process.env.ENCRYPTION_KEY).toString();
        },
        get: function(email) {
            return CryptoJS.AES.decrypt(email, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['posted', 'reported'],
        default: 'posted'
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

module.exports = mongoose.model('Post', postSchema); 