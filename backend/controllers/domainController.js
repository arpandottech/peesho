const Domain = require('../models/Domain');
const dns = require('dns').promises;
const appCache = require('../utils/appCache');

// ... (AddDomain, GetDomains remain same) ...

// Check Status
exports.checkStatus = async (req, res) => {
    try {
        const cacheKey = `domain_status_${req.params.id}`;
        const cached = appCache.get(cacheKey);
        if (cached) return res.json(cached);

        const domain = await Domain.findById(req.params.id);
        if (!domain) return res.status(404).json({ error: "Domain not found" });

        appCache.set(cacheKey, domain);
        res.json(domain);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Toggle Domain Access Status (Active/Inactive)
exports.toggleStatus = async (req, res) => {
    try {
        const { status } = req.body; // Expect 'active' or 'inactive'

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: "Invalid status. Use 'active' or 'inactive'." });
        }

        const domain = await Domain.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!domain) return res.status(404).json({ error: "Domain not found" });

        // Invalidate Cache
        appCache.del(`domain_status_${req.params.id}`);
        // Also invalidate the Brand Config cache if status changes affect it
        appCache.del(`brand_config_${domain.domain_name}`);

        res.json(domain);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.addDomain = async (req, res) => {
    try {
        const { domain_name, meta_pixel_id } = req.body;

        // 1. Basic Presence Check
        if (!domain_name) return res.status(400).json({ error: "Domain Name is required" });

        // Normalize
        const hostname = domain_name.replace(/https?:\/\//, '').split('/')[0].toLowerCase();

        // 2. Format Validation (Regex)
        const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
        if (!domainRegex.test(hostname)) {
            return res.status(400).json({ error: "Invalid domain format (e.g., example.com)" });
        }

        // 3. Denylist (Localhost, IPs, Backend)
        // Detect current backend host to prevent self-add
        const backendHost = req.get('host')?.split(':')[0];
        const denylist = ['localhost', '127.0.0.1', '::1', backendHost];

        // Simple IP regex to block direct IP usage if needed
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

        if (denylist.includes(hostname) || hostname.endsWith('.local') || ipRegex.test(hostname)) {
            return res.status(400).json({ error: "Cannot add localhost, IP addresses, or backend domain." });
        }

        // 4. DNS Validation (A Record)
        // Skip DNS check in Dev mode if it's a test domain being forced (optional bypass)
        if (process.env.NODE_ENV === 'production' || process.env.ENFORCE_DNS_CHECK === 'true') {
            try {
                const addresses = await dns.resolve4(hostname);
                if (!addresses || addresses.length === 0) {
                    throw new Error("No A record found");
                }
                // Optional: Check if IP matches Server IP
                // This is checking if the domain actually points HERE. 
                // Getting "Here" is hard without config. We'll just verify it resolves for now.
            } catch (dnsErr) {
                return res.status(400).json({
                    error: `DNS Validation Failed: Domain ${hostname} does not resolve to an IP. Please configure DNS A Record first.`
                });
            }
        }

        // 5. Check for duplicates
        const existing = await Domain.findOne({ domain_name: hostname });
        if (existing) {
            return res.status(400).json({ error: "Domain already registered" });
        }

        const newDomain = new Domain({
            domain_name: hostname,
            meta_pixel_id,
            status: 'active',       // Default enabled for access
            apache_status: 'pending', // Needs provisioning
            ssl_status: 'pending'     // Needs provisioning
        });

        await newDomain.save();
        res.status(201).json(newDomain);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Domains
exports.getDomains = async (req, res) => {
    try {
        const domains = await Domain.find().sort({ created_at: -1 });
        res.json(domains);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Check Status
exports.checkStatus = async (req, res) => {
    try {
        const domain = await Domain.findById(req.params.id);
        if (!domain) return res.status(404).json({ error: "Domain not found" });
        res.json(domain);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Toggle Domain Access Status (Active/Inactive)
exports.toggleStatus = async (req, res) => {
    try {
        const { status } = req.body; // Expect 'active' or 'inactive'

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: "Invalid status. Use 'active' or 'inactive'." });
        }

        const domain = await Domain.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!domain) return res.status(404).json({ error: "Domain not found" });
        res.json(domain);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Domain
exports.deleteDomain = async (req, res) => {
    try {
        await Domain.findByIdAndDelete(req.params.id);
        res.json({ message: "Domain deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
