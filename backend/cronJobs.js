const cron = require('node-cron');
const Order = require('./models/Order');

// Run every 10 minutes
// '*/10 * * * *'
const initCronJobs = () => {
    cron.schedule('*/10 * * * *', async () => {
        console.log('Running Abandoned Payment Cleanup...');
        try {
            // Threshold: 30 minutes ago
            const threshold = new Date(Date.now() - 30 * 60 * 1000);

            // Find candidates
            // We want orders that are:
            // 1. PAYMENT_PENDING (or CREATED if that counts as initiated)
            // 2. Created/Updated before threshold
            // Let's stick to status 'PAYMENT_PENDING' or 'CREATED'
            const abandonedOrders = await Order.find({
                status: { $in: ['CREATED', 'PAYMENT_PENDING'] },
                createdAt: { $lt: threshold }
            });

            console.log(`Found ${abandonedOrders.length} potential abandoned orders.`);

            for (const order of abandonedOrders) {
                // Use the updateStatus method to ensure audit log
                order.updateStatus('PAYMENT_ABANDONED', 'System Auto-Cleanup: Timeout');
                await order.save();
                console.log(`Order ${order.transactionId} marked as ABANDONED.`);
            }

        } catch (err) {
            console.error('Error in Abandoned Payment Cleanup Cron:', err);
        }
    });

    console.log('Cron Jobs Initialized: Abandoned Payment Cleanup (Every 10m)');
};

module.exports = initCronJobs;
