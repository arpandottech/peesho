const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

mongoose.connect('mongodb://127.0.0.1:27017/meesho')
    .then(async () => {
        console.log('Connected');
        try {
            const products = await Product.find({});
            console.log('--- PRODUCTS ---');
            products.forEach(p => {
                console.log(`Title: ${p.title}, Category: ${p.category} (${typeof p.category})`);
            });

            const categories = await Category.find({});
            console.log('--- CATEGORIES ---');
            categories.forEach(c => {
                console.log(`Name: ${c.name}, ID: ${c._id}`);
            });
        } catch (e) { console.error(e); }
        mongoose.disconnect();
    }).catch(err => console.error(err));
