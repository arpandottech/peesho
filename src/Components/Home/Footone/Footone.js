import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Mes from "../../../assets/mes logo.svg";
import Tshirt from "../../../assets/t-shirt logo.svg";
import Box from "../../../assets/box.svg";
import Quation from "../../../assets/quation mark.svg";
import Bol from "../../../assets/bool.svg";

const Footone = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => {
    if (!path) return false;
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { name: 'Home', icon: Mes, path: '/' },
    { name: 'Categories', icon: Tshirt, path: '/categories' },
    { name: 'My Orders', icon: Box, path: '/orders' },
    { name: 'Help', icon: Quation, path: '/help' },
    { name: 'Account', icon: Bol, path: null } // No operation for Account
  ];

  return (
    <>
      <div className="fixed bottom-0 w-full flex justify-evenly bg-white py-2 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50 font-dm">
        {navItems.map((item) => (
          <div
            key={item.name}
            className="flex flex-col items-center cursor-pointer min-w-[60px]"
            onClick={() => {
              if (item.path) navigate(item.path);
            }}
          >
            <div className={`transition-all duration-200 ${isActive(item.path) ? 'opacity-100 scale-105' : 'opacity-60 grayscale'}`}>
              <img
                className="h-6 w-6"
                src={item.icon}
                alt={item.name}
                style={{
                  filter: isActive(item.path) ? 'none' : 'grayscale(100%) opacity(0.7)'
                }}
              />
            </div>
            <p className={`text-sm max-sm:text-[12px] mt-1 ${isActive(item.path) ? 'text-[#9F2089] font-bold' : 'text-gray-500'}`}>
              {item.name}
            </p>
            {isActive(item.path) && (
              <div className="w-8 h-1 bg-[#9F2089] rounded-t-full mt-1 absolute bottom-0"></div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Footone;
