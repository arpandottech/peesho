import { useState } from 'react';
import { HeartIcon, ShareIcon } from '@heroicons/react/outline';
import mes from '../../../assets/download.svg'

const ProductGallery = ({ product, selectedSize, setSelectedSize }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const mainImage = product.Images[selectedImageIndex];
  const similarProducts = product.Images.slice(1);

  
  const sizes = ['7', '8', '9', '10', '11'];

  return (
    <div className="flex flex-col items-center mt-3 justify-center ">
      {/* Main Image */}
      <div className="w-full max-w-lg h-auto mb-4 ">
        <img
          src={mainImage}
          alt="Selected Product"
          className="w-full max-sm:w-[90%] max-sm:ms-4 p-3 h-auto object-cover rounded-lg shadow-lg"
        />
      </div>

      {/* Separator */}
      <div className="my-4">
        <div className="w-12 h-1 bg-purple-500"></div>
      </div>

      <p className='text-left w-full text-[#8B8BA3] font-semibold ps-4 mb-2'>Similar Product</p>
      {/* Similar Products */}
      <div className="w-full overflow-x-auto ">
        <div className="flex space-x-4 max-sm:ms-2">
          {similarProducts.length > 0 ? (
            similarProducts.map((image, index) => (
              <div
                key={index}
                onClick={() => setSelectedImageIndex(index + 1)} // Adjust for main image being at index 0
                className={`cursor-pointer p-1 rounded flex-none shadow-lg m-2  ${
                  selectedImageIndex === index + 1 ? 'border-2 border-purple-500' : 'border-2 border-transparent'
                }`}
                style={{ width: '70px', height: '100px' }}    
              >
                <img
                  src={image}
                  alt={`Similar product ${index + 1}`}
                  className="w-full h-full object-contain rounded"
                />
              </div>
            ))
          ) : (
            <p>No similar products available</p>
          )}
        </div>
      </div>

      <div className="bg-white mt-4">
      <div className="flex justify-between max-sm:mx-4 gap-2 mb-2">
        <h1 className="text-sm font-semibold text-[#8B8BA3] max-sm:text-sm">
          {product.Name}
        </h1>
        <div className="flex space-x-1">
          {/* Wishlist Icon */}
          <button className="items-center space-x-1 text-gray-500 hover:text-gray-700">
            <HeartIcon className="w-4 h-4 ms-4 max-sm:w-4 max-sm:h-4" />
            <span className="text-[13px] hidden sm:inline">Wishlist</span>
          </button>
          {/* Share Icon */}
          <button className="items-center space-x-1 text-gray-500 hover:text-gray-700">
            <ShareIcon className="w-4 h-4 ms-3 max-sm:w-4 max-sm:h-4" />
            <span className="text-[13px] hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Price and Discount */}
      <div className="flex items-center space-x-4 mb-2 max-sm:ms-4">
        <span className="text-2xl max-sm:text-xl font-bold text-gray-800">₹{product["Sale price"]}</span>
        <span className="text-sm line-through text-gray-400">₹{product["Regular price"]}</span>
        <span className='text-sm'>80% off</span>
      </div>

      {/* Offers */}
      <div className="text-sm max-sm:text-[12px] font-bold w-[40%] max-sm:ms-4 bg-green-100 text-green-600 px-2 py-1 rounded-xl mb-4">
        Special Offers
      </div>

      {/* Ratings and Reviews */}
      <div className="flex items-center space-x-6 mb-4 max-sm:mx-4">
        <div className="flex items-center space-x-2">
          <span className="bg-green-600 max-sm:text-sm max-sm:w-[50%] text-white px-2 m-auto rounded-xl">4.2 ★</span>
          <span className="text-[#8B8BA3] font-bold text-[10px]">Best ratings and good reviews</span>
        </div>
        <img src={mes} className='w-16' alt="" />
      </div>

      {/* Free Delivery */}
      <div className="text-sm max-sm:text-[12px] font-bold text-[#212529] mb-6">{product.delivery}</div>
      
      {/* Size Selection */}
      <div className='py-1 bg-slate-200'></div>
      <div className="max-sm:ms-4 max-sm:py-3">
        <h2 className="text-base font-bold  text-gray-700 mb-5">Select Size</h2>
        <div className="flex space-x-3">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`border-2 px-3 rounded-2xl font-semibold max-sm:text-[10px] ${
                selectedSize === size
                  ? 'bg-purple-200 border-purple-600 text-purple-600'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <div className='py-1 bg-slate-200'></div>
    </div>
  </div>
  );
};

export default ProductGallery;
