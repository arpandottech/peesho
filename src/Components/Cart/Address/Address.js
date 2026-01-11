import React, { useState } from "react";
import Firstcart from "../Firstcart/Firstcart";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../CartContext";

const Address = () => {
  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Lakshadweep",
    "Delhi",
    "Puducherry",
    "Ladakh",
    "Jammu and Kashmir",
  ];

  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItems } = useCart();
  const cartItems = getCartItems();
  const [formError, setFormError] = useState("");

  const handlePayments = (event) => {
    event.preventDefault();
    const form = document.getElementById("addressForm");

    // Save to localStorage for future consistency
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => { data[key] = value });
    localStorage.setItem("userAddress", JSON.stringify(data));

    // Calculate total from cart if not passed in state
    const cartTotal = cartItems.reduce((total, item) => {
      const price = item.salePrice || item.price || 0;
      return total + (price * (item.quantity || 1));
    }, 0);

    const totalPrice = location.state?.totalPrice || cartTotal;

    if (form.checkValidity()) {
      navigate("/payments", { state: { totalPrice } });
    } else {
      setFormError("Please fill out all the required fields correctly.");
    }
  };

  React.useEffect(() => {
    const saved = localStorage.getItem("userAddress");
    if (saved) {
      const data = JSON.parse(saved);
      const fields = ["fullName", "mobileNumber", "pincode", "city", "state", "houseNo", "roadName"];
      fields.forEach(field => {
        const el = document.getElementById(field);
        if (el && data[field]) el.value = data[field];
      });
    }
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen font-dm pb-24">
      <Firstcart title="ADD DELIVERY ADDRESS" currentStep={2} />

      <div className="max-w-xl mx-auto p-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-[17px] font-bold mb-6 flex items-center text-gray-800">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="text-[#9F2089] mr-3"
            />
            <span>Contact Details</span>
          </h2>

          <form className="space-y-5" id="addressForm" onSubmit={handlePayments}>
            <div>
              <div className="relative">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder=" "
                  className="block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#9F2089] peer"
                />
                <label
                  htmlFor="fullName"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[#9F2089] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Full Name
                </label>
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  placeholder=" "
                  className="block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#9F2089] peer"
                />
                <label
                  htmlFor="mobileNumber"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[#9F2089] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Mobile Number
                </label>
              </div>
            </div>

            <h2 className="text-[17px] font-bold mt-6 mb-2 flex items-center text-gray-800">
              Address
            </h2>

            <div>
              <div className="relative">
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  placeholder=" "
                  className="block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#9F2089] peer"
                />
                <label
                  htmlFor="pincode"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[#9F2089] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Pincode
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder=" "
                    className="block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#9F2089] peer"
                  />
                  <label
                    htmlFor="city"
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[#9F2089] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                  >
                    City
                  </label>
                </div>
              </div>

              <div>
                <div className="relative">
                  <select
                    id="state"
                    name="state"
                    defaultValue=""
                    className="block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#9F2089] peer"
                  >
                    <option value="" disabled></option>
                    {states.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="state"
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[#9F2089] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                  >
                    State
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type="text"
                  id="houseNo"
                  name="houseNo"
                  placeholder=" "
                  className="block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#9F2089] peer"
                />
                <label
                  htmlFor="houseNo"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[#9F2089] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  House No., Building Name
                </label>
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type="text"
                  id="roadName"
                  name="roadName"
                  placeholder=" "
                  className="block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#9F2089] peer"
                />
                <label
                  htmlFor="roadName"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[#9F2089] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Road name, Area, Colony
                </label>
              </div>
            </div>
          </form>

          {formError && (
            <div className="text-red-500 text-sm mt-2 font-medium bg-red-50 p-2 rounded">{formError}</div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 w-full bg-white p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        <button
          type="submit"
          onClick={handlePayments}
          className="w-full bg-[#9F2089] hover:bg-[#8f1d7b] py-3.5 text-white rounded-[4px] font-bold text-[16px] transition-colors"
        >
          Save Address and Continue
        </button>
      </div>
    </div>
  );
};

export default Address;
