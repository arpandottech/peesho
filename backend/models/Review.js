const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        default: 5
    },
    reviewText: {
        type: String,
        required: true
    },
    images: [{
        type: String // URL of the image
    }],
    date: {
        type: Date,
        default: Date.now
    },
    helpfulCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Review', reviewSchema);
