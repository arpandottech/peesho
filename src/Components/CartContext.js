import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const [paymentInfo, setPaymentInfoState] = useState(() => {
    try {
      const saved = localStorage.getItem('checkout_payment_info');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const setPaymentInfo = (info) => {
    setPaymentInfoState(info);
    localStorage.setItem('checkout_payment_info', JSON.stringify(info));
  };

  const addToCart = (product) => {
    setCartItems(prevItems => [...prevItems, product]); // Adjust for unique logic if needed
  };

  const removeFromCart = (index) => {
    setCartItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  const getCartItems = () => {
    return cartItems;
  };

  return (
    <CartContext.Provider value={{ addToCart, removeFromCart, getCartItems, paymentInfo, setPaymentInfo }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
