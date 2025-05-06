const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const userSchema = new mongoose.Schema({
    auth0Id: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        get: function(email) {
            try {
                console.log(process.env.ENCRYPTION_KEY);
                const bytes = CryptoJS.AES.decrypt(email, process.env.ENCRYPTION_KEY);
                return bytes.toString(CryptoJS.enc.Utf8);
            } catch (err) {
                return email;
            }
        },
        set: function(email) {
            console.log(process.env.ENCRYPTION_KEY);
            return CryptoJS.AES.encrypt(email, process.env.ENCRYPTION_KEY).toString();
        }
    },
    name: {
        type: String,
        required: true,
        get: function(name) {
            try {
                console.log(process.env.ENCRYPTION_KEY);
                const bytes = CryptoJS.AES.decrypt(name, process.env.ENCRYPTION_KEY);
                return bytes.toString(CryptoJS.enc.Utf8);
            } catch (err) {
                return name;
            }
        },
        set: function(name) {
            console.log(process.env.ENCRYPTION_KEY);
            return CryptoJS.AES.encrypt(name, process.env.ENCRYPTION_KEY).toString();
        }
    },
    picture: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

module.exports = mongoose.model('User', userSchema); 