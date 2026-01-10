const mongoose = require('mongoose');

const parentCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String, // URL
    }
});

module.exports = mongoose.model('ParentCategory', parentCategorySchema);
