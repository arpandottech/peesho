import React from 'react'
import Firstcart from './Firstcart/Firstcart'
import Cartitem from './Cartitem/Cartitem'
import { Outlet } from 'react-router-dom';
import { useCart } from '../CartContext';
import EmptyCart from './EmptyCart';

const Cart = () => {
  const { getCartItems } = useCart();
  const cartItems = getCartItems();

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <Firstcart />
      <Cartitem />
      <Outlet />
    </div>
  )
}

export default Cart