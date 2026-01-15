// Pixel initialized in BrandContext.js (Async, Non-Blocking)

// Track Page View (for route changes)
export const trackPageView = () => {
    if (window.fbq) {
        setTimeout(() => window.fbq('track', 'PageView'), 0);
    }
};

// Start Checkout (Address/Payment steps)
export const trackCheckoutStep = (stepName) => {
    if (window.fbq) {
        setTimeout(() => window.fbq('track', 'InitiateCheckout'), 0);
    }
}

export const trackAddPaymentInfo = () => {
    if (window.fbq) {
        setTimeout(() => window.fbq('track', 'AddPaymentInfo'), 0);
    }
};

// Custom ViewContent
export const trackViewContent = (product) => {
    if (window.fbq && product) {
        setTimeout(() => {
            window.fbq('track', 'ViewContent', {
                content_ids: [product._id],
                content_type: 'product',
                value: product.price || product.discountPrice,
                currency: 'INR',
                content_name: product.title
            });
        }, 0);
    }
};

// Add to Cart
export const trackAddToCart = (product) => {
    if (window.fbq && product) {
        setTimeout(() => {
            window.fbq('track', 'AddToCart', {
                content_ids: [product.productId || product._id || product.id],
                content_type: 'product',
                value: product.salePrice || product.price,
                currency: 'INR'
            });
        }, 0);
    }
};

// Purchase
export const trackPurchase = (orderId, amount, products) => {
    if (window.fbq) {
        setTimeout(() => {
            window.fbq('track', 'Purchase', {
                content_ids: products.map(p => p.productId || p._id || p.id),
                content_type: 'product',
                value: amount,
                currency: 'INR',
                order_id: orderId
            });
        }, 0);
    }
};
