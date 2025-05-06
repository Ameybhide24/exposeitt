const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const encrypt = (value) => {
    if (!value) return value;
    try {
        console.log(process.env.ENCRYPTION_KEY);
        return CryptoJS.AES.encrypt(value, process.env.ENCRYPTION_KEY).toString();
    } catch (err) {
        console.error('Encryption error:', err);
        return value;
    }
};

const decrypt = (value) => {
    if (!value) return value;
    try {
        console.log(process.env.ENCRYPTION_KEY);
        const bytes = CryptoJS.AES.decrypt(value, process.env.ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
        console.error('Decryption error:', err);
        return value;
    }
};

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        set: encrypt,
        get: decrypt
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
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
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

module.exports = mongoose.model('Comment', commentSchema); 