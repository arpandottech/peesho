import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import Footone from '../Home/Footone/Footone';

const MyOrders = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-dm pb-20">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm">
                <h1 className="text-lg font-bold text-gray-800">My Orders</h1>
            </div>

            {/* Empty State */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={40} className="text-[#9F2089]" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
                <p className="text-gray-500 mb-8 max-w-xs">
                    Your order history is empty. Start shopping to fill it up with amazing finds!
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-[#9F2089] text-white px-8 py-3 rounded-md font-bold text-sm tracking-wide shadow-md hover:bg-[#851b73] transition-colors"
                >
                    START SHOPPING
                </button>
            </div>

            <Footone />
        </div>
    );
};

export default MyOrders;
