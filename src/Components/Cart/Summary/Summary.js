import React, { useEffect, useState } from "react";
import axios from 'axios';
import config from "../../../config";
import Firstcart from "../Firstcart/Firstcart";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faTruck, faMoneyBillWave, faCheckCircle, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { ChevronRightIcon } from '@heroicons/react/solid';
import { useCart } from "../../CartContext";

const Summary = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { getCartItems } = useCart();
    const cartItems = getCartItems();

    // Calculate total from cart for fallback
    const cartTotal = cartItems ? cartItems.reduce((total, item) => {
        const price = item.salePrice || item.price || 0;
        return total + (price * (item.quantity || 1));
    }, 0) : 0;

    const totalPrice = location.state?.totalPrice || cartTotal;
    const finalAmount = location.state?.finalAmount || totalPrice;
    const { platformFee, paymentMode, selectedOption } = location.state || {};

    // Use cartItems directly from context if available, otherwise use a default mock for display
    const displayItems = (cartItems && cartItems.length > 0) ? cartItems : [{
        id: 1,
        title: "Trendy Stylish Elegant Gold Plated Bow...",
        price: 188,
        regularPrice: 251,
        image: "https://images.meesho.com/images/products/44009963/s4q8t_512.jpg", // Valid placeholder
        soldBy: "Meesho Supply",
        size: "Free Size",
        quantity: 1
    }];

    const [address, setAddress] = useState(null);

    useEffect(() => {
        const savedAddress = localStorage.getItem("userAddress");
        if (savedAddress) {
            setAddress(JSON.parse(savedAddress));
        }
    }, []);

    /* Create Backend Order Function */
    const createBackendOrder = async (status) => {
        try {
            const orderData = {
                products: displayItems,
                totalAmount: finalAmount,
                paymentMode: paymentMode,
                transactionId: "T" + Date.now(),
                status: status
            };
            const response = await axios.post(`${config.API_URL}/orders`, orderData);
            return response.data;
        } catch (error) {
            console.error("Error creating order:", error);
            alert("Failed to create order. Please try again.");
            return null;
        }
    };

    const handlePlaceOrder = async () => {
        if (paymentMode === 'online') {
            // 1. Create PENDING Order in Backend
            const newOrder = await createBackendOrder('PENDING');
            if (!newOrder) return;

            const upiId = "fsv.470000099389580@icici";
            const transactionRef = newOrder.transactionId; // Use consistent Ref
            const transactionNote = "Meesho Order";

            // Construct standard UPI Intent Link
            const upiUrl = `upi://pay?pa=${upiId}&pn=Meesho Shopping&am=${finalAmount}&cu=INR&tn=${transactionNote}&tr=${transactionRef}`;

            // Navigate to pending/waiting page with ORDER ID and UPI URL
            navigate("/payment-pending", { state: { ...location.state, orderId: newOrder._id, upiUrl, finalAmount } });

        } else {
            // Cash on Delivery - Direct Success
            // Create SUCCESS Order in Backend
            // Create SUCCESS Order in Backend
            const newOrder = await createBackendOrder('SUCCESS');
            navigate("/thankyou", {
                state: {
                    amount: finalAmount,
                    products: displayItems,
                    orderId: newOrder?._id || 'COD-' + Date.now()
                }
            });
        }
    };

    const handleTitleClick = () => {
        navigate('/payments');
    };

    // Calculate discounts (Mock logic to match screenshot style if needed)
    const totalOriginalPrice = totalPrice + 63; // Assuming some discount
    const totalDiscount = 63;

    return (
        <div className="bg-gray-100 min-h-screen font-dm pb-32">
            <Firstcart title="SUMMARY" currentStep={4} onTitleClick={handleTitleClick} />

            {/* Estimated Delivery Banner */}
            <div className="bg-white p-3 px-4 mb-2 flex items-center text-[#2F74EB] text-sm font-medium shadow-sm">
                <FontAwesomeIcon icon={faTruck} className="mr-3" />
                <span>Estimated Delivery by Monday, 12th Jan</span>
            </div>

            <div className="max-w-xl mx-auto space-y-2">

                {/* Product Details Section */}
                {displayItems.map((item, index) => {
                    const discountPercentage = item.regularPrice > item.salePrice
                        ? Math.round(((item.regularPrice - item.salePrice) / item.regularPrice) * 100)
                        : 0;

                    return (
                        <div key={index} className="bg-white  border-gray-200 shadow-sm">
                            <div className="p-4 flex gap-4">
                                <div className="w-20 h-20 flex-shrink-0">
                                    <img
                                        src={item.image || "https://images.meesho.com/images/products/44009963/s4q8t_512.jpg"}
                                        alt={item.title || item.name}
                                        className="w-full h-full object-cover rounded"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://images.meesho.com/images/products/44009963/s4q8t_512.jpg" }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-gray-800 text-sm font-medium leading-tight mb-1 truncate">{dataCheck(item.title || item.name)}</h4>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-gray-900 font-bold">₹{item.salePrice || item.price || totalPrice}</span>
                                        {(item.regularPrice || item.originalPrice) > (item.salePrice || item.price) && (
                                            <>
                                                <span className="text-gray-400 text-xs line-through">₹{item.regularPrice || item.originalPrice}</span>
                                                <span className="text-[#038D63] text-xs font-semibold">{discountPercentage}% Off</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Timer Mock */}
                                    <div className="inline-flex items-center gap-1 bg-[#FFF5EC] border border-[#ffcca3] rounded px-1.5 py-0.5 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                                        <span className="text-[10px] text-orange-600 font-medium">00h : 46m : 31s</span>
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        <span>All issue easy returns</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        <span>Size: {item.size || "Free Size"}</span> • <span>Qty: {item.qty || item.quantity || 1}</span>
                                    </div>
                                </div>
                                <ChevronRightIcon className="h-5 w-5 text-gray-400 self-center" />
                            </div>
                            <div className="border-t border-gray-100 p-3 flex justify-between items-center text-xs text-gray-500 bg-gray-50">
                                <span>Sold by: AWADH SKY</span>
                                <span>Free Delivery</span>
                            </div>
                        </div>
                    );
                })}

                {/* Address Section */}
                <div
                    className="bg-white p-4 shadow-sm flex items-start justify-between cursor-pointer"
                    onClick={() => navigate('/address', { state: { totalPrice } })}
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#2F74EB]" />
                            <h3 className="text-base font-bold text-gray-800">Delivery Address</h3>
                        </div>
                        {address ? (
                            <div className="ml-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2 font-semibold text-gray-900">
                                    <span>{address.fullName}</span>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span>{address.mobileNumber}</span>
                                </div>
                                <p className="mt-0.5 leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap max-w-xs">{address.houseNo}, {address.roadName}, {address.city}, {address.state} - {address.pincode}</p>
                            </div>
                        ) : (
                            <p className="ml-6 text-sm text-red-500">Add Address</p>
                        )}
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 mt-1" />
                </div>

                {/* Payment Mode */}
                <div
                    className="bg-white p-4 shadow-sm flex items-center justify-between cursor-pointer"
                    onClick={() => navigate('/payments', { state: { totalPrice } })}
                >
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-1">Payment Mode</h3>
                        <p className="text-sm font-medium text-gray-900 uppercase">{paymentMode === 'online' ? (selectedOption || 'UPI') : 'Cash On Delivery'}</p>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </div>

                {/* Price Details */}
                <div className="bg-white p-4 shadow-sm pb-2">
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Price Details ({cartItems.length || 1} Items)</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span className="underline decoration-dotted">Total Product Price</span>
                            <span>+ ₹{totalOriginalPrice || (totalPrice + 50)}</span>
                        </div>
                        <div className="flex justify-between text-[#038D63]">
                            <span className="underline decoration-dotted">Total Discounts</span>
                            <span>- ₹{totalDiscount || 50}</span>
                        </div>
                        {platformFee > 0 && (
                            <div className="flex justify-between">
                                <span>Platform Fee</span>
                                <span>+ ₹{platformFee}</span>
                            </div>
                        )}
                        <div className="border-t border-gray-100 my-2 pt-2"></div>
                        <div className="flex justify-between font-bold text-gray-800 text-base">
                            <span>Order Total</span>
                            <span>₹{finalAmount || totalPrice}</span>
                        </div>
                    </div>
                </div>

                {/* Green Savings Banner */}
                <div className="bg-[#E5F7EE] p-3 flex items-center justify-center gap-2 mx-4 rounded">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-[#038D63] text-sm" />
                    <span className="text-[#038D63] text-sm font-medium">Yay! Your total discount is ₹{totalDiscount || 50}</span>
                </div>

            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 w-full bg-white flex items-center justify-between p-3 px-4 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-20">
                <div className="flex flex-col">
                    <h1 className="font-bold text-lg text-gray-900">
                        ₹{finalAmount || totalPrice}
                    </h1>
                    <p className="text-xs text-[#9F2089] font-bold cursor-pointer uppercase tracking-tight">VIEW PRICE DETAILS</p>
                </div>
                <button
                    onClick={handlePlaceOrder}
                    className="bg-[#9F2089] hover:bg-[#8f1d7b] text-white font-bold text-base rounded py-3 px-10 transition-colors"
                >
                    Pay Now
                </button>
            </div>

        </div>
    );
};

// Helper to handle long titles mock
const dataCheck = (str) => {
    return str && str.length > 35 ? str.substring(0, 35) + "..." : str;
}

export default Summary;
