const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

const indianNames = [
    "Nikhil Nishad", "Kartik Chavan", "Rohan Sharma", "Priya Patel", "Amit Singh",
    "Suresh Kumar", "Anita Gupta", "Rahul Verma", "Sneha Redding", "Vikram Malhotra",
    "Anjali Das", "Rajesh Koothrappali", "Meera Nair", "Arjun Rampal", "Deepak Chopra",
    "Sanya Malhotra", "Ishaan Khatter", "Kiara Advani", "Varun Dhawan", "Alia Bhatt"
];

// Get Reviews for a Product
router.get('/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId }).sort({ date: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a New Review (Admin)
router.post('/', async (req, res) => {
    const { productId, reviewText, images, rating } = req.body;

    // Pick a random name
    const randomName = indianNames[Math.floor(Math.random() * indianNames.length)];

    const newReview = new Review({
        product: productId,
        userName: randomName,
        reviewText,
        images: images || [],
        rating: rating || 5, // Default to 5 if not provided
        helpfulCount: Math.floor(Math.random() * 20), // Random helpful count for realism
        date: new Date()
    });

    try {
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
