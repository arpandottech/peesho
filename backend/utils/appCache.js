const NodeCache = require('node-cache');

// Standard TTL: 600 seconds (10 minutes)
// Check period: 120 seconds
const appCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

module.exports = appCache;
