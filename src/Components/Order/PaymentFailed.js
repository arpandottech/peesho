import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

const PaymentFailed = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reason = searchParams.get('reason') || 'Transaction failed';
    const orderId = searchParams.get('orderId'); // Extract orderId for retry

    const [isLoading, setIsLoading] = useState(false);

    const handleRetry = async () => {
        if (!orderId) {
            alert("Cannot retry: Order ID missing. Please create a new order.");
            return navigate('/summary');
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${config.API_URL}/payment/retry`, { orderId });

            if (response.data.action && response.data.params) {
                const { action, params } = response.data;
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = action;

                for (const key in params) {
                    if (params[key]) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = params[key];
                        form.appendChild(input);
                    }
                }
                document.body.appendChild(form);
                form.submit();
            } else {
                alert("Retry Configuration Error. Please try again.");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Retry Error:", error);
            const msg = error.response?.data?.error || "Retry Failed";
            alert(msg);
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-dm flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-sm text-center border border-gray-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-4xl" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                <p className="text-gray-600 mb-6 text-sm">
                    Don't worry, no money was deducted. Please try again.
                </p>

                {reason && (
                    <div className="bg-red-50 text-red-600 p-3 rounded text-xs mb-8 border border-red-100">
                        Reason: <span className="font-medium capitalize">{reason.replace(/_/g, ' ')}</span>
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={handleRetry}
                        disabled={isLoading}
                        className={`w-full bg-[#9F2089] hover:bg-[#8f1d7b] text-white font-bold py-3.5 px-4 rounded-md transition-colors text-sm uppercase tracking-wide ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isLoading ? 'Processing...' : 'Retry Payment'}
                    </button>
                    <button
                        onClick={() => navigate('/payments')}
                        className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3.5 px-4 rounded-md transition-colors text-sm uppercase tracking-wide hover:bg-gray-50"
                    >
                        Change Payment Method
                    </button>
                </div>
            </div>

            {/* Loader Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center text-white">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};

export default PaymentFailed;
