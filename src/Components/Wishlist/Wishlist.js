import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Star } from 'lucide-react';
import { getWishlist, toggleWishlist } from '../../services/wishlistService';

const Wishlist = () => {
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const data = await getWishlist();
            setWishlistItems(data);
        } catch (err) {
            console.error("Error fetching wishlist", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (e, productId) => {
        e.stopPropagation();
        try {
            await toggleWishlist(productId);
            // Optimistic update or refetch
            setWishlistItems(prev => prev.filter(item => item._id !== productId));
        } catch (err) {
            console.error("Error removing from wishlist", err);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="bg-gray-50 min-h-screen font-dm pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <ArrowLeft size={24} className="text-gray-600 cursor-pointer" onClick={() => navigate(-1)} />
                    <h1 className="text-lg font-bold text-gray-800">My Wishlist ({wishlistItems.length})</h1>
                </div>
            </div>

            {/* Grid */}
            <div className="p-4">
                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
                        <Heart size={48} className="mb-4 text-gray-300" />
                        <p>Your wishlist is empty</p>
                        <button
                            className="mt-4 text-[#9F2089] font-bold border border-[#9F2089] px-6 py-2 rounded-full hover:bg-pink-50"
                            onClick={() => navigate('/')}
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {wishlistItems.map((product) => (
                            <div
                                key={product._id}
                                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer relative"
                                onClick={() => navigate(`/product/${product._id}`)}
                            >
                                <div className="relative aspect-[4/5] bg-gray-100">
                                    <img
                                        src={product.images?.[0]}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Remove Button */}
                                    <button
                                        className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md text-[#9F2089]"
                                        onClick={(e) => handleRemove(e, product._id)}
                                    >
                                        <Heart size={16} fill="#9F2089" />
                                    </button>
                                </div>
                                <div className="p-3">
                                    <h3 className="text-gray-800 font-medium text-sm line-clamp-2 leading-tight mb-1">
                                        {product.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg font-bold text-gray-900">₹{product.discountPrice || product.price}</span>
                                        <span className="text-xs text-green-600 font-bold">Available</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="bg-[#23bb75] text-white px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center">
                                            4.1 <Star size={8} className="ml-0.5 fill-white" />
                                        </span>
                                        <span className="text-xs text-gray-400">(123)</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
