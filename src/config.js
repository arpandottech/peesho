const hostname = window.location.hostname;

// Prioritize Environment Variable (Production/Custom)
let BASE_URL = process.env.REACT_APP_API_URL;

// Fallback to Dynamic Detection (Development/LAN)
if (!BASE_URL) {
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        BASE_URL = 'http://localhost:8888';
    } else if (hostname.includes('192.168.')) {
        // LAN (192.168.x.x)
        BASE_URL = `http://${hostname}:8888`;
    } else {
        // Production fallback - use clothic.store backend
        BASE_URL = 'https://clothic.store';
    }
}

const config = {
    API_URL: `${BASE_URL}/api`,
    BASE_URL: BASE_URL,
    ENV: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development'
};

console.log('🔧 Config loaded:', config);

export default config;

