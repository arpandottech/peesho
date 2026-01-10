import React, { useState, useEffect } from 'react'
import { TrashIcon } from '@heroicons/react/solid';
import { useLocation, useNavigate } from 'react-router-dom';
import safe from '../../../assets/Safe.webp'
import { useCart } from '../../CartContext';
import { ChevronRight, Clock, X } from 'lucide-react';

const Cartitem = () => {
  const navigate = useNavigate();
  const { getCartItems, removeFromCart } = useCart();
  const cartItems = getCartItems();
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalProductPrice, setTotalProductPrice] = useState(0);

  useEffect(() => {
    // Calculate totals
    const calculateTotals = () => {
      let price = 0;
      let regular = 0;

      cartItems.forEach(item => {
        price += (item.salePrice || 0) * (item.quantity || 1);
        regular += (item.regularPrice || 0) * (item.quantity || 1);
      });

      setTotalPrice(price);
      setTotalProductPrice(regular);
      setTotalDiscount(regular - price);
    };

    calculateTotals();
  }, [cartItems]);

  const handleRemove = (e, index) => {
    e.stopPropagation();
    removeFromCart(index);
  };

  const handleContinue = () => {
    navigate('/address', { state: { totalPrice } });
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen pb-24 font-dm">

        {/* Banner */}
        <div className="bg-[#E7F8F0] px-4 py-2 flex items-center gap-2 mb-2">
          <div className="bg-[#CBF0DF] rounded-full p-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" fill="#038D63" />
            </svg>
          </div>
          <span className="text-[#038D63] text-[13px] font-medium">Save ₹3 with Only wrong/defect item returns</span>
        </div>

        {cartItems.map((item, index) => {
          const discount = item.regularPrice > item.salePrice
            ? Math.round(((item.regularPrice - item.salePrice) / item.regularPrice) * 100)
            : 0;

          return (
            <div
              key={index}
              className="bg-white mb-2 cursor-pointer"
              onClick={() => item.productId && navigate(`/product/${item.productId}`)}
            >
              <div className="p-4 flex gap-3">
                {/* Image */}
                <div className="w-[72px] h-[72px] flex-shrink-0 border border-gray-100 rounded-md overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h2 className="text-[14px] text-gray-800 font-medium truncate pr-2">
                      {item.name}
                    </h2>
                    <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[16px] font-bold text-[#333]">₹{item.salePrice}</span>
                    {item.regularPrice > item.salePrice && (
                      <>
                        <span className="text-[12px] text-gray-400 line-through">₹{item.regularPrice}</span>
                        <span className="text-[12px] text-[#038D63] font-semibold">{discount}% Off</span>
                      </>
                    )}
                  </div>

                  {/* Timer */}
                  <div className="flex items-center gap-1 mt-1 text-[#C88421] border border-[#FBEEC9] bg-[#FFF9E6] px-1.5 py-0.5 rounded w-fit">
                    <Clock size={12} fill="#C88421" className="text-white" />
                    <span className="text-[10px] font-bold">01h : 43m : 55s</span>
                  </div>

                  <div className="mt-1 text-[12px] text-gray-500">
                    All issue easy returns
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[13px] text-gray-600">
                    <span>Size: {item.size}</span>
                    <span className="text-gray-300">•</span>
                    <span>Qty: {item.quantity}</span>
                  </div>

                  {/* Remove Button */}
                  <div
                    className="flex items-center gap-1 mt-3 text-gray-500 font-medium text-[13px] cursor-pointer w-fit"
                    onClick={(e) => handleRemove(e, index)}
                  >
                    <X size={16} />
                    <span>Remove</span>
                  </div>
                </div>
              </div>

              {/* Footer for Item */}
              <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center bg-white">
                <span className="text-[13px] text-gray-500">Sold by: Meesho Supply</span>
                <span className="text-[13px] text-gray-500">Free Delivery</span>
              </div>
            </div>
          )
        })}

        {/* Wishlist Link */}
        <div
          className="bg-white p-4 mb-2 flex justify-between items-center cursor-pointer"
          onClick={() => navigate('/wishlist')}
        >
          <h3 className="text-[15px] font-bold text-gray-800">Wishlist</h3>
          <ChevronRight size={20} className="text-gray-400" />
        </div>

        {/* Price Details */}
        <div className="bg-white p-4 pb-6">
          <h3 className="text-[15px] font-bold text-gray-800 mb-4">Price Details ({cartItems.length} Items)</h3>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-600 underline decoration-dotted decoration-gray-400 underline-offset-4">Total Product Price</span>
              <span className="text-gray-900">+ ₹{totalProductPrice}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-[#038D63] underline decoration-dotted decoration-[#038D63] underline-offset-4">Total Discounts</span>
              <span className="text-[#038D63]">- ₹{totalDiscount}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
            <h3 className="text-[16px] font-bold text-gray-800">Order Total</h3>
            <h3 className="text-[16px] font-bold text-gray-800">₹{totalPrice}</h3>
          </div>

          <div className="bg-[#F8F8FF] text-[11px] text-gray-500 text-center py-2 mt-3 rounded">
            Clicking on 'Continue' will not deduct any money
          </div>
        </div>

        <div className='m-3 mb-4'>
          <img src={safe} alt="" />
        </div>
      </div>

      {/* Footer Fixed Bar */}
      <div className='fixed bottom-0 w-full bg-white flex py-3 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] font-dm z-50 px-4 items-center justify-between'>
        <div className='flex flex-col'>
          <h1 className='font-bold text-[18px] text-gray-900 leading-none'>₹{totalPrice}</h1>
          <p className='font-bold text-[11px] text-[#9F2089] cursor-pointer mt-1'>VIEW PRICE DETAILS</p>
        </div>
        <button
          onClick={handleContinue}
          className='bg-[#9F2089] hover:bg-[#8f1d7b] text-white font-bold text-[16px] rounded-[4px] py-3 px-10 transition-colors'
        >
          Continue
        </button>
      </div>
    </>
  )
}

export default Cartitem