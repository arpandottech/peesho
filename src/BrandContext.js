import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from './config';

const BrandContext = createContext();

export const useBrand = () => {
    return useContext(BrandContext);
};

export const BrandProvider = ({ children }) => {
    const [brandConfig, setBrandConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    useEffect(() => {
        const isProduction = config.ENV === 'production' ||
            (window.location.hostname !== 'localhost' &&
                window.location.hostname !== '127.0.0.1');

        // Async Pixel Loading (Non-Blocking)
        const loadPixelScript = () => {
            if (isProduction && !window.fbq) {
                (function (f, b, e, v, n, t, s) {
                    if (f.fbq) return; n = f.fbq = function () {
                        n.callMethod ?
                            n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                    };
                    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
                    n.queue = []; t = b.createElement(e); t.async = !0;
                    t.src = v; s = b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t, s)
                })(window, document, 'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                console.log('📱 Meta Pixel script loaded');
            }
        };

        const fetchBrandConfig = async () => {
            try {
                const response = await axios.get(`${config.API_URL}/brand/config`);
                setBrandConfig(response.data);

                // Set Meta Title
                if (response.data.brand_name) {
                    document.title = response.data.brand_name;
                }

                // Set Favicon
                if (response.data.theme?.logoUrl) {
                    let link = document.querySelector("link[rel~='icon']");
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.getElementsByTagName('head')[0].appendChild(link);
                    }
                    link.href = response.data.theme.logoUrl;
                }

                // Defer Pixel Init (After UI Renders)
                if (isProduction && response.data.meta_pixel_id) {
                    console.log(`🎯 Initializing Meta Pixel for domain: ${window.location.hostname}`);
                    console.log(`   Pixel ID: ${response.data.meta_pixel_id}`);

                    // Use requestIdleCallback to load pixel during idle time
                    const initPixel = () => {
                        if (window.fbq) {
                            window.fbq('init', response.data.meta_pixel_id);
                            window.fbq('track', 'PageView');
                            console.log('✅ Meta Pixel initialized successfully!');
                        }
                    };

                    if ('requestIdleCallback' in window) {
                        requestIdleCallback(initPixel, { timeout: 2000 });
                    } else {
                        setTimeout(initPixel, 1000); // Fallback for older browsers
                    }
                } else if (!response.data.meta_pixel_id) {
                    console.log('ℹ️ No Meta Pixel ID configured for this domain');
                }

            } catch (error) {
                console.error("Failed to load brand config:", error);
                if (error.response && error.response.status === 403) {
                    setMaintenanceMode(true);
                }
            } finally {
                setLoading(false);
            }
        };

        // Load pixel script asynchronously (non-blocking)
        if ('requestIdleCallback' in window) {
            requestIdleCallback(loadPixelScript, { timeout: 3000 });
        } else {
            setTimeout(loadPixelScript, 500);
        }

        fetchBrandConfig();
    }, []);

    return (
        <BrandContext.Provider value={{ brandConfig, loading, maintenanceMode }}>
            {children}
        </BrandContext.Provider>
    );
};
