const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

mongoose.connect('mongodb://127.0.0.1:27017/meesho')
    .then(async () => {
        try {
            const categories = await Category.find({});
            const catMap = {};
            categories.forEach(c => {
                catMap[c._id.toString()] = c.name;
                console.log(`CAT: ${c.name} [${c._id}]`);
            });

            const products = await Product.find({});
            console.log(`\nFound ${products.length} products:`);
            products.forEach(p => {
                const catName = catMap[p.category?.toString()] || 'UNKNOWN';
                console.log(`PROD: ${p.title.substring(0, 20)}.. | CAT_ID: ${p.category} | CAT_NAME: ${catName}`);
            });

        } catch (e) { console.error(e); }
        mongoose.disconnect();
    }).catch(err => console.error(err));
