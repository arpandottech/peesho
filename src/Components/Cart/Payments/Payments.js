import React, { useState } from "react";
import Firstcart from "../Firstcart/Firstcart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import gpay from "../../../assets/gpay_icon.svg";
import phonepay from "../../../assets/phonepe.svg";
import paytm from "../../../assets/paytm_icon.svg";
import wpay from "../../../assets/whatspp_pay.svg";
import "./Payments.css"; // Ensure you have your CSS imported
import { useLocation } from "react-router-dom";
import { ChevronDownIcon } from '@heroicons/react/solid';
import { useNavigate } from 'react-router-dom';



const Payments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const totalPrice = location.state?.totalPrice || 0;

  const [paymentMode, setPaymentMode] = useState("online"); // 'cod' or 'online'
  const [showPriceDetails, setShowPriceDetails] = useState(true);

  const [selectedOption, setSelectedOption] = useState("");

  const handleTitleClick = () => {
    navigate('/address');
  };

  const paymentMethods = [
    { id: "GPay", name: "GPay", logo: gpay },
    { id: "PhonePe", name: "PhonePe", logo: phonepay },
    { id: "Paytm", name: "Paytm", logo: paytm },
    { id: "WhatsAppPay", name: "WhatsApp Pay", logo: wpay },
  ];

  // Platform Fee (Temporarily removed)
  const [platformFee] = useState(0);
  const finalAmount = totalPrice + platformFee;
  const [errorMessage, setErrorMessage] = useState("");

  const handlePayNow = () => {
    if (paymentMode === 'online' && !selectedOption) {
      setErrorMessage("Please select a UPI app to proceed.");
      return;
    }
    setErrorMessage("");

    navigate('/summary', {
      state: {
        totalPrice,
        platformFee,
        finalAmount,
        paymentMode,
        selectedOption: paymentMode === 'online' ? selectedOption : null
      }
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen font-dm pb-32">
      <Firstcart title="PAYMENT METHOD" currentStep={3} onTitleClick={handleTitleClick} />

      <div className="p-4 max-w-xl mx-auto space-y-4">

        {/* Cash on Delivery Option (Disabled) */}
        <div
          className={`bg-white p-4 rounded-lg border flex items-center justify-between cursor-not-allowed opacity-50 relative border-gray-200 bg-gray-50`}
        >
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-gray-500">₹{finalAmount}</span>
            <span className="text-gray-500 font-medium">Cash on Delivery</span>
            {/* Icon placeholder for Cash/Money */}
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              <FontAwesomeIcon icon={faShieldAlt} size="xs" />
            </div>
          </div>
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center border-gray-300`}>
            {/* Unselected State */}
          </div>
          <p className="absolute bottom-1 right-2 text-[10px] text-red-500 font-medium">Temporarily Unavailable</p>
        </div>

        {/* Pay Online Option */}
        <div className={`bg-white rounded-lg border overflow-hidden ${paymentMode === 'online' ? 'border-[#9F2089]' : 'border-gray-200'}`}>
          <div
            className={`p-4 flex items-center justify-between cursor-pointer ${paymentMode === 'online' ? 'bg-[#FFF5FC]' : ''}`}
            onClick={() => setPaymentMode('online')}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm line-through">₹{totalPrice}</span>
                <span className="font-bold text-lg text-gray-800">₹{finalAmount}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-medium text-gray-800">Pay Online</span>
              </div>
            </div>

            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMode === 'online' ? 'border-[#9F2089] bg-[#9F2089]' : 'border-gray-400'}`}>
              {paymentMode === 'online' && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </div>

          {/* Bank Offer Badge */}
          {paymentMode === 'online' && (
            <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-t border-dashed border-gray-200">
              <div className="flex items-center gap-2 text-xs font-medium text-[#038D63]">
                <span className="w-4 h-4 bg-[#038D63] text-white rounded-full flex items-center justify-center text-[10px]">%</span>
                Extra discount with bank offers
              </div>
              <span className="text-[#038D63] text-xs font-bold cursor-pointer">View Offers</span>
            </div>
          )}

          {/* Expanded Payment Methods (UPI) */}
          {paymentMode === 'online' && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-base text-gray-800">Pay by any UPI App</div>
                </div>
                <div className="text-xs text-[#038D63] font-bold">Offers Available</div>
                <ChevronDownIcon className="h-5 w-5 text-gray-400 transform rotate-180" />
              </div>

              <div className="space-y-4 pl-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => setSelectedOption(method.id)}
                  >
                    <div className="flex items-center gap-4">
                      <img src={method.logo} alt={method.name} className="w-8 h-8 object-contain" />
                      <span className="text-sm font-medium text-gray-700">{method.name}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedOption === method.id ? 'border-[#9F2089]' : 'border-gray-300'}`}>
                      {selectedOption === method.id && <div className="w-2 h-2 bg-[#9F2089] rounded-full" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>



        {/* Price Details Accordion */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={() => setShowPriceDetails(!showPriceDetails)}
          >
            <span className="font-medium text-gray-800">Price Details (1 Items)</span>
            <ChevronDownIcon className={`h-5 w-5 text-gray-500 transition-transform ${showPriceDetails ? 'rotate-180' : ''}`} />
          </div>

          {showPriceDetails && (
            <div className="px-4 pb-4 bg-white border-t border-gray-100 pt-3 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Total Product Price</span>
                <span>₹{totalPrice}</span>
              </div>

              <div className="flex justify-between text-gray-800">
                <span>Platform Fee</span>
                <span>+ ₹{platformFee}</span>
              </div>

              <hr className="border-dashed" />
              <div className="flex justify-between font-bold text-gray-800 text-base">
                <span>Order Total</span>
                <span>₹{finalAmount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer Text */}
        <div className="text-center text-xs text-gray-500 mt-4 px-4 bg-gray-50 pb-2">
          Clicking on 'Continue' will not deduct any money
        </div>

        {errorMessage && (
          <div className="text-center text-sm text-red-600 font-medium mt-2 bg-red-50 p-2 rounded mx-4 border border-red-200">
            {errorMessage}
          </div>
        )}

      </div>

      {/* Sticky Bottom Footer */}
      <div className="fixed bottom-0 w-full bg-white flex items-center justify-between p-3 px-4 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-20">
        <div className="flex flex-col">
          <h1 className="font-bold text-lg text-gray-900">
            ₹{finalAmount}
          </h1>
          <p
            className="font-bold text-xs text-[#9F2089] cursor-pointer tracking-wide"
            onClick={() => setShowPriceDetails(true)}
          >
            VIEW PRICE DETAILS
          </p>
        </div>
        <button
          onClick={handlePayNow}
          className="bg-[#9F2089] hover:bg-[#8f1d7b] text-white font-bold text-base rounded py-3 px-10 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Payments;
