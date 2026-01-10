const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        enum: ['simple', 'variable'],
        default: 'simple'
    },
    attributes: [{
        name: String, // e.g., 'Color', 'Size'
        options: [String] // e.g., ['Red', 'Blue']
    }],
    variations: [{
        combination: {
            type: Map,
            of: String // e.g., { Color: 'Red', Size: 'M' }
        },
        price: Number,
        discountPrice: Number,
        stock: Number,
        sku: String
    }],
    price: {
        type: Number,
        required: function () { return this.type === 'simple'; } // Only required for simple products
    },
    discountPrice: {
        type: Number,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    images: [{
        type: String, // Array of image URLs
    }],
    rating: {
        type: Number,
        default: 0,
    },
    reviews: {
        type: Number,
        default: 0,
    }
});

module.exports = mongoose.model('Product', productSchema);
