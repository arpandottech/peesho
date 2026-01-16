import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Heart, ShoppingCart, Star } from 'lucide-react';
import axios from 'axios';
import config from '../../config';

const ShopPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hardcoded Shop Details as per request
    const shopDetails = {
        name: "Meesho Supply",
        rating: 4.2,
        ratingCount: "21,020 Ratings",
        followers: "777.3K",
        productsCount: "990",
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${config.API_URL}/products`);
                const productList = res.data.products || (Array.isArray(res.data) ? res.data : []);
                setProducts(productList);
            } catch (err) {
                console.error("Error fetching products", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const getPrice = (product) => {
        if (product.type === 'simple') return product.discountPrice || product.price || 0;
        if (product.variations && product.variations.length > 0) {
            const prices = product.variations.map(v => v.discountPrice || v.price).filter(p => p);
            return Math.min(...prices) || 0;
        }
        return 0;
    };

    const getRegularPrice = (product) => {
        if (product.type === 'simple') return product.price || 0;
        if (product.variations && product.variations.length > 0) {
            const prices = product.variations.map(v => v.price).filter(p => p);
            return Math.min(...prices) || 0;
        }
        return 0;
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="bg-gray-50 min-h-screen font-dm pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-50 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <ArrowLeft size={24} className="text-gray-600 cursor-pointer" onClick={() => navigate(-1)} />
                        {/* <span className="font-bold text-lg text-gray-800">{shopDetails.name}</span> */}
                    </div>
                    <div className="flex items-center gap-5">
                        <Search size={22} className="text-[#9F2089]" />
                        <Heart size={22} className="text-[#9F2089]" />
                        <ShoppingCart size={22} className="text-[#9F2089]" />
                    </div>
                </div>
            </div>

            {/* Shop Banner & Info */}
            <div className="bg-white mb-2">
                {/* Banner Pattern (Placeholder) */}
                <div className="h-32 bg-pink-100 overflow-hidden relative">
                    <div className="grid grid-cols-6 gap-2 opacity-50 p-2">
                        {/* Simple pattern mockup */}
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="bg-white/50 h-8 w-8 rounded-full transform rotate-45"></div>
                        ))}
                    </div>
                </div>

                {/* Profile Section */}
                <div className="px-4 pb-4 -mt-10 relative">
                    <div className="flex justify-center">
                        <div className="bg-blue-50 p-3 rounded-full border-4 border-white shadow-sm inline-block">
                            <div className="text-[#9F2089] font-bold">
                                {/* Use simple icon or text if no image */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-2">
                        <h1 className="text-xl font-bold text-gray-800 mb-2">{shopDetails.name}</h1>

                        <div className="flex justify-center items-center gap-6 text-sm">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full mb-1">
                                    <span className="font-bold text-blue-600">{shopDetails.rating}</span>
                                    <Star size={10} className="fill-blue-600 text-blue-600" />
                                </div>
                                <span className="text-gray-500 text-xs">{shopDetails.ratingCount}</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <span className="font-bold text-gray-800 text-lg">{shopDetails.followers}</span>
                                <span className="text-gray-500 text-xs">Followers</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <span className="font-bold text-gray-800 text-lg">{shopDetails.productsCount}</span>
                                <span className="text-gray-500 text-xs">Products</span>
                            </div>

                            <button className="bg-[#9F2089] text-white px-6 py-1.5 rounded-md font-bold text-sm">
                                Follow
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white sticky top-[60px] z-40 border-b border-gray-100">
                <div className="px-4 py-3">
                    <h2 className="font-bold text-gray-800">All Products</h2>
                </div>
                <div className="flex border-t border-gray-100">
                    <button className="flex-1 py-3 text-sm font-semibold text-gray-600 flex justify-center items-center gap-1 border-r border-gray-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M7 12h10M10 18h4" /></svg>
                        Sort
                    </button>
                    <button className="flex-1 py-3 text-sm font-semibold text-gray-600 flex justify-center items-center gap-1 border-r border-gray-100">
                        Category
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                    <button className="flex-1 py-3 text-sm font-semibold text-gray-600 flex justify-center items-center gap-1 border-r border-gray-100">
                        Price
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                    <button className="flex-1 py-3 text-sm font-semibold text-gray-600 flex justify-center items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
                        Filters
                    </button>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-1 bg-gray-100">
                {products.map(product => {
                    const price = getPrice(product);
                    const regularPrice = getRegularPrice(product);
                    const discount = regularPrice > 0 ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

                    return (
                        <div
                            key={product._id}
                            className="bg-white p-3 flex flex-col cursor-pointer"
                            onClick={() => navigate(`/product/${product._id}`)}
                        >
                            <div className="relative aspect-[3/4] mb-2">
                                <img
                                    src={product.images?.[0] || 'https://via.placeholder.com/300'}
                                    alt={product.title}
                                    className="w-full h-full object-cover rounded-sm"
                                />
                                <button className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-gray-500">
                                    <Heart size={16} />
                                </button>
                            </div>

                            <h3 className="text-gray-500 text-xs font-medium mb-1 truncate">{product.title}</h3>

                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg text-gray-900">₹{price}</span>
                                {discount > 0 && (
                                    <>
                                        <span className="text-xs text-gray-400 line-through">₹{regularPrice}</span>
                                        <span className="text-xs font-bold text-green-600">{discount}% off</span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-medium">Free Delivery</span>
                                <div className="flex items-center gap-1 bg-[#23bb75] text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                    {/* Using a static logical rating or dynamic if available, but for grid matching general style */}
                                    <span>4.1</span>
                                    <Star size={8} className="fill-white" />
                                </div>
                                <span className="text-gray-400 text-[10px]">(345)</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ShopPage;
