const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

// Public: Get Config (Domain inferred)
router.get('/config', brandController.getBrandConfig);

// Admin: Update Config
router.post('/config', brandController.updateBrandConfig);

module.exports = router;
