const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get recent orders (Admin Panel) - Optimized for Concurrency
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, status } = req.query;

        let query = {};
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const maxLimit = Math.min(parseInt(limit), 100);

        const orders = await Order.find(query)
            .select('transactionId totalAmount status domain createdAt userId') // Essential fields only
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(maxLimit)
            .lean();

        const total = await Order.countDocuments(query);

        res.json({
            orders,
            pagination: {
                page: parseInt(page),
                limit: maxLimit,
                total,
                pages: Math.ceil(total / maxLimit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new Order
router.post('/', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Order Status
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Webhook / Status Update (Simulates Bank Callback)
router.post('/webhook', async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true }
        );
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle Manual Review Flag
router.put('/:id/manual-review', async (req, res) => {
    try {
        const { isManualReviewNeeded } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { isManualReviewNeeded },
            { new: true }
        );
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
