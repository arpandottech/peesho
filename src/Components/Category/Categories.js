import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import { Search, ShoppingCart, Heart } from 'lucide-react';
import Footone from '../Home/Footone/Footone';

const Categories = () => {
    const navigate = useNavigate();
    const [parentCategories, setParentCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedParent, setSelectedParent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [parentRes, catRes] = await Promise.all([
                    axios.get(`${config.API_URL}/parent-categories`),
                    axios.get(`${config.API_URL}/categories`)
                ]);
                setParentCategories(parentRes.data);
                setCategories(catRes.data);
                if (parentRes.data.length > 0) {
                    setSelectedParent(parentRes.data[0]._id);
                }
            } catch (err) {
                console.error("Error fetching categories", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredCategories = categories.filter(c =>
        c.parentCategory && (c.parentCategory._id === selectedParent || c.parentCategory === selectedParent)
    );

    if (loading) return <div className="flex justify-center items-center h-screen font-dm">Loading...</div>;

    return (
        <div className="flex flex-col h-screen bg-white font-dm">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10">
                <h1 className="text-[18px] font-bold text-gray-800">Categories</h1>
                <div className="flex items-center gap-5">
                    <Search size={22} className="text-gray-600" />
                    <Heart size={22} className="text-gray-600" onClick={() => navigate('/wishlist')} />
                    <ShoppingCart size={22} className="text-gray-600" onClick={() => navigate('/cart')} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar (Parent Categories) */}
                <div className="w-[90px] bg-gray-50 h-full overflow-y-auto border-r border-gray-200">
                    {parentCategories.map(parent => (
                        <div
                            key={parent._id}
                            onClick={() => setSelectedParent(parent._id)}
                            className={`flex flex-col items-center justify-center py-4 px-1 cursor-pointer transition-colors border-l-[4px] ${selectedParent === parent._id
                                ? 'bg-white border-[#9F2089]'
                                : 'border-transparent hover:bg-gray-100'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full overflow-hidden mb-1 border ${selectedParent === parent._id ? 'border-[#9F2089]' : 'border-gray-200'}`}>
                                <img src={parent.image || 'https://via.placeholder.com/50'} alt={parent.name} className="w-full h-full object-cover" />
                            </div>
                            <span className={`text-[10px] text-center font-medium leading-tight ${selectedParent === parent._id ? 'text-[#9F2089] font-bold' : 'text-gray-600'}`}>
                                {parent.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Content (Child Categories) */}
                <div className="flex-1 h-full overflow-y-auto bg-white p-4 pb-20">
                    {/* Banner (Optional placeholder for parent cat banner) */}
                    <div className="w-full h-32 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg mb-6 flex items-center justify-center text-pink-200 font-bold text-2xl uppercase tracking-widest">
                        {parentCategories.find(p => p._id === selectedParent)?.name}
                    </div>

                    {selectedParent && (
                        <div>
                            <h2 className="text-[15px] font-bold text-gray-800 mb-4 font-dm">Popular Collections</h2>
                            <div className="grid grid-cols-3 gap-x-4 gap-y-6">
                                {filteredCategories.map(cat => (
                                    <div
                                        key={cat._id}
                                        className="flex flex-col items-center cursor-pointer group"
                                        onClick={() => navigate(`/category/${cat._id}`, { state: { name: cat.name } })}
                                    >
                                        <div className="w-16 h-16 rounded-full border border-pink-100 overflow-hidden mb-2 group-hover:border-[#9F2089] transition-colors">
                                            <img src={cat.image || 'https://via.placeholder.com/64'} alt={cat.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[11px] text-center text-gray-700 font-medium leading-tight line-clamp-2 px-1">
                                            {cat.name}
                                        </span>
                                    </div>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <div className="col-span-3 text-center text-gray-400 text-sm py-4">
                                        No categories found.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footone />
        </div>
    );
};

export default Categories;
