import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faExclamationCircle, faShieldAlt } from "@fortawesome/free-solid-svg-icons";

import config from "../../config";

const PaymentPending = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Timer for safety timeout (e.g. 5 mins)
    const [timeLeft, setTimeLeft] = useState(300);

    // Get Order Data
    const { orderId, upiUrl, finalAmount } = location.state || {};

    // Auto-open UPI app on mount if provided
    useEffect(() => {
        if (upiUrl) {
            window.location.href = upiUrl;
        }
    }, [upiUrl]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Polling Logic
    useEffect(() => {
        if (!orderId) return;

        const checkStatus = async () => {
            try {
                const response = await axios.get(`${config.API_URL}/payment/status/${orderId}`);
                if (response.data.status === 'SUCCESS') {
                    navigate('/thankyou', { state: { orderId, amount: finalAmount } });
                } else if (response.data.status === 'FAILED') {
                    navigate('/payment-failed?reason=transaction_failed');
                }
            } catch (err) {
                console.error("Status check failed", err);
            }
        };

        const interval = setInterval(checkStatus, 3000); // Check every 3 seconds
        return () => clearInterval(interval);
    }, [orderId, navigate, finalAmount]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-gray-50 min-h-screen font-dm flex flex-col items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">

                <div className="py-8 flex flex-col items-center">
                    {/* Sand/Loading GIF */}
                    <div className="w-32 h-32 mb-6">
                        <img
                            src="https://media.tenor.com/On7KVXHzML4AAAAj/loading-gif.gif"
                            alt="Verifying..."
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your payment</h2>
                    <p className="text-gray-500 text-sm mb-6">Please check your UPI app to complete the payment.</p>
                    <p className="text-gray-400 text-xs mb-6">Do not hit back or close this window.</p>

                    <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded font-mono text-sm">
                        Session expires in: {formatTime(timeLeft)}
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-[#038D63] text-sm font-medium bg-[#E5F7EE] px-4 py-2 rounded-full">
                        <FontAwesomeIcon icon={faShieldAlt} />
                        Safe & Secure Payment
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PaymentPending;
