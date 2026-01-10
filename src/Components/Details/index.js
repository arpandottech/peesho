import React, {useState} from 'react'
import { useLocation } from 'react-router-dom';
import Images from './Images/Images'
import Text from './Text/Text';
import Foottwo from './Foottwo/Foottwo';

const Details = () => {
    const location = useLocation();
    // const queryParams = new URLSearchParams(location.search);
    // const id = queryParams.get('id'); // Retrieve the product ID from the query parameters

    const product = location.state; // Retrieve product details passed in state
    const [selectedSize, setSelectedSize] = useState('S');

  if (!product) return <div>Loading...</div>;
  return (
    <div>
        <Images 
        product={product}  
        selectedSize={selectedSize} 
        setSelectedSize={setSelectedSize} />
        <Text selectedSize={selectedSize}/>
        <Foottwo 
        product={product} 
        selectedSize={selectedSize} />
    </div>
  )
}

export default Details