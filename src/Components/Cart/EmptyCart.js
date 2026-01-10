import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';

const EmptyCart = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-dm pb-20">
            {/* Header */}
            <div className="flex items-center p-4 border-b border-gray-100">
                <FontAwesomeIcon
                    icon={faAngleLeft}
                    className="text-2xl text-gray-500 mr-4 cursor-pointer"
                    onClick={() => navigate('/')}
                />
                <h1 className="text-base font-bold text-gray-800 tracking-wide">CART</h1>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
                {/* Illustration */}
                <div className="w-64 mb-8">
                    <img
                        src="/assets/empty_cart.png"
                        alt="Empty Cart"
                        className="w-full h-full object-contain"
                    />
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-3">Your cart is empty</h2>

                <p className="text-sm text-[#9F2089] mb-8 font-medium">
                    Just relax, let us help you find<br />some first-class products
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="bg-[#9F2089] text-white font-bold py-3 px-12 rounded-md hover:bg-[#8f1d7b] transition-colors text-lg"
                >
                    Start Shopping
                </button>
            </div>
        </div>
    );
};

export default EmptyCart;
