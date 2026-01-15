const normalizeDomain = (url) => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

const resolveDomain = (req) => {
    // 1. Development / Non-Production Override
    if (process.env.NODE_ENV !== 'production') {
        return 'localhost';
    }

    // 2. Production: Extract from Headers
    const origin = req.headers.origin || req.headers.host;

    if (!origin) return 'unknown-origin';

    // 3. Normalize
    const domain = normalizeDomain(origin);

    // Remove port if present (optional, but usually good for brand keys)
    return domain.split(':')[0];
};

module.exports = { resolveDomain, normalizeDomain };
