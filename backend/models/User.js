const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, // In a real app, hash this!
        required: true,
    },
    role: {
        type: String,
        default: 'user' // 'admin' or 'user'
    }
});

module.exports = mongoose.model('User', userSchema);
