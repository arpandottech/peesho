const hostname = window.location.hostname;

// Prioritize Environment Variable (Production/Custom)
let BASE_URL = process.env.REACT_APP_API_URL;

// Fallback to Dynamic Detection (Development/LAN)
if (!BASE_URL) {
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        BASE_URL = 'http://localhost:5000';
    } else {
        // LAN (192.168.x.x)
        BASE_URL = `http://${hostname}:5000`;
    }
}

const config = {
    API_URL: `${BASE_URL}/api`,
    ENV: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development'
};

export default config;
