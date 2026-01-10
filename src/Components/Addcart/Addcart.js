import React, { useState, useEffect } from "react";
import { XIcon, PlusIcon, MinusIcon, TrashIcon } from "@heroicons/react/solid";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";

const Addcart = () => {
  const location = useLocation();
  // const product = location.state?.product;
  const navigate = useNavigate();

  /* Refactored to handle both legacy and new cart item structures */
  const { getCartItems, removeFromCart } = useCart();
  const cartItems = getCartItems();

  const [counts, setCounts] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const initialCounts = cartItems.reduce((acc, item, index) => {
      acc[index] = 1;
      return acc;
    }, {});
    setCounts(initialCounts);

    // Calculate initial total price
    const initialTotalPrice = cartItems.reduce((acc, item, index) => {
      const price = parseFloat(item.salePrice || item["Sale price"]) || 0;
      return acc + price * (initialCounts[index] || 1);
    }, 0);
    setTotalPrice(initialTotalPrice);
  }, [cartItems]);

  const handleIncrease = (index) => {
    setCounts((prevCounts) => {
      const updatedCounts = {
        ...prevCounts,
        [index]: prevCounts[index] + 1,
      };
      // Update total price based on the increased count
      updateTotalPrice(updatedCounts);
      return updatedCounts;
    });
  };

  const handleDecrease = (index) => {
    setCounts((prevCounts) => {
      const updatedCounts = {
        ...prevCounts,
        [index]: Math.max(prevCounts[index] - 1, 1),
      };
      // Update total price based on the decreased count
      updateTotalPrice(updatedCounts);
      return updatedCounts;
    });
  };

  const updateTotalPrice = (counts) => {
    const newTotalPrice = cartItems.reduce((acc, item, index) => {
      const salePrice = parseFloat(item.salePrice || item["Sale price"]) || 0; // Ensure it's a number
      const quantity = counts[index] || 1; // Get the quantity or default to 1
      return acc + (salePrice * quantity); // Calculate total price
    }, 0);
    setTotalPrice(newTotalPrice);
  };

  const handleClose = () => {
    console.log("Close cart");
    navigate("/");
  };

  if (cartItems.length === 0) return <p>Your cart is empty!</p>;

  const handleOrder = () => {
    if (cartItems.length > 0) {
      // Pass cartItems to Cartitem component
      navigate("/cart", {
        state: {
          cartItems: cartItems.map((item, index) => ({
            image: item.Images[0],
            name: item.Name,
            salePrice: item["Sale price"],
            regularPrice: item["Regular price"],
            size: item.size || item.selectedSize,
            quantity: counts[index] || 1,
          })),
          totalPrice,
        },
      });
    }
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-xl font-semibold">
            Your C<span className="border-b-2 border-[#FF9028]">art</span>
          </h1>
          <button onClick={handleClose} className="focus:outline-none">
            <XIcon className="h-6 w-6 text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        <div className="pb-52">
          {cartItems.map((product, index) => (
            <div key={index} className="flex items-center border-b border-gray-200 py-4 space-x-4 max-w-4xl mx-auto px-5">
              <div className="w-1/4">
                <img
                  src={product.image || (product.Images && product.Images[0]) || 'https://via.placeholder.com/150'}
                  alt="Product"
                  className="rounded-md w-32 h-auto max-sm:w-14 max-sm:h-14 object-contain"
                />
              </div>

              <div className="w-3/4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h2 className="text-sm max-sm:text-[11px] font-bold text-gray-800 overflow-hidden whitespace-nowrap text-ellipsis">
                    {product.name || product.Name}
                  </h2>
                  <TrashIcon
                    onClick={() => removeFromCart(index)}
                    className="w-6 h-6 max-sm:w-5 max-sm:h-5 text-gray-400 cursor-pointer hover:text-gray-600"
                  />
                </div>

                <div className="flex items-center mt-2 space-x-2">
                  <span className="text-lg font-medium text-[#353543]">
                    ₹{product.salePrice || product["Sale price"]}
                  </span>
                  <span className="text-sm text-[#b3b3b5] line-through font-semibold">
                    ₹{product.regularPrice || product["Regular price"]}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Size: {product.size || product.selectedSize}</span>
                  <div className="flex items-center justify-center bg-slate-200 rounded-full max-sm:p-1 max-sm:space-x-1">
                    <button
                      onClick={() => handleDecrease(index)}
                      className="p-1 max-sm:p-1 bg-slate-100 rounded-l-xl hover:bg-gray-200"
                    >
                      <MinusIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="mx-2 text-xl max-sm:text-sm">{counts[index] || 1}</span>
                    <button
                      onClick={() => handleIncrease(index)}
                      className="p-1 max-sm:p-1 bg-slate-100 rounded-r-xl hover:bg-gray-200"
                    >
                      <PlusIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 w-full bg-white py-2 px-5 max-sm:px-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between text-sm">
          <h3>Cart Total:</h3>
          <p>₹{new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(totalPrice)}</p>
        </div>
        <div className="flex justify-between text-sm my-2">
          <h3>Shipping:</h3>
          <p>FREE</p>
        </div>
        <hr className="border-t border-dashed border-black" />
        <div className="flex justify-between text-sm mt-2">
          <h3>To Pay</h3>
          <p>₹{new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(totalPrice)}</p>
        </div>
        <div className="flex gap-3 mt-5">
          <div className="w-1/2 text-center">
            <h1 className="text-2xl max-sm:text-sm font-semibold">₹{new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(totalPrice)}</h1>
            <p className="text-sm font-semibold text-212529 max-sm:text-[10px]">Inclusive of all texes</p>
          </div>
          <div className="w-1/2 text-center bg-[#9F2089] border border-black text-white font-semibold text-base rounded-lg m-auto p-2">
            <p className="mt-0 max-sm:text-sm cursor-pointer" onClick={handleOrder}>Confirm Order</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Addcart;
