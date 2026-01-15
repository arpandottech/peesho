import React, { useState, useEffect } from "react";
// import './Navbar.css'
import Logo from "../../assets/meeshoLogo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faShoppingCart,
  faSearch,
  faMapMarkerAlt,
  faAngleDoubleRight,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useBrand } from "../../BrandContext"; // Import Brand Context
import { useCart } from "../CartContext";
import AddressModal from "./AddressModal";
import CategoriesBar from "./CategoriesBar";
import CategoryDrawer from "../Category/CategoryDrawer";

const Navbar = () => {
  const navigate = useNavigate();
  const { getCartItems } = useCart();
  const { brandConfig } = useBrand(); // Get Brand Config
  const cartItems = getCartItems();
  const cartCount = cartItems.length;

  // Brand Assets
  const brandLogo = brandConfig?.theme?.logoUrl || Logo;
  const primaryColor = brandConfig?.theme?.primaryColor || "#9f2089";
  const secondaryColor = brandConfig?.theme?.primaryColor || "#f43397"; // Using primary for both or differentiate if needed
  const brandName = brandConfig?.brand_name || "Meesho";

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState("Add delivery location to check extra discount");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      const { displayString } = JSON.parse(savedLocation);
      setDeliveryLocation(`Delivering to ${displayString}`);
    }
  }, []);

  const handleLocationUpdate = (data) => {
    setDeliveryLocation(`Delivering to ${data.displayString}`);
  };

  const heandleLogo = () => {
    navigate("/");
  };
  return (
    <>
      <div className="flex justify-between items-center m-4">
        <div className="flex space-x-4 items-center">
          <div onClick={() => setIsDrawerOpen(true)} className="cursor-pointer">
            <FontAwesomeIcon icon={faBars} className="text-xl text-gray-700" />
          </div>
          <img
            onClick={heandleLogo}
            className="cursor-pointer w-[120px] max-sm:w-[90px] object-contain"
            src={brandLogo}
            alt={brandName}
          />
        </div>
        <div className="flex gap-4 items-center relative">
          <div onClick={() => navigate('/')} className="cursor-pointer">
            <FontAwesomeIcon
              icon={faHeart}
              className="text-xl"
              style={{ color: secondaryColor }}
            />
          </div>
          <div onClick={() => navigate('/cart')} className="relative cursor-pointer">
            <FontAwesomeIcon
              icon={faShoppingCart}
              className="text-xl"
              style={{ color: primaryColor }}
            />
            {cartCount > 0 && (
              <span
                className="absolute top-[-8px] right-[-8px] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5"
                style={{ backgroundColor: secondaryColor }}
              >
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="w-full px-4 max-sm:px-3">
          <div className="flex items-center bg-white border border-[#999] rounded-md px-4 py-[10px] w-full max-w-4xl mx-auto shadow-sm">
            {/* Search Icon */}
            <FontAwesomeIcon
              icon={faSearch}
              className="text-gray-400 text-lg mr-3 cursor-pointer"
              onClick={handleSearch}
            />

            {/* Input Field */}
            <input
              type="text"
              placeholder="Search for Sarees, Kurtis, Cosmetics, etc."
              className="flex-grow bg-transparent outline-none placeholder:text-[rgb(53,53,67)] w-full font-dm text-[13px] tracking-wider text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <hr className="mt-3" />

        {/* Delivery Location Strip */}
        <div
          onClick={() => setIsAddressModalOpen(true)}
          className="bg-[#f8f9fa] flex items-center justify-between px-4 py-3 cursor-pointer border-b border-gray-200"
        >
          <div className="flex items-center gap-3 text-[#333] text-[16px] font-medium font-dm">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#5b86e5]" />
            <span>{deliveryLocation}</span>
          </div>
          <FontAwesomeIcon icon={faAngleDoubleRight} className="text-gray-400" />
        </div>

        {isAddressModalOpen && (
          <AddressModal
            onClose={() => setIsAddressModalOpen(false)}
            onUpdate={handleLocationUpdate}
          />
        )}
      </div>

      {isDrawerOpen && <CategoryDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />}

      {/* Categories Section */}
      <CategoriesBar />
    </>
  );
};

export default Navbar;
