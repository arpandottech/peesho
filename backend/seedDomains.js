const mongoose = require('mongoose');
require('dotenv').config();

const AllowedDomain = require('./models/AllowedDomain');

// List your 3 frontend domains here
const domainsToAdd = [
    'fkenterprise.online',  // Replace with your actual domain 1
    'silkblissfashion.com',  // Replace with your actual domain 2
    'skechshoes.store',  // Replace with your actual domain 3
    'clothic.store', // Backend domain (for testing)
    'localhost',     // For local development
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meesho')
    .then(async () => {
        console.log('✅ MongoDB Connected');

        for (const domain of domainsToAdd) {
            try {
                const existing = await AllowedDomain.findOne({ domain });
                if (existing) {
                    console.log(`⏭️  Domain already exists: ${domain}`);
                } else {
                    await AllowedDomain.create({ domain, isActive: true });
                    console.log(`✅ Added domain: ${domain}`);
                }
            } catch (err) {
                console.error(`❌ Error adding ${domain}:`, err.message);
            }
        }

        console.log('\n📋 All Allowed Domains:');
        const allDomains = await AllowedDomain.find();
        allDomains.forEach(d => {
            console.log(`  - ${d.domain} (${d.isActive ? 'Active' : 'Inactive'})`);
        });

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });
