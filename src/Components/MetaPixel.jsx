import { useEffect } from 'react';
import config from '../config';

const MetaPixel = () => {
    useEffect(() => {
        const loadMetaPixel = async () => {
            try {
                const domain = window.location.hostname;
                console.log(`🔍 Fetching Meta Pixel config for domain: ${domain}`);

                const res = await fetch(`${config.API_URL}/brand/config`);
                const data = await res.json();

                if (data.meta_pixel_id && data.meta_pixel_id.trim() !== '') {
                    // Check if Meta Pixel is already loaded
                    if (window.fbq) {
                        console.log(`⚠️ Meta Pixel already loaded`);
                        return;
                    }

                    // Inject Meta Pixel script
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

                    window.fbq('init', data.meta_pixel_id);
                    window.fbq('track', 'PageView');

                    console.log(`✅ Meta Pixel loaded successfully!`);
                    console.log(`   Domain: ${domain}`);
                    console.log(`   Pixel ID: ${data.meta_pixel_id}`);
                } else {
                    console.log(`ℹ️ No Meta Pixel ID configured for domain: ${domain}`);
                }
            } catch (err) {
                console.error('❌ Failed to load Meta Pixel:', err);
            }
        };

        loadMetaPixel();
    }, []);

    return null; // This component doesn't render anything
};

export default MetaPixel;
