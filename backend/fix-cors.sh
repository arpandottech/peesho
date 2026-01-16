#!/bin/bash
# CORS Fix Script for Peesho Multi-Domain Setup

echo "=== Checking AllowedDomain Collection ==="

cd /var/www/peesho/backend

# Check current allowed domains
node -e "
const mongoose = require('mongoose');
const AllowedDomain = require('./models/AllowedDomain');
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meesho').then(async () => {
    const domains = await AllowedDomain.find();
    console.log('\nCurrently Allowed Domains:');
    domains.forEach(d => console.log('  -', d.domain, '| Active:', d.isActive));
    await mongoose.connection.close();
    process.exit(0);
});
"

echo ""
echo "=== Adding/Updating Domains ==="

# Add all domains
node -e "
const mongoose = require('mongoose');
const AllowedDomain = require('./models/AllowedDomain');
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meesho').then(async () => {
    const domains = [
        'fkenterprise.online',
        'www.fkenterprise.online',
        'silkblissfashion.com',
        'www.silkblissfashion.com',
        'skechshoes.store',
        'www.skechshoes.store',
        'dmartready.store',
        'www.dmartready.store',
        'clothic.store',
        'localhost'
    ];
    
    for (const domain of domains) {
        await AllowedDomain.findOneAndUpdate(
            { domain: domain },
            { domain: domain, isActive: true },
            { upsert: true }
        );
        console.log('✅ Added/Updated:', domain);
    }
    
    console.log('\n✅ All domains updated!');
    await mongoose.connection.close();
    process.exit(0);
});
"

echo ""
echo "=== Restarting Backend ==="
pm2 restart peesho-b

echo ""
echo "=== Waiting for restart ==="
sleep 3

echo ""
echo "=== Verifying Allowed Domains ==="
node -e "
const mongoose = require('mongoose');
const AllowedDomain = require('./models/AllowedDomain');
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meesho').then(async () => {
    const domains = await AllowedDomain.find();
    console.log('\nFinal Allowed Domains:');
    domains.forEach(d => console.log('  -', d.domain, '| Active:', d.isActive));
    console.log('\nTotal:', domains.length, 'domains');
    await mongoose.connection.close();
    process.exit(0);
});
"

echo ""
echo "✅ CORS Fix Complete!"
echo "Try creating an order now."
