import axios from 'axios';
import config from '../config';

const API_URL = `${config.API_URL}/wishlist`;

export const getWishlist = async () => {
    const res = await axios.get(API_URL);
    return res.data;
};

export const toggleWishlist = async (productId) => {
    const res = await axios.post(`${API_URL}/toggle`, { productId });
    return res.data;
};

export const checkWishlistStatus = async (productId) => {
    const res = await axios.get(`${API_URL}/check/${productId}`);
    return res.data.isWishlisted;
};
