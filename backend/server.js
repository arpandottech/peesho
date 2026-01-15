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
const paymentRoutes = require('./routes/paymentRoutes');
const brandRoutes = require('./routes/brandRoutes');
const domainRoutes = require('./routes/domainRoutes');
const AllowedDomain = require('./models/AllowedDomain');
const { resolveDomain, normalizeDomain } = require('./utils/domainResolver');
const initCronJobs = require('./cronJobs');

const NodeCache = require('node-cache');
const compression = require('compression');

// Cache allowed domains for 5 minutes (300 seconds)
const domainCache = new NodeCache({ stdTTL: 300 });


// Dynamic CORS Configuration
const corsOptions = async (req, callback) => {
    // 1. Allow all in Development
    if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
    }

    const origin = req.header('Origin');

    // 2. Allow requests with no origin (like mobile apps/postman)
    if (!origin) return callback(null, true);

    try {
        const domain = normalizeDomain(origin);
        const cacheKey = `cors_${domain}`;

        // 3a. Check Cache
        const cachedResult = domainCache.get(cacheKey);
        if (cachedResult !== undefined) {
            if (cachedResult) return callback(null, true);
            else return callback(new Error('Not allowed by CORS'));
        }

        // 3b. Check Database for Allowed Domains
        // Also check raw origin for exact match scenarios
        const isAllowed = await AllowedDomain.exists({
            $or: [
                { domain: domain },
                { domain: origin }
            ],
            isActive: true
        });

        // Cache the result (true or false)
        domainCache.set(cacheKey, !!isAllowed);

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`[CORS Blocked] Origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    } catch (err) {
        console.error("CORS Error:", err);
        callback(new Error('Internal Server Error (CORS)'));
    }
};

const rateLimit = require('express-rate-limit');

// ... imports ...

// Middleware
app.set('trust proxy', 1); // Trust first proxy (needed for req.ip behind VHost)

// Static Asset Caching (Production)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('build', {
        maxAge: '1y', // Cache static assets for 1 year
        etag: true,
        lastModified: true,
        setHeaders: (res, path) => {
            // Cache images, fonts, and media for 1 year
            if (path.match(/\.(jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot|mp4|webm)$/i)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
            // Cache JS/CSS with hash for 1 year
            else if (path.match(/\.(js|css)$/i) && path.includes('.')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
            // HTML files - no cache (always revalidate)
            else if (path.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            }
        }
    }));
}

app.use(compression()); // Gzip compression
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// 1. Global Rate Limiter (100 reqs per 15 min)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
});
app.use(globalLimiter);

// 2. Strict Limiter for Payments & Config (10 reqs per min)
const strictLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { error: "Too many payment attempts. Please wait." }
});

// Domain Resolution Middleware
app.use((req, res, next) => {
    req.domain = resolveDomain(req);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[Domain Resolver] Resolved: ${req.domain} (Env: ${process.env.NODE_ENV})`);
    }
    next();
});

// Cluster Support for High Concurrency (10k+ Users)
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

// Note: initCronJobs is called conditionally below based on process role

// ... (CORS and Middleware definitions remain above) ...

