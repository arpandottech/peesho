import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { trackPurchase } from '../../utils/MetaPixel';

const ThankYou = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const amount = location.state?.amount || queryParams.get('amount');
    const orderId = location.state?.orderId || queryParams.get('orderId');
    const products = useMemo(() => location.state?.products || [], [location.state]);

    useEffect(() => {
        const verifyAndTrack = async () => {
            if (!amount || !orderId) return;

            const storageKey = `processed_order_${orderId}`;
            const isProcessed = localStorage.getItem(storageKey);

            if (isProcessed) {
                console.log(`Purchase already tracked for Order: ${orderId}`);
                return;
            }

            try {
                // Verify Status with Backend
                const res = await axios.get(`${config.API_URL}/payment/status/${orderId}`);

                if (res.data.status === 'PAYMENT_SUCCESS') {
                    console.log(`Backend Verified. Tracking Purchase for Order: ${orderId}`);
                    trackPurchase(orderId, amount, products);
                    localStorage.setItem(storageKey, 'true');
                } else {
                    console.warn(`Order ${orderId} has status ${res.data.status}. Skipping conversion tracking.`);
                }
            } catch (err) {
                console.error("Failed to verify order status for tracking:", err);
            }
        };

        verifyAndTrack();
    }, [amount, products, orderId]);

    return (
        <div className="bg-gray-50 min-h-screen font-dm flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-sm text-center border border-gray-100">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-[#9F2089] text-4xl" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                    Access your order details in the 'My Orders' section. Thank you for shopping with us!
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-[#9F2089] hover:bg-[#8f1d7b] text-white font-bold py-3.5 px-4 rounded-md transition-colors text-sm uppercase tracking-wide"
                    >
                        Continue Shopping
                    </button>
                    <button
                        onClick={() => navigate('/orders')}
                        className="w-full bg-white border border-[#9F2089] text-[#9F2089] font-bold py-3.5 px-4 rounded-md transition-colors text-sm uppercase tracking-wide hover:bg-pink-50"
                    >
                        View Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThankYou;
