const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: String, default: 'guest' }, // Replace with real user ID if available
    products: Array,     // Store simplified product details
    totalAmount: Number,
    paymentMode: String, // 'online' or 'cod'
    transactionId: String, // From frontend logic
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
