const axios = require('axios');
const crypto = require('crypto');

// Generate Hash Helper
const generateHash = (params, salt) => {
    const { key, txnid, amount, productinfo, firstname, email, udf1 } = params;
    // Standard PayU Hash: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
    // Note: We only use udf1
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1 || ''}||||||||||${salt}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
};

// Retry Payment Logic
exports.retryPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const Order = require('../models/Order');
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (!['PAYMENT_FAILED', 'PAYMENT_ABANDONED', 'CREATED'].includes(order.status)) {
            return res.status(400).json({ error: "Payment retry not allowed for current status: " + order.status });
        }

        // 1. Prepare New Transaction
        const retryCount = (order.retryAttempts || 0) + 1;
        const newTxnId = `T${Date.now()}_R${retryCount}`;

        // 2. Update Order
        order.transactionId = newTxnId;
        order.retryAttempts = retryCount;
        order.updateStatus('PAYMENT_PENDING', `Retry Attempt #${retryCount}`);
        await order.save();

        // 3. Generate PayU Params (Re-using logic)
        // Note: Ideally we should store customer info in Order to reuse perfectly.
        // For now, we use safe defaults if inputs are missing, or we can require them in retry body.
        // Let's assume frontend passes necessary details or we fallback.
        const key = process.env.PAYU_KEY;
        const salt = process.env.PAYU_SALT;
        const payuUrl = process.env.PAYU_URL || 'https://test.payu.in/_payment';

        const amount = parseFloat(order.totalAmount).toFixed(2);
        const productinfo = "Meesho Order Retry";
        const firstname = "Guest"; // Improving this would require storing user info in Order
        const email = "guest@example.com";
        const phone = "9999999999";
        const udf1 = order.domain || process.env.FRONTEND_URL;

        const hash = generateHash({
            key,
            txnid: newTxnId,
            amount,
            productinfo,
            firstname,
            email,
            udf1
        }, salt);

        const payuParams = {
            key,
            txnid: newTxnId,
            amount,
            productinfo,
            firstname,
            email,
            phone,
            surl: `${process.env.API_URL || 'http://localhost:5000/api'}/payment/success`, // Ensure this points to backend
            furl: `${process.env.API_URL || 'http://localhost:5000/api'}/payment/failure`,
            udf1,
            hash
        };
        // Reuse payment mode if known, else default
        payuParams.pg = order.paymentMode === 'UPI' ? 'UPI' : 'CC';

        res.json({
            action: payuUrl,
            params: payuParams
        });

    } catch (err) {
        console.error("Retry Payment Error:", err);
        res.status(500).json({ error: "Retry failed", details: err.message });
    }
};

