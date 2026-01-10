import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Firstcart = ({ title = "CART", currentStep = 1 }) => {
  const navigate = useNavigate();


  const handleReturn = () => {
    console.log("Navigating to Addcart");
    navigate('/addcart')
  }

  const handleStepClick = (stepNumber) => {
    if (stepNumber === 3) {
      navigate('/address'); // Navigate to Address when step 3 is clicked
    }
  };

  const getStepStyle = (stepNumber) => {
    if (stepNumber < currentStep) return "border-[#9F2089] text-[#9F2089]"; // Completed step
    if (stepNumber === currentStep) return "border-[#9F2089] text-white bg-[#9F2089]"; // Current step
    return "border-gray-300 text-gray-300"; // Inactive step
  };

  // Function to determine step label color
  const getStepLabelStyle = (stepNumber) => {
    if (stepNumber <= currentStep) return "text-black font-medium";
    return "text-gray-400";
  };


  return (
    <>
      <div className="bg-white sticky top-0 z-10 pb-1 font-dm">
        <div className="flex items-center mt-2 ms-3 cursor-pointer">
          <FontAwesomeIcon
            icon={faAngleLeft}
            className="text-2xl text-gray-500 mr-2 cursor-pointer"
          />
          <h1 className="text-[15px] font-bold text-gray-800 tracking-wide" onClick={handleReturn}>{title}</h1>
        </div>
        <hr className='my-2' />

        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-2xl">
            <div className="flex items-start justify-between relative z-0">
              {/* Background Line Container - Behind circles */}
              <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2" />

              {/* Dynamic colored line overlay */}
              <div
                className="absolute top-4 left-0 h-0.5 bg-[#9F2089] -z-10 transform -translate-y-1/2 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />

              {/* Step 1 */}
              <div className="flex flex-col items-center bg-white px-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300 ${getStepStyle(1)}`}>
                  1
                </div>
                <span className={`mt-2 text-xs md:text-sm font-medium transition-colors duration-300 ${getStepLabelStyle(1)}`}>Cart</span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center bg-white px-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300 ${getStepStyle(2)}`}>
                  2
                </div>
                <span className={`mt-2 text-xs md:text-sm font-medium transition-colors duration-300 ${getStepLabelStyle(2)}`}>Address</span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center bg-white px-2 cursor-pointer" onClick={() => handleStepClick(3)}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300 ${getStepStyle(3)}`}>
                  3
                </div>
                <span className={`mt-2 text-xs md:text-sm font-medium transition-colors duration-300 ${getStepLabelStyle(3)}`}>Payment</span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center bg-white px-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300 ${getStepStyle(4)}`}>
                  4
                </div>
                <span className={`mt-2 text-xs md:text-sm font-medium transition-colors duration-300 ${getStepLabelStyle(4)}`}>Summary</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className='h-1 bg-[#fff6f6]' />
    </>
  )
}

export default Firstcart