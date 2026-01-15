const BrandConfig = require('../models/BrandConfig');
const Domain = require('../models/Domain');
const appCache = require('../utils/appCache');

// Get Brand Configuration
exports.getBrandConfig = async (req, res) => {
    try {
        const domainName = req.domain || (req.headers.host ? req.headers.host.split(':')[0] : 'localhost');
        const cacheKey = `brand_config_${domainName}`;

        // 1. Check Cache
        const cachedConfig = appCache.get(cacheKey);
        if (cachedConfig) {
            // console.log(`[Cache Hit] Brand Config: ${domainName}`);
            return res.json(cachedConfig);
        }

        // 2. Fetch from Domain Management System (Source of Truth for Pixel & Status)
        const domainDoc = await Domain.findOne({ domain_name: domainName });

        // Access Control: Block if domain exists but is inactive
        if (domainDoc && domainDoc.status !== 'active') {
            return res.status(403).json({ error: "Domain is Inactive" });
        }

        // 3. Fetch Visual Theme Config (Optional / Legacy support)
        let themeConfig = await BrandConfig.findOne({ domain_name: domainName });

        // Default Config
        const responseConfig = {
            brand_name: themeConfig?.brand_name || "Myshop Store",
            meta_pixel_id: domainDoc?.meta_pixel_id || themeConfig?.meta_pixel_id || "",
            domain_name: domainName,
            status: 'active', // If we passed the check above, it's active for the frontend
            theme: themeConfig?.theme || { primaryColor: '#9F2089' },
            enabled_payment_methods: ['UPI', 'COD', 'Card', 'NetBanking', 'EMI', 'Wallets']
        };

        // Development Override
        if (process.env.NODE_ENV !== 'production' && !domainDoc) {
            responseConfig.status = 'active';
            responseConfig.brand_name = "Dev Store";
        }

        // 4. Set Cache
        appCache.set(cacheKey, responseConfig);

        res.json(responseConfig);

    } catch (err) {
        console.error("Brand Config API Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Create/Update Brand Config (Admin use - simplistic for now)
exports.updateBrandConfig = async (req, res) => {
    try {
        const { domain_name } = req.body;
        if (!domain_name) return res.status(400).json({ error: "Domain Name Required" });

        const config = await BrandConfig.findOneAndUpdate(
            { domain_name: domain_name.toLowerCase() },
            req.body,
            { new: true, upsert: true } // Create if not exists
        );

        // Invalidate Cache
        const cacheKey = `brand_config_${domain_name.toLowerCase()}`;
        appCache.del(cacheKey);
        console.log(`[Cache Invalidated] Key: ${cacheKey}`);

        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
