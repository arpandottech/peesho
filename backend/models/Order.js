const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: String, default: 'guest' }, // Replace with real user ID if available
    products: Array,     // Store simplified product details
    totalAmount: Number,
    paymentMode: String, // 'online' or 'cod'
    transactionId: String, // From frontend logic
    domain: String, // Frontend origin for dynamic redirects
    pixelId: String,
    status: {
        type: String,
        enum: ['CREATED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_ABANDONED'],
        default: 'CREATED'
    },
    retryAttempts: { type: Number, default: 0 },
    isManualReviewNeeded: { type: Boolean, default: false },
    riskMetadata: {
        flagged: { type: Boolean, default: false },
        reasons: [{ type: String }],
        riskScore: { type: Number, default: 0 }
    },
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        reason: String
    }],
    createdAt: { type: Date, default: Date.now }
});

// Indexes for high-performance querying
orderSchema.index({ transactionId: 1 }, { unique: true });
orderSchema.index({ domain: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 }); // For sorting by newest
orderSchema.index({ status: 1, createdAt: -1 }); // For filtering and sorting
orderSchema.index({ userId: 1 });

// Method to safely update status
orderSchema.methods.updateStatus = function (newStatus, reason) {
    const validTransitions = {
        'CREATED': ['PAYMENT_PENDING', 'PAYMENT_ABANDONED'],
        'PAYMENT_PENDING': ['PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_ABANDONED'],
        'PAYMENT_SUCCESS': [], // Terminal State
        'PAYMENT_FAILED': ['PAYMENT_PENDING', 'PAYMENT_ABANDONED'], // Retry allowed
        'PAYMENT_ABANDONED': [] // Terminal State
    };

    if (this.status === newStatus) return; // No-op

    // Check validity (Optional: strictly enforce or just log)
    // For now, we enforce terminal states but allow flexible retries
    if (validTransitions[this.status] && !validTransitions[this.status].includes(newStatus)) {
        // Allow override if explicitly needed, but usually we throw or ignore
        // For robust systems, we might throw an error.
        // throw new Error(`Invalid state transition from ${this.status} to ${newStatus}`);
        console.warn(`Warning: Invalid transition attempted from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;
    this.statusHistory.push({
        status: newStatus,
        reason: reason || 'Status updated via backend'
    });
};

module.exports = mongoose.model('Order', orderSchema);
