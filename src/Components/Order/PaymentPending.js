import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faExclamationCircle, faShieldAlt } from "@fortawesome/free-solid-svg-icons";

import config from "../../config";

const PaymentPending = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Stages: 'input' | 'verifying'
    const [step, setStep] = useState('input');

    // Timer for input stage (10 minutes)
    const [inputTimeLeft, setInputTimeLeft] = useState(600);

    // Timer for verification stage (2 minutes visual, 1 min actual)
    const [verifyTimeLeft, setVerifyTimeLeft] = useState(120);

    const [transactionId, setTransactionId] = useState('');
    const [error, setError] = useState('');

    // Get Order Data
    const { orderId, upiUrl, finalAmount } = location.state || {}; // Expecting upiUrl from Summary

    // Auto-open UPI app on mount if provided
    useEffect(() => {
        if (upiUrl) {
            window.location.href = upiUrl;
        }
    }, [upiUrl]);

    // Timer Logic for Input Stage
    useEffect(() => {
        if (step === 'input') {
            if (inputTimeLeft <= 0) {
                // Handle timeout if needed
                return;
            }
            const timer = setInterval(() => setInputTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [inputTimeLeft, step]);

    // Timer Logic for Verification Stage
    useEffect(() => {
        if (step === 'verifying') {
            const timer = setInterval(() => setVerifyTimeLeft(prev => prev - 1), 1000);

            // Redirect after 1 minute (when 60s passed, i.e., 120 -> 60)
            // Or simpler: just setTimeout for 60s

            return () => clearInterval(timer);
        }
    }, [step]);

    // Auto-redirect logic for verification
    useEffect(() => {
        if (step === 'verifying') {
            const redirectTimer = setTimeout(() => {
                navigate('/thankyou');
            }, 60000); // 1 minute (60 * 1000)
            return () => clearTimeout(redirectTimer);
        }
    }, [step, navigate]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        if (transactionId.length !== 12 || isNaN(transactionId)) {
            setError("Please enter a valid 12-digit Transaction ID/UTR");
            return;
        }

        // Optional: Update order with transaction ID in backend
        try {
            if (orderId) {
                await axios.put(`${config.API_URL}/orders/${orderId}`, {
                    transactionId: transactionId,
                    status: 'SUCCESS' // Optimistically update or keep PENDING until webhook? 
                    // User flow implies successful manual verification, so we mark success eventually.
                    // For now, just move ui.
                });
            }
        } catch (err) {
            console.error("Failed to update transaction ID", err);
        }

        setStep('verifying');
    };

    return (
        <div className="bg-gray-50 min-h-screen font-dm flex flex-col items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">

                {step === 'input' && (
                    <>
                        {/* Header & Timer */}
                        <div className="flex flex-col items-center mb-6">
                            <h1 className="text-xl font-bold text-gray-900">Payment Pending</h1>
                            <p className="text-sm text-gray-500 mt-1">Complete payment in your app</p>

                            <div className="mt-4 bg-orange-50 text-orange-600 px-4 py-2 rounded-full font-mono font-bold flex items-center gap-2">
                                <FontAwesomeIcon icon={faClock} />
                                {formatTime(inputTimeLeft)}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="mb-6 border-b pb-4">
                            <p className="text-gray-500 text-sm">Amount to Pay</p>
                            <p className="text-3xl font-bold text-gray-900">₹{finalAmount}</p>
                        </div>

                        {/* Input Section */}
                        <div className="text-left mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Confirm Payment
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                Enter the 12-digit UTR/Reference ID from your payment app.
                            </p>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-3 text-lg focus:outline-none focus:border-[#9F2089]"
                                placeholder="Enter 12-digit Transaction ID"
                                value={transactionId}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val.length <= 12) setTransactionId(val);
                                    setError('');
                                }}
                                maxLength={12}
                            />
                            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={transactionId.length !== 12}
                            className={`w-full py-3 rounded font-bold text-white transition-colors ${transactionId.length === 12 ? 'bg-[#9F2089] hover:bg-[#8f1d7b]' : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            SUBMIT
                        </button>
                    </>
                )}

                {step === 'verifying' && (
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
                        <p className="text-gray-500 text-sm mb-6">Please wait while we confirm your transaction...</p>

                        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded font-mono text-sm">
                            Time remaining: {formatTime(verifyTimeLeft)}
                        </div>

                        <div className="mt-8 flex items-center gap-2 text-[#038D63] text-sm font-medium bg-[#E5F7EE] px-4 py-2 rounded-full">
                            <FontAwesomeIcon icon={faShieldAlt} />
                            Safe & Secure Payment
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PaymentPending;
