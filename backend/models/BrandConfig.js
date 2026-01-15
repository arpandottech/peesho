const mongoose = require('mongoose');

const brandConfigSchema = new mongoose.Schema({
    domain_name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    brand_name: {
        type: String,
        default: 'My Store'
    },
    meta_pixel_id: {
        type: String,
        default: ''
    },
    enabled_payment_methods: {
        type: [String], // e.g. ['UPI', 'COD', 'Card']
        default: ['UPI', 'COD', 'Card', 'NetBanking', 'EMI', 'Wallets']
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    theme: {
        primaryColor: { type: String, default: '#9F2089' },
        logoUrl: { type: String, default: '' }
    }
}, { timestamps: true });

module.exports = mongoose.model('BrandConfig', brandConfigSchema);
