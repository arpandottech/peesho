import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const AddressModal = ({ onClose, onUpdate }) => {
    const [pincode, setPincode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (pincode.length !== 6) {
            setError("Please enter a valid 6-digit pincode");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data && data[0].Status === "Success") {
                const details = data[0].PostOffice[0];
                const locationData = {
                    pincode: pincode,
                    city: details.District,
                    state: details.State,
                    displayString: `${details.District} - ${pincode}`
                };

                // Save minimal data for Navbar, and prepopulate partial address for checkout
                localStorage.setItem("userLocation", JSON.stringify(locationData));

                // Also update the full address object if it exists or create new one partially
                const existingAddress = JSON.parse(localStorage.getItem("userAddress") || "{}");
                const updatedAddress = {
                    ...existingAddress,
                    pincode: pincode,
                    city: details.District,
                    state: details.State
                };
                localStorage.setItem("userAddress", JSON.stringify(updatedAddress));

                onUpdate(locationData); // Notify parent to update UI
                onClose();
            } else {
                setError("Invalid Pincode. Please try again.");
            }
        } catch (err) {
            setError("Failed to fetch location details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-dm">
            <div className="bg-white w-[90%] max-w-[400px] rounded-lg p-0 overflow-hidden shadow-lg relative">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-[16px] font-semibold text-gray-700">CHANGE DELIVERY LOCATION</h2>
                    <button onClick={onClose} className="text-gray-500 text-xl font-light hover:text-gray-800">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="relative mt-2">
                        <div className="flex items-center border-b-[2px] border-blue-100 focus-within:border-[#9F2089] transition-colors pb-1">
                            <input
                                type="text"
                                placeholder="Type Delivery Pincode"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full outline-none text-gray-700 text-[16px] placeholder:text-[#888] font-dm"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="text-[#9F2089] font-bold text-[16px] tracking-widest ml-2 disabled:opacity-50 font-dm"
                            >
                                {loading ? "CHECKING..." : "SUBMIT"}
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-xs mt-2 absolute">{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;
