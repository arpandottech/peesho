const mongoose = require('mongoose');

const allowedDomainSchema = new mongoose.Schema({
    domain: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AllowedDomain', allowedDomainSchema);
