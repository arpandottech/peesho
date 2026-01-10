import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
 import "swiper/css"; // Swiper core styles
import "swiper/css/pagination"; // Pagination module styles
import "./Slider.css";
import { Autoplay } from "swiper/modules";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";

import Movements from "../../../assets/2f53o.gif";
import sah from "../../../assets/shah.webp";
import kar from "../../../assets/kar.webp";
import kap from "../../../assets/kap.webp";
import Ben from "../../../assets/Benifit.webp";
import Offertime from "../../../assets/Offertime.png";

// Helper function to shuffle the array
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const Sliderone = () => {
  const [shuffledSlides, setShuffledSlides] = useState([]);
  const [timeLeft, setTimeLeft] = useState(6960); // 1 hour, 55 minutes, and 60 seconds in seconds

  const slides = [sah, kar, kap];

  useEffect(() => {
    setShuffledSlides(shuffleArray([...slides]));

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}h: ${String(minutes).padStart(
      2,
      "0"
    )}m: ${String(secs).padStart(2, "0")}s`;
  };

  return (
    <>
      <div className="flex justify-center">
        <img className="h-[50px] w-auto" src={Movements} alt="" />
      </div>

      <div className="w-full max-w-screen-lg mx-auto">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 10000 }}
          className="mySwiper"
        >
          {shuffledSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <img
                src={slide}
                alt={`Slide ${index + 1}`}
                className="w-full object-cover h-auto"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div class="marquee">
        <div class="marquee__inner">
          <span>Buy 2 Get 1 Free (Add 3 item to cart)</span>
          <span>&nbsp;</span>
          <span>Buy 2 Get 1 Free (Add 3 item to cart)</span>
          <span>&nbsp;</span>
          <span>Buy 2 Get 1 Free (Add 3 item to cart)</span>
          <span>&nbsp;</span>
          <span>Buy 2 Get 1 Free (Add 3 item to cart)</span>
          <span>&nbsp;</span>
          <span>Buy 2 Get 1 Free (Add 3 item to cart)</span>
          {/* <!-- Duplicate content for continuous scroll --> */}
          <span>Buy 2 Get 1 Free (Add 3 items to cart)</span>
          <span>&nbsp;</span>
          <span>Buy 2 Get 1 Free (Add 3 items to cart)</span>
          <span>&nbsp;</span>
          <span>Buy 2 Get 1 Free (Add 3 items to cart)</span>
          <span>&nbsp;</span>
          <span>Buy 2 Get 1 Free (Add 3 items to cart)</span>
          <span>&nbsp;</span>
          <span>Buy 2 Get 1 Free (Add 3 items to cart)</span>
        </div>
      </div>

      <div className="flex justify-center">
        <img src={Ben} alt="" />
      </div>

      <div className="flex justify-center items-center space-x-2 my-3 mx-1 max-sm:mx-0">
        <div className="flex gap-2 max-sm:gap-1">
          <h3 className="text-lg  text-[#838282] font-bold max-sm:text-sm">
            Meesho Daily Deals
          </h3>
          <FontAwesomeIcon icon={faBolt} className="text-red-500 text-xl mt-1 w-4" />
        </div>
        <div className="time flex justify-between gap-2 max-sm:gap-1 px-2 max-sm:px-1">
          <img className="w-5 h-5 max-sm:w-3 max-sm:h-3 max-sm:mt-1 " src={Offertime} alt="" />
          <p className="text-sm font-medium m-auto">{formatTime(timeLeft)}</p>
        </div>
      </div>

      <div className="bg-slate-200 py-1"></div>
    </>
  );
};

export default Sliderone;
