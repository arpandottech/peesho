import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import { X } from 'lucide-react';

const CategoryDrawer = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [parentCategories, setParentCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedParent, setSelectedParent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
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
        }
    }, [isOpen]);

    const filteredCategories = categories.filter(c =>
        c.parentCategory && (c.parentCategory._id === selectedParent || c.parentCategory === selectedParent)
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer Content */}
            <div className={`relative bg-white w-full max-w-sm h-full shadow-xl flex flex-col transform transition-transform duration-300 font-dm ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                    <h2 className="text-lg font-bold text-gray-800">All Categories</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-full">Loading...</div>
                ) : (
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
                                        <img src={parent.image || 'https://via.placeholder.com/50'} alt={parent.name} loading="lazy" className="w-full h-full object-cover" />
                                    </div>
                                    <span className={`text-[10px] text-center font-medium leading-tight ${selectedParent === parent._id ? 'text-[#9F2089] font-bold' : 'text-gray-600'}`}>
                                        {parent.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Content (Child Categories) */}
                        <div className="flex-1 h-full overflow-y-auto bg-white p-4">
                            {/* Banner (Optional placeholder for parent cat banner) */}
                            <div className="w-full h-24 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg mb-6 flex items-center justify-center text-pink-200 font-bold text-xl uppercase tracking-widest">
                                {parentCategories.find(p => p._id === selectedParent)?.name}
                            </div>

                            {selectedParent && (
                                <div>
                                    <h2 className="text-[14px] font-bold text-gray-800 mb-4 font-dm">Popular Collections</h2>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                        {filteredCategories.map(cat => (
                                            <div
                                                key={cat._id}
                                                className="flex flex-col items-center cursor-pointer group"
                                                onClick={() => {
                                                    navigate(`/category/${cat._id}`, { state: { name: cat.name } });
                                                    onClose();
                                                }}
                                            >
                                                <div className="w-16 h-16 rounded-full border border-pink-100 overflow-hidden mb-2 group-hover:border-[#9F2089] transition-colors">
                                                    <img src={cat.image || 'https://via.placeholder.com/64'} alt={cat.name} loading="lazy" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-[11px] text-center text-gray-700 font-medium leading-tight line-clamp-2 px-1">
                                                    {cat.name}
                                                </span>
                                            </div>
                                        ))}
                                        {filteredCategories.length === 0 && (
                                            <div className="col-span-2 text-center text-gray-400 text-sm py-4">
                                                No categories found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryDrawer;
