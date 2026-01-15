const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Unified Payment Initiation Endpoint
router.post('/initiate', paymentController.initiatePayment);
router.post('/retry', paymentController.retryPayment);

// Payment Verification (Callback)
router.post('/success', paymentController.verifyPayment);
// Payment Verification (Callback)
router.post('/success', paymentController.verifyPayment);
router.post('/failure', paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);

// Payment Status Check (Polling)
router.get('/status/:orderId', paymentController.checkStatus);

module.exports = router;