exports.initiatePayment = async (req, res) => {
    try {
        const {
            txnid, amount, productinfo, firstname, email, phone,
            paymentMode, // Expected: UPI, CARD, NETBANKING, EMI, WALLET (Case Insensitive)
            bankcode,
            cardDetails,
            upiVpa,
            surl, furl,
            udf1 // Added for handling dynamic redirects
        } = req.body;

        // 1. Validate Env Variables
        const key = process.env.PAYU_KEY;
        const salt = process.env.PAYU_SALT;
        const payuUrl = process.env.PAYU_URL || 'https://test.payu.in/_payment';

        console.log("--- Payment Initiation Debug ---");
        console.log("PAYU_KEY Loaded:", key ? "YES" : "NO");
        console.log("PAYU_SALT Loaded:", salt ? "YES" : "NO");
        console.log("PAYU_URL:", payuUrl);
        console.log("Request Body:", JSON.stringify({ ...req.body, cardDetails: "***" })); // Safety mask

        if (!key || !salt) {
            console.error("CRITICAL: PayU Config Missing in .env");
            return res.status(500).json({ error: "Server configuration error: Payment provider credentials missing" });
        }

        // 2. Default Parameters (Handling Missing Data)
        const safeProductInfo = productinfo || "Meesho Order";
        const safeFirstname = firstname || "Guest";
        const safeEmail = email || "guest@example.com";
        const safePhone = phone || "9999999999";

        // 3. Validate Critical Fields
        if (!txnid || !amount) {
            return res.status(400).json({ error: "Missing required payment fields: txnid or amount" });
        }

        // Ensure consistent amount format (2 decimal places) for Hash AND Form
        const formattedAmount = parseFloat(amount).toFixed(2);

        // 4. Generate Secure Hash
        const hash = generateHash({
            key,
            txnid,
            amount: formattedAmount, // Use exact string
            productinfo: safeProductInfo,
            firstname: safeFirstname,
            email: safeEmail,
            udf1: udf1 || '' // Pass UDF1 for hash generation
        }, salt);

        // ... (Defaults and Hash Generation remain same) ...

        // 5. Construct PayU Form Data (for Frontend to POST)
        const payuParams = {
            key,
            txnid,
            amount: formattedAmount,
            productinfo: safeProductInfo,
            firstname: safeFirstname,
            email: safeEmail,
            phone: safePhone,
            surl: surl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/thankyou`, // Frontend handles success
            furl: furl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed`, // Frontend handles failure
            udf1: udf1 || '',
            hash
        };

        // 5. Handle Payment Type Specifics (Optional Pre-selection)
        const mode = (paymentMode || '').toUpperCase();

        if (mode === 'UPI') {
            payuParams.pg = 'UPI';
            payuParams.bankcode = 'UPI';
        } else if (mode === 'CARD') {
            payuParams.pg = 'CC';
            payuParams.bankcode = 'CC';
        } else if (mode === 'NETBANKING') {
            payuParams.pg = 'NB';
            payuParams.bankcode = bankcode;
        } else if (mode === 'EMI') {
            payuParams.pg = 'EMI';
            payuParams.bankcode = bankcode;
        } else if (mode === 'WALLET') {
            payuParams.pg = 'WALLET';
            payuParams.bankcode = bankcode;
        }

        // Return signed params to frontend for Form Post
        console.log("Generating PayU Form for Redirect");
        res.json({
            action: payuUrl,
            params: payuParams
        });

    } catch (err) {
        console.error("Payment Initiation Error:", err);
        res.status(500).json({ error: "Hash generation failed", details: err.message });
    }
};
// Verify Payment (Callback/Webhook)
// Core Transaction Processor (Shared by Webhook & Redirect)
const processPayUTransaction = async (params) => {
    const {
        mihpayid, status, txnid, amount, hash,
        productinfo, firstname, email, phone,
        udf1, error_Message
    } = params;

    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    // 1. Verify Hash
    const { udf1, udf2, udf3, udf4, udf5, udf6, udf7, udf8, udf9, udf10 } = params;
    let hashString = `${salt}|${status}|${udf10 || ''}|${udf9 || ''}|${udf8 || ''}|${udf7 || ''}|${udf6 || ''}|${udf5 || ''}|${udf4 || ''}|${udf3 || ''}|${udf2 || ''}|${udf1 || ''}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

    if (params.additionalCharges) {
        hashString = `${params.additionalCharges}|${hashString}`;
    }

    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    if (calculatedHash !== hash) {
        console.error(`[PayU Security Risk] Hash Mismatch!`);
        console.error(`Received Hash: ${hash}`);
        console.error(`Calculated String: ${hashString}`);
        console.error(`Calculated Hash: ${calculatedHash}`);
        console.error(`Params:`, JSON.stringify(params));
        return { success: false, reason: 'security_error', message: 'Hash Mismatch' };
    }

    // 2. Find Order
    const Order = require('../models/Order');
    const order = await Order.findOne({ transactionId: txnid });

    if (!order) {
        console.error(`Order not found for txnid: ${txnid}`);
        return { success: false, reason: 'order_not_found', message: 'Order Not Found' };
    }

    // 3. Verify Amount (Security Check)
    const orderAmount = parseFloat(order.totalAmount).toFixed(2);
    const paidAmount = parseFloat(amount).toFixed(2);

    if (orderAmount !== paidAmount) {
        console.error(`Security Alert: Amount Mismatch for Order ${txnid}. Expected: ${orderAmount}, Received: ${paidAmount}`);
        order.updateStatus('PAYMENT_FAILED', 'Security Error: Amount Mismatch');
        await order.save();
        return { success: false, reason: 'security_amount_mismatch', message: 'Amount Mismatch', order };
    }

    // 4. Update Status Idempotently
    if (order.status !== 'PAYMENT_SUCCESS') {
        if (status === 'success') {
            order.paymentId = mihpayid;
            order.updateStatus('PAYMENT_SUCCESS', `Payment Verified via PayU. ID: ${mihpayid}`);
            await order.save();
            console.log(`Order ${txnid} marked PAYMENT_SUCCESS`);
            return { success: true, order, amount };
        } else {
            order.paymentId = mihpayid;
            console.log(`Order ${txnid} FAILED: ${error_Message}`);
            order.updateStatus('PAYMENT_FAILED', error_Message || 'Transaction Failed');
            await order.save();
            return { success: false, reason: 'transaction_failed', message: error_Message, order };
        }
    } else {
        // Already Success
        console.log(`Order ${txnid} already processed (Idempotent)`);
        return { success: true, order, amount, idempotent: true };
    }
};

// Webhook Handler (S2S)
exports.handleWebhook = async (req, res) => {
    try {
        console.log("Webhook Received:", JSON.stringify(req.body));
        await processPayUTransaction(req.body);
        // Always return 200 OK to PayU to acknowledge receipt
        res.status(200).json({ status: 'OK' });
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).json({ error: 'Internal Error' });
    }
};

// Redirect Handler (User Validated)
exports.verifyPayment = async (req, res) => {
    try {
        const result = await processPayUTransaction(req.body);

        // Dynamic Redirect Logic: Prefer Stored Domain > UDF1 > Env
        // This ensures users are sent back to the exact domain they ordered from.
        let redirectBase = process.env.FRONTEND_URL || 'http://localhost:3000';

        if (result.order && result.order.domain) {
            redirectBase = result.order.domain;
        } else if (req.body.udf1) {
            redirectBase = req.body.udf1;
        }

        if (result.success) {
            // Perform risk analysis before saving the final state
            const orderWithRisk = analyzeOrderRisk(result.order);
            await orderWithRisk.save(); // Save the order with potential risk metadata
            return res.redirect(`${redirectBase}/thankyou?orderId=${result.order._id}&status=success&amount=${result.amount}`);
        } else {
            // For failed payments, we might still want to save the order with updated status
            // and potentially risk metadata if the order object is available.
            if (result.order) {
                const orderWithRisk = analyzeOrderRisk(result.order);
                await orderWithRisk.save();
            }
            return res.redirect(`${redirectBase}/payment-failed?reason=${result.reason || 'unknown'}&orderId=${result.order?._id || ''}`);
        }
    } catch (err) {
        console.error("Payment Verification Error:", err);
        const redirectBase = req.body.udf1 || process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${redirectBase}/payment-failed?reason=internal_error`);
    }
};

exports.checkStatus = async (req, res) => {
    try {
        const Order = require('../models/Order');
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ status: 'NOT_FOUND' });
        }
        res.json({ status: order.status });
    } catch (err) {
        // Handle invalid object ID
        res.status(500).json({ status: 'ERROR', error: err.message });
    }
};
