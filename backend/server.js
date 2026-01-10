const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const ParentCategory = require('./models/ParentCategory');
const Wishlist = require('./models/Wishlist');
const reviewRoutes = require('./routes/reviewRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/meesho')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes

// --- Users ---
app.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Parent Categories ---
app.post('/api/parent-categories', async (req, res) => {
    try {
        const item = new ParentCategory(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/parent-categories', async (req, res) => {
    try {
        const items = await ParentCategory.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Categories (Child) ---
app.post('/api/categories', async (req, res) => {
    try {
        const { name, image, parentCategory } = req.body;
        const newCategory = new Category({ name, image, parentCategory });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find().populate('parentCategory');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/categories/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate('parentCategory');
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Products ---
app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const { category, search } = req.query;
        console.log("GET /api/products query params:", req.query);
        let query = {};
        if (category) {
            query.category = category;
        }

        // Ensure search is a string and trim it
        if (search && typeof search === 'string' && search.trim().length > 0) {
            const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive regex
            query.$or = [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } }
            ];
        }

        const products = await Product.find(query).populate('category');
        console.log(`Found ${products.length} products for query:`, query);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({
                path: 'category',
                populate: { path: 'parentCategory' }
            });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Review Routes ---
app.use('/api/reviews', reviewRoutes);

// --- Order Routes ---
app.use('/api/orders', orderRoutes);

// --- Wishlist Routes ---

// Get all wishlist items (Populated)
app.get('/api/wishlist', async (req, res) => {
    try {
        const items = await Wishlist.find().populate('productId');
        const products = items.map(item => item.productId).filter(p => p !== null);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle Wishlist Item (Add/Remove)
app.post('/api/wishlist/toggle', async (req, res) => {
    try {
        const { productId } = req.body;
        const existing = await Wishlist.findOne({ productId });

        if (existing) {
            await Wishlist.findByIdAndDelete(existing._id);
            res.json({ message: 'Removed from wishlist', isWishlisted: false });
        } else {
            const newItem = new Wishlist({ productId });
            await newItem.save();
            res.json({ message: 'Added to wishlist', isWishlisted: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check if product is in wishlist
app.get('/api/wishlist/check/:id', async (req, res) => {
    try {
        const exists = await Wishlist.exists({ productId: req.params.id });
        res.json({ isWishlisted: !!exists });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
