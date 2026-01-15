import React, { useState, useEffect } from "react";
import Firstcart from "../Firstcart/Firstcart";
import { trackAddPaymentInfo } from "../../../utils/MetaPixel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldAlt, faCreditCard, faUniversity, faWallet, faPercentage } from "@fortawesome/free-solid-svg-icons";
import gpay from "../../../assets/gpay_icon.svg";
import phonepay from "../../../assets/phonepe.svg";
import paytm from "../../../assets/paytm_icon.svg";
import wpay from "../../../assets/whatspp_pay.svg";
import "./Payments.css"; // Ensure you have your CSS imported
import { useLocation } from "react-router-dom";
import { ChevronDownIcon } from '@heroicons/react/solid';
import { useNavigate } from 'react-router-dom';
import { useCart } from "../../../Components/CartContext";
import { useBrand } from "../../../BrandContext";


const Payments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItems, setPaymentInfo } = useCart();
  const { brandConfig } = useBrand();

  // Default to all allowed if config not loaded yet, or strictly wait? 
  // Better to default to all to avoid flicker, or wait? 
  // User req: "Load Payment rules".
  const allowedMethods = brandConfig?.enabled_payment_methods || ['UPI', 'COD', 'Card', 'NetBanking', 'EMI', 'Wallets'];
  const isMethodEnabled = (method) => allowedMethods.includes(method);

  const cartItems = getCartItems();

  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.salePrice || item.price || 0;
    return total + (price * (item.quantity || 1));
  }, 0);

  const totalPrice = location.state?.totalPrice || cartTotal;

  // Payment State
  const [selectedSection, setSelectedSection] = useState("UPI"); // Default to UPI
  const [selectedOption, setSelectedOption] = useState(""); // For sub-options like specific UPI app or Wallet
  const [showPriceDetails, setShowPriceDetails] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Card State
  const [cardState, setCardState] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
    saveCard: false
  });
  const [cardErrors, setCardErrors] = useState({});

  // NetBanking State
  const [netBankingBank, setNetBankingBank] = useState("");

  // EMI State
  const [emiState, setEmiState] = useState({
    bank: "",
    tenure: "",
    interest: ""
  });

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 16);
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardState({ ...cardState, number: value });
    if (cardErrors.number) setCardErrors({ ...cardErrors, number: "" });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 3) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setCardState({ ...cardState, expiry: value });
    if (cardErrors.expiry) setCardErrors({ ...cardErrors, expiry: "" });
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCardState({ ...cardState, cvv: value });
    if (cardErrors.cvv) setCardErrors({ ...cardErrors, cvv: "" });
  };

  const handleNameChange = (e) => {
    setCardState({ ...cardState, name: e.target.value });
    if (cardErrors.name) setCardErrors({ ...cardErrors, name: "" });
  };

  const validateCard = () => {
    const errors = {};
    const cleanNumber = cardState.number.replace(/\s/g, '');
    if (cleanNumber.length < 16) errors.number = "Invalid card number";

    if (cardState.expiry.length !== 5) {
      errors.expiry = "Invalid expiry";
    } else {
      const [month, year] = cardState.expiry.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (parseInt(month) < 1 || parseInt(month) > 12) errors.expiry = "Invalid month";
      else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errors.expiry = "Card expired";
      }
    }

    if (cardState.cvv.length < 3) errors.cvv = "Invalid CVV";
    if (!cardState.name.trim()) errors.name = "Name required";

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // EMI Logic
  const emiBanks = ["HDFC Bank", "SBI", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank"];
  const emiTenures = [
    { months: 3, rate: 14 },
    { months: 6, rate: 15 },
    { months: 9, rate: 15 },
    { months: 12, rate: 16 }
  ];

  const calculateEmi = (months, rate) => {
    const r = rate / 12 / 100;
    const emi = finalAmount * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    return Math.round(emi);
  };

  // Platform Fee (Temporarily removed)
  const [platformFee] = useState(0);
  const finalAmount = totalPrice + platformFee;

  useEffect(() => {
    trackAddPaymentInfo();
  }, []);

  const handleTitleClick = () => {
    navigate('/address');
  };

  const upiMethods = [
    { id: "GPay", name: "GPay", logo: gpay },
    { id: "PhonePe", name: "PhonePe", logo: phonepay },
    { id: "Paytm", name: "Paytm", logo: paytm },
    { id: "WhatsAppPay", name: "WhatsApp Pay", logo: wpay },
  ];

  const walletMethods = [
    { id: "PaytmWallet", name: "Paytm Wallet" },
    { id: "PhonePeWallet", name: "PhonePe Wallet" },
    { id: "Freecharge", name: "Freecharge" },
    { id: "Mobikwik", name: "Mobikwik" },
  ];

  const handlePayNow = () => {
    let selectedOptionValue = selectedOption;

    if (selectedSection === 'UPI') {
      if (!selectedOption) {
        setErrorMessage("Please select a UPI app to proceed.");
        return;
      }
      // Get readable name
      const method = upiMethods.find(m => m.id === selectedOption);
      selectedOptionValue = method ? method.name : selectedOption;
    }

    if (selectedSection === 'Card') {
      if (!validateCard()) {
        return;
      }
      selectedOptionValue = `Card **** ${cardState.number.slice(-4)}`;
    }

    if (selectedSection === 'NetBanking') {
      if (!netBankingBank) {
        setErrorMessage("Please select a bank to proceed.");
        return;
      }
      selectedOptionValue = netBankingBank;
    }

    if (selectedSection === 'EMI') {
      if (!emiState.bank || !emiState.tenure) {
        setErrorMessage("Please select EMI bank and tenure.");
        return;
      }
      selectedOptionValue = `${emiState.bank} EMI - ${emiState.tenure} Months`;
    }

    if (selectedSection === 'Wallets') {
      const method = walletMethods.find(m => m.id === selectedOption);
      selectedOptionValue = method ? method.name : selectedOption;
    }
    // Add validations for other methods if actual integration was present

    setErrorMessage("");

    const paymentData = {
      totalPrice,
      platformFee,
      finalAmount,
      paymentMode: selectedSection,
      selectedOption: selectedOptionValue || selectedOption,
      cardDetails: selectedSection === 'Card' ? cardState : null, // Pass card details
      upiApp: selectedSection === 'UPI' ? selectedOption : null // Pass UPI App ID
    };

    setPaymentInfo(paymentData);

    navigate('/summary', {
      state: paymentData
    });
  };

  const renderPaymentHeader = (id, title, icon, subtitle = null) => {
    const isSelected = selectedSection === id;
    return (
      <div
        className={`p-4 flex items-center justify-between cursor-pointer ${isSelected ? 'bg-[#FFF5FC]' : ''}`}
        onClick={() => {
          setSelectedSection(id);
          setSelectedOption(""); // Reset sub-option when switching main sections
          setErrorMessage("");
        }}
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-gray-500 w-5 flex justify-center">{icon}</div>}
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{title}</span>
            {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#9F2089] bg-[#9F2089]' : 'border-gray-400'}`}>
          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen font-dm pb-32">
      <Firstcart title="PAYMENT METHOD" currentStep={3} onTitleClick={handleTitleClick} />

      <div className="p-4 max-w-xl mx-auto space-y-4">

        {/* Cash on Delivery Option */}
        {isMethodEnabled('COD') && (
          <div
            className={`bg-white p-4 rounded-lg border flex items-center justify-between cursor-not-allowed opacity-50 relative border-gray-200 bg-gray-50`}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg text-gray-500">₹{finalAmount}</span>
              <span className="text-gray-500 font-medium">Cash on Delivery</span>
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <FontAwesomeIcon icon={faShieldAlt} size="xs" />
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center border-gray-300`}>
            </div>
            <p className="absolute bottom-1 right-2 text-[10px] text-red-500 font-medium">Temporarily Unavailable</p>
          </div>
        )}

        {/* UPI Section */}
        {isMethodEnabled('UPI') && (
          <div className={`bg-white rounded-lg border overflow-hidden ${selectedSection === 'UPI' ? 'border-[#9F2089]' : 'border-gray-200'}`}>
            {renderPaymentHeader('UPI', 'UPI', null, 'Pay by any UPI App')}

            {selectedSection === 'UPI' && (
              <>
                {/* Bank Offer Badge for UPI */}
                <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-t border-dashed border-gray-200">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#038D63]">
                    <span className="w-4 h-4 bg-[#038D63] text-white rounded-full flex items-center justify-center text-[10px]">%</span>
                    Extra discount with bank offers
                  </div>
                  <span className="text-[#038D63] text-xs font-bold cursor-pointer">View Offers</span>
                </div>

                <div className="p-4 border-t border-gray-100">
                  <div className="space-y-4 pl-2">
                    {upiMethods.map((method) => (
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
                  {/* UPI ID Input (Optional addition based on standard flows) */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-2">OR Pay using UPI ID</p>
                    <input type="text" placeholder="e.g. mobileNumber@upi" className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#9F2089]" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Credit / Debit Card Section */}
        {isMethodEnabled('Card') && (
          <div className={`bg-white rounded-lg border overflow-hidden ${selectedSection === 'Card' ? 'border-[#9F2089]' : 'border-gray-200'}`}>
            {renderPaymentHeader('Card', 'Credit / Debit Card', <FontAwesomeIcon icon={faCreditCard} />)}

            {selectedSection === 'Card' && (
              <div className="p-4 border-t border-gray-100 space-y-3">
                <p className="text-xs text-gray-500 mb-2">Add new card</p>

                <div>
                  <input
                    type="text"
                    placeholder="Card Number"
                    className={`w-full border ${cardErrors.number ? 'border-red-500' : 'border-gray-300'} rounded p-2 text-sm focus:outline-none focus:border-[#9F2089]`}
                    value={cardState.number}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                  />
                  {cardErrors.number && <p className="text-[10px] text-red-500 mt-1">{cardErrors.number}</p>}
                </div>

                <div className="flex gap-3">
                  <div className="w-1/2">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      className={`w-full border ${cardErrors.expiry ? 'border-red-500' : 'border-gray-300'} rounded p-2 text-sm focus:outline-none focus:border-[#9F2089]`}
                      value={cardState.expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                    />
                    {cardErrors.expiry && <p className="text-[10px] text-red-500 mt-1">{cardErrors.expiry}</p>}
                  </div>
                  <div className="w-1/2">
                    <input
                      type="password"
                      placeholder="CVV"
                      className={`w-full border ${cardErrors.cvv ? 'border-red-500' : 'border-gray-300'} rounded p-2 text-sm focus:outline-none focus:border-[#9F2089]`}
                      value={cardState.cvv}
                      onChange={handleCvvChange}
                      maxLength={4}
                    />
                    {cardErrors.cvv && <p className="text-[10px] text-red-500 mt-1">{cardErrors.cvv}</p>}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Name on Card"
                    className={`w-full border ${cardErrors.name ? 'border-red-500' : 'border-gray-300'} rounded p-2 text-sm focus:outline-none focus:border-[#9F2089]`}
                    value={cardState.name}
                    onChange={handleNameChange}
                  />
                  {cardErrors.name && <p className="text-[10px] text-red-500 mt-1">{cardErrors.name}</p>}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="saveCard"
                    className="text-[#9F2089] focus:ring-[#9F2089]"
                    checked={cardState.saveCard}
                    onChange={(e) => setCardState({ ...cardState, saveCard: e.target.checked })}
                  />
                  <label htmlFor="saveCard" className="text-xs text-gray-600">Save card securely for future payments</label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EMI Section */}
        {isMethodEnabled('EMI') && (
          <div className={`bg-white rounded-lg border overflow-hidden ${selectedSection === 'EMI' ? 'border-[#9F2089]' : 'border-gray-200'}`}>
            {renderPaymentHeader('EMI', 'EMI', <FontAwesomeIcon icon={faPercentage} />, 'Easy Installments')}

            {selectedSection === 'EMI' && (
              <div className="p-4 border-t border-gray-100 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Select your Credit Card Bank</p>
                  <select
                    className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700 focus:outline-none focus:border-[#9F2089]"
                    value={emiState.bank}
                    onChange={(e) => setEmiState({ ...emiState, bank: e.target.value, tenure: "" })}
                  >
                    <option value="">Select Bank</option>
                    {emiBanks.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>

                {emiState.bank && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Select EMI Plan</p>
                    <div className="space-y-2">
                      {emiTenures.map((plan) => (
                        <div
                          key={plan.months}
                          className={`border rounded p-3 flex items-center justify-between cursor-pointer ${emiState.tenure === plan.months ? 'border-[#9F2089] bg-[#FFF5FC]' : 'border-gray-200'}`}
                          onClick={() => setEmiState({ ...emiState, tenure: plan.months, interest: plan.rate })}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${emiState.tenure === plan.months ? 'border-[#9F2089]' : 'border-gray-400'}`}>
                              {emiState.tenure === plan.months && <div className="w-2 h-2 bg-[#9F2089] rounded-full" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-800">₹{calculateEmi(plan.months, plan.rate)} x {plan.months} months</span>
                              <span className="text-xs text-gray-500">Interest: {plan.rate}% p.a</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Net Banking Section */}
        {isMethodEnabled('NetBanking') && (
          <div className={`bg-white rounded-lg border overflow-hidden ${selectedSection === 'NetBanking' ? 'border-[#9F2089]' : 'border-gray-200'}`}>
            {renderPaymentHeader('NetBanking', 'Net Banking', <FontAwesomeIcon icon={faUniversity} />)}

            {selectedSection === 'NetBanking' && (
              <div className="p-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3">Popular Banks</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank'].map(bank => (
                    <div
                      key={bank}
                      className={`border rounded p-2 text-center text-xs font-medium cursor-pointer ${netBankingBank === bank ? 'border-[#9F2089] bg-[#FFF5FC] text-[#9F2089]' : 'border-gray-200 text-gray-700 hover:border-[#9F2089]'}`}
                      onClick={() => {
                        setNetBankingBank(bank);
                        setErrorMessage("");
                      }}
                    >
                      {bank}
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <select
                    className={`w-full border rounded p-2 text-sm text-gray-700 focus:outline-none focus:border-[#9F2089] ${netBankingBank && !['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank'].includes(netBankingBank) ? 'border-[#9F2089] bg-[#FFF5FC]' : 'border-gray-300'}`}
                    value={['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank'].includes(netBankingBank) ? "" : netBankingBank}
                    onChange={(e) => {
                      setNetBankingBank(e.target.value);
                      setErrorMessage("");
                    }}
                  >
                    <option value="">Other Banks</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="IndusInd Bank">IndusInd Bank</option>
                    <option value="Union Bank of India">Union Bank of India</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wallets Section */}
        {isMethodEnabled('Wallets') && (
          <div className={`bg-white rounded-lg border overflow-hidden ${selectedSection === 'Wallets' ? 'border-[#9F2089]' : 'border-gray-200'}`}>
            {renderPaymentHeader('Wallets', 'Wallets', <FontAwesomeIcon icon={faWallet} />)}

            {selectedSection === 'Wallets' && (
              <div className="p-4 border-t border-gray-100 space-y-3">
                {walletMethods.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setSelectedOption(wallet.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">Img</div>
                      <span className="text-sm font-medium text-gray-700">{wallet.name}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedOption === wallet.id ? 'border-[#9F2089]' : 'border-gray-300'}`}>
                      {selectedOption === wallet.id && <div className="w-2 h-2 bg-[#9F2089] rounded-full" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


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
