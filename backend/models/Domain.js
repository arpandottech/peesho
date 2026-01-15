const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
    domain_name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true // Explicit index
    },
    meta_pixel_id: { type: String, default: null },

    // Controls frontend access (Active/Inactive)
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        index: true
    },

    // Provisioning Statuses
    apache_status: {
        type: String,
        enum: ['pending', 'active', 'failed'],
        default: 'pending'
    },
    ssl_status: {
        type: String,
        enum: ['pending', 'active', 'failed'],
        default: 'pending'
    },

    setupLogs: [{
        timestamp: { type: Date, default: Date.now },
        message: String
    }],
    created_at: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Domain', domainSchema);
