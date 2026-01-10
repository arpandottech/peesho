import React from 'react';
import Cat from '../../../assets/1594489152649_100.webp'
import Lady from '../../../assets/one.webp'
import Diff from '../../../assets/two.webp'
import Onef from '../../../assets/three.webp'
import Lem from '../../../assets/four.webp'

const Navbartwo = () => {
  const categories = [
    { name: 'Categories', imgSrc: Cat},
    { name: 'CLOGS', imgSrc: Lady },
    { name: 'FLIP', imgSrc: Diff },
    { name: 'CROCS', imgSrc: Onef }, 
    { name: 'CROCS2', imgSrc: Lem }, 
  ];

  return (
    <div className="flex justify-center space-x-4 md:space-x-8 overflow-x-auto p-4">
      {categories.map((category, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center space-y-2"
        >
          <div className="w-12 h-12 max-md:w-10 max-md:h-10 max-lg:w-20 max-lg:h-20 rounded-full bg-gray-100 overflow-hidden">
            <img
              src={category.imgSrc}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm md:text-base truncate w-16 md:w-20 lg:w-24">
            {category.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Navbartwo;