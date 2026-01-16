import React, { useEffect, useState } from "react";
import axios from 'axios';
import config from "../../../config";
import Firstcart from "../Firstcart/Firstcart";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faTruck, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { ChevronRightIcon } from '@heroicons/react/solid';
import { useCart } from "../../CartContext";
import { useBrand } from "../../../BrandContext";
import { trackCheckoutStep } from "../../../utils/MetaPixel";

const Summary = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { getCartItems, paymentInfo } = useCart();
    const cartItems = getCartItems();

    // Payment State
    const [isLoading, setIsLoading] = useState(false);

    // Calculate total from cart for fallback
    const cartTotal = cartItems ? cartItems.reduce((total, item) => {
        const price = item.salePrice || item.price || 0;
        return total + (price * (item.quantity || 1));
    }, 0) : 0;

    // Prioritize location state (immediate flow), then global context (persistence), then derived defaults
    const effectivePaymentInfo = location.state || paymentInfo || {};

    const totalPrice = effectivePaymentInfo.totalPrice || cartTotal;
    const finalAmount = effectivePaymentInfo.finalAmount || totalPrice;
    const { paymentMode, selectedOption } = effectivePaymentInfo;

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

    const { brandConfig } = useBrand(); // Get brand config

    /* Create Backend Order Function */
    const createBackendOrder = async (status) => {
        try {
            const orderData = {
                products: displayItems,
                totalAmount: finalAmount,
                paymentMode: paymentMode,
                transactionId: "T" + Date.now(),
                status: status,
                domain: window.location.origin, // Store frontend origin for safe redirects
                pixelId: brandConfig?.meta_pixel_id // Store Pixel ID
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
        // Track Intention to Buy (Abandoned Checkout)
        trackCheckoutStep('InitiateCheckout');

        const isOnline = ['UPI', 'Card', 'NetBanking', 'Wallets', 'EMI'].includes(paymentMode) || paymentMode === 'online';

        if (isOnline) {
            setIsLoading(true);
            // 1. Create PAYMENT_PENDING Order
            const newOrder = await createBackendOrder('PAYMENT_PENDING');
            if (!newOrder) {
                setIsLoading(false);
                return;
            }

            try {
                // 2. Initiate Payment (Form Redirect)
                const paymentPayload = {
                    txnid: newOrder.transactionId,
                    amount: finalAmount,
                    productinfo: "Meesho Order",
                    firstname: address ? address.fullName.split(' ')[0] : "User",
                    email: "user@example.com",
                    phone: address ? address.mobileNumber : "9999999999",
                    paymentMode: paymentMode,
                    surl: `${config.API_URL}/payment/success`,
                    furl: `${config.API_URL}/payment/failure`,
                    udf1: window.location.origin, // Send Frontend Origin for dynamic redirect
                    ...(paymentMode === 'Card' && { cardDetails: effectivePaymentInfo.cardDetails }),
                    ...(paymentMode === 'UPI' && { upiVpa: selectedOption.includes('@') ? selectedOption : null }),
                    ...(paymentMode === 'NetBanking' && { bankcode: selectedOption }),
                    ...(paymentMode === 'EMI' && { bankcode: selectedOption.split(' ')[0] }),
                    ...(paymentMode === 'Wallets' && { bankcode: selectedOption })
                };

                const response = await axios.post(`${config.API_URL}/payment/initiate`, paymentPayload);

                // Form Post Logic for Standard Checkout
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
                    return;

                } else {
                    console.log("Unexpected Payment Response:", response.data);
                    alert("Payment Configuration Error. Please try again.");
                    setIsLoading(false);
                }

            } catch (error) {
                console.error("Payment Initiation Error:", error);
                const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
                alert(`Payment Service Error: ${errorMessage}`);
                setIsLoading(false);
            }

        } else {
            // Cash on Delivery
            const newOrder = await createBackendOrder('PAYMENT_SUCCESS');
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

    // Brand Config
    // Brand Config
    const primaryColor = brandConfig?.theme?.primaryColor || "#9F2089";
    const brandName = brandConfig?.brand_name || "Meesho Supply";

    // Calculate discounts
    const totalOriginalPrice = totalPrice + 63;
    const totalDiscount = 63;

    return (
        <>
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
                                    <span>Sold by: {brandName}</span>
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
                            <p className="text-sm font-medium text-gray-900 uppercase">{(['UPI', 'Card', 'NetBanking', 'Wallets', 'EMI'].includes(paymentMode) || paymentMode === 'online') ? (selectedOption || paymentMode || 'Online') : 'Cash On Delivery'}</p>
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
                        <p className="text-xs font-bold cursor-pointer uppercase tracking-tight" style={{ color: primaryColor }}>VIEW PRICE DETAILS</p>
                    </div>
                    <button
                        onClick={handlePlaceOrder}
                        className="text-white font-bold text-base rounded py-3 px-10 transition-colors"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Pay Now
                    </button>
                </div>
            </div>

            {/* Payment Loader Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center text-white">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-bold text-lg">Processing secure payment...</p>
                    <p className="text-sm text-gray-200">Please do not close this window</p>
                </div>
            )}
        </>
    );
};

// Helper to handle long titles mock
const dataCheck = (str) => {
    return str && str.length > 35 ? str.substring(0, 35) + "..." : str;
}

export default Summary;

