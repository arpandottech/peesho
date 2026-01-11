import config from '../config';

// Initialize Pixel
export const initPixel = () => {
    const pixelId = config.META_PIXEL_ID;
    if (!pixelId || pixelId === "YOUR_PIXEL_ID_HERE") {
        console.warn("Meta Pixel ID is missing in config.js");
        return;
    }

    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () {
            n.callMethod ?
                n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
        n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s)
    }(window, document, 'script',
        'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
};

// Track Page View (for route changes)
export const trackPageView = () => {
    if (window.fbq) {
        window.fbq('track', 'PageView');
    }
};

// Start Checkout (Address/Payment steps)
// Step 1: Address, Step 2: Payment
export const trackCheckoutStep = (stepName) => {
    if (window.fbq) {
        // 'InitiateCheckout' is usually the start.
        // We can use 'CheckoutProgress' (Custom) or standard events.
        // For standard "Checkout" requests:
        window.fbq('track', 'InitiateCheckout');
    }
}

export const trackAddPaymentInfo = () => {
    if (window.fbq) {
        window.fbq('track', 'AddPaymentInfo');
    }
};

// Custom ViewContent
export const trackViewContent = (product) => {
    if (window.fbq && product) {
        window.fbq('track', 'ViewContent', {
            content_ids: [product._id],
            content_type: 'product',
            value: product.price || product.discountPrice,
            currency: 'INR',
            content_name: product.title
        });
    }
};

// Add to Cart
export const trackAddToCart = (product) => {
    if (window.fbq && product) {
        window.fbq('track', 'AddToCart', {
            content_ids: [product.productId || product._id || product.id],
            content_type: 'product',
            value: product.salePrice || product.price,
            currency: 'INR'
        });
    }
};

// Purchase
export const trackPurchase = (orderId, amount, products) => {
    if (window.fbq) {
        window.fbq('track', 'Purchase', {
            content_ids: products.map(p => p.productId || p._id || p.id),
            content_type: 'product',
            value: amount,
            currency: 'INR',
            order_id: orderId
        });
    }
};
