import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const ThankYou = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 min-h-screen font-dm flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-sm text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-4xl" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-600 mb-8">
                    Your order has been placed successfully. You will receive a confirmation message shortly.
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-[#9F2089] hover:bg-[#8f1d7b] text-white font-bold py-3 px-4 rounded transition-colors"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
};

export default ThankYou;