// Start Server Logic
const startServer = () => {
    // MongoDB Connection
    mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meesho', { maxPoolSize: 50 })
        .then(() => console.log(`[${process.pid}] MongoDB Connected`))
        .catch(err => console.log(err));

    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT} (PID: ${process.pid})`);
    });
};

/* Clustering Logic
   - Production: Master runs Cron, Workers run API.
   - Development: Single process runs both.
*/
if (process.env.NODE_ENV === 'production' && cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    // 1. Initialize Cron Jobs (Singleton)
    mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meesho', { maxPoolSize: 10 })
        .then(() => {
            console.log('Master DB Connected. Initializing Cron Jobs...');
            initCronJobs();
        });

    // 2. Fork Workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // 3. Auto-Restart Workers
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });

} else {
    // Worker Process (or Non-Clustered Dev Mode)
    startServer();

    // If Development, we need Cron in this single process
    if (process.env.NODE_ENV !== 'production') {
        initCronJobs();
    }
}
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

const appCache = require('./utils/appCache');

// ... imports ...

// --- Parent Categories ---
app.post('/api/parent-categories', async (req, res) => {
    try {
        const item = new ParentCategory(req.body);
        await item.save();

        // Invalidate Cache
        appCache.del('parent_stats');
        appCache.del('all_parent_categories');

        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/parent-categories', async (req, res) => {
    try {
        // Check Cache
        const cached = appCache.get('all_parent_categories');
        if (cached) return res.json(cached);

        const items = await ParentCategory.find();

        // Set Cache
        appCache.set('all_parent_categories', items);

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

        // Invalidate Cache
        appCache.del('all_categories');

        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        // Check Cache
        const cached = appCache.get('all_categories');
        if (cached) return res.json(cached);

        const categories = await Category.find().populate('parentCategory');

        // Set Cache
        appCache.set('all_categories', categories);

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
        const { category, search, page = 1, limit = 50 } = req.query;
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

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const maxLimit = Math.min(parseInt(limit), 100); // Cap at 100

        const products = await Product.find(query)
            .select('title price discountPrice image category ratings') // Field selection
            .populate('category', 'name parentCategory') // Only needed fields
            .skip(skip)
            .limit(maxLimit)
            .lean(); // Faster, no Mongoose overhead

        const total = await Product.countDocuments(query);

        console.log(`Found ${products.length} products for query:`, query);
        res.json({
            products,
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
app.use('/api/payment', strictLimiter, paymentRoutes);
app.use('/api/brand', strictLimiter, brandRoutes);

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

// ============================================
// Health Check Endpoint (Monitoring & Alerts)
// ============================================
app.get('/health', (req, res) => {
    const os = require('os');

    // CPU Load (1, 5, 15 minute averages)
    const loadAvg = os.loadavg();
    const cpuCount = os.cpus().length;

    // Memory Usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(2);

    // Process Memory
    const processMemory = process.memoryUsage();

    // Uptime
    const uptime = process.uptime();

    // Database Status
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Worker Info (if clustered)
    const workerInfo = process.env.NODE_ENV === 'production'
        ? { workerId: process.pid, isMaster: cluster.isPrimary }
        : { mode: 'development', pid: process.pid };

    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
        system: {
            cpuLoad: {
                '1min': loadAvg[0].toFixed(2),
                '5min': loadAvg[1].toFixed(2),
                '15min': loadAvg[2].toFixed(2),
                cores: cpuCount
            },
            memory: {
                total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
                used: `${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
                free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
                usagePercent: `${memUsagePercent}%`
            },
            process: {
                heapUsed: `${(processMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(processMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                rss: `${(processMemory.rss / 1024 / 1024).toFixed(2)} MB`
            }
        },
        database: {
            status: dbStatus,
            name: mongoose.connection.name || 'N/A'
        },
        worker: workerInfo
    });
});

/* Clustering Logic
   - Production: Master runs Cron, Workers run API.
   - Development: Single process runs both.
*/
if (process.env.NODE_ENV === 'production' && cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    // 1. Initialize Cron Jobs (Singleton)
    mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meesho', { maxPoolSize: 10 })
        .then(() => {
            console.log('Master DB Connected. Initializing Cron Jobs...');
            initCronJobs();
        });

    // 2. Fork Workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // 3. Auto-Restart Workers
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });

} else {
    // Worker Process (or Non-Clustered Dev Mode)
    startServer();

    // If Development, we need Cron in this single process
    if (process.env.NODE_ENV !== 'production') {
        initCronJobs();
    }
}

// ============================================
// Global Error Handlers (Prevent Server Crash)
// ============================================

// 1. Unhandled Promise Rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Promise Rejection:', reason);
    console.error('Promise:', promise);

    // Log to file in production (optional: integrate with logging service)
    if (process.env.NODE_ENV === 'production') {
        // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
        console.error('Stack:', reason.stack || 'No stack trace');
    }

    // Don't exit - let the server continue running
    // Only exit if it's a critical database connection error
    if (reason && reason.name === 'MongoNetworkError') {
        console.error('💥 Critical MongoDB error. Shutting down gracefully...');
        process.exit(1);
    }
});

// 2. Uncaught Exceptions
process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    console.error('Stack:', error.stack);

    // Log to file in production
    if (process.env.NODE_ENV === 'production') {
        // TODO: Send to error monitoring service
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
    }

    // Graceful shutdown for critical errors
    console.error('💥 Critical error. Shutting down gracefully...');

    // Close server gracefully
    if (global.server) {
        global.server.close(() => {
            console.log('Server closed. Exiting process.');
            process.exit(1);
        });

        // Force exit after 10 seconds if graceful shutdown fails
        setTimeout(() => {
            console.error('Forced shutdown after timeout.');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(1);
    }
});

// 3. SIGTERM Signal (Graceful Shutdown)
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');

    if (global.server) {
        global.server.close(() => {
            console.log('Server closed. Process terminated.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

// 4. SIGINT Signal (Ctrl+C)
process.on('SIGINT', () => {
    console.log('👋 SIGINT received. Shutting down gracefully...');

    if (global.server) {
        global.server.close(() => {
            console.log('Server closed. Process terminated.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

console.log('✅ Global error handlers initialized.');
