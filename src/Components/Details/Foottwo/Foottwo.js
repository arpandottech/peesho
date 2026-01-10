import { ShoppingCartIcon } from '@heroicons/react/outline'; // For the cart icon
import { FastForwardIcon } from '@heroicons/react/solid'; // For the buy now icon
import { useNavigate } from 'react-router-dom'; 
import { useCart } from '../../CartContext';

const BottomBar = ({ product, selectedSize }) => {
  const navigate = useNavigate(); // Initialize navigate
  const { addToCart } = useCart()

  const handleBuyNowClick = () => {
    if (product) {
      const cartProduct = {
        image: product.Images[0],       // Get the first image
        name: product.Name,             // Product name
        salePrice: product["Sale price"],// Sale price
        regularPrice: product["Regular price"], // Regular price
        size: selectedSize,             // Selected size
        quantity: 1                     // Default to 1
      };
  
      navigate('/cart', {
        state: {
          cartItems: [cartProduct],     // Pass the product as cartItem array
          totalPrice: product["Sale price"] // Total price for single item
        }
      });
    }
  };

  const handleAddCartClick = () => {
    if (product) {
      const cartProduct = { ...product, selectedSize };
      addToCart(cartProduct); // Add the item to the cart
      navigate('/addcart', { state: { cartItems: [cartProduct] } }); // Navigate to Addcart page with product details
    }
  };

  return (
    <div className="fixed bottom-0 w-full flex gap-1 justify-evenly bg-white py-2 px-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50">
      {/* Add to Cart Button */}
      <div className="border-2 w-[50%] border-[#9F2089] rounded-lg">
        <button onClick={handleAddCartClick} className="flex items-center justify-center w-full h-full px-6 max-sm:px-3 max-sm:text-[12px] text-fuchsia-800 font-semibold rounded-lg hover:bg-purple-50">
          <ShoppingCartIcon className="h-5 w-5 mr-2 text-[#9F2089]" />
          Add to Cart
        </button>
      </div>

      {/* Buy Now Button */}
      <div className="bg-[#9F2089] w-[50%] rounded-lg">
        <button onClick={handleBuyNowClick} className="flex items-center justify-center w-full h-full px-6 py-3 max-sm:text-[12px] max-sm:px-3 text-white font-semibold rounded-lg hover:bg-fuchsia-700">
          <FastForwardIcon className="h-5 w-5 mr-2 text-white" />
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default BottomBar;
