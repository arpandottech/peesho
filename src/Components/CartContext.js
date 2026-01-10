import React, { createContext, useContext, useState} from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

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
    <CartContext.Provider value={{ addToCart, removeFromCart, getCartItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
