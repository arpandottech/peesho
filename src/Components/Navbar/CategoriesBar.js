import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const CategoriesBar = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch child categories
                const response = await axios.get(`${config.API_URL}/categories`);
                setCategories(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setError("Failed to load categories");
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="w-full bg-white border-b border-gray-200">
            <div className="flex overflow-x-auto px-4 py-3 space-x-4 scrollbar-hide items-start">
                {/* First Category - Static "View All" or similar */}
                <div className="flex-shrink-0 flex flex-col items-center cursor-pointer min-w-[72px]" onClick={() => navigate('/categories')}>
                    <div className="w-[72px] h-[72px] rounded-full overflow-hidden border border-gray-200 mb-2">
                        <img
                            src="https://images.meesho.com/images/marketing/1661417516766_128.webp"
                            alt="View All"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <p className="font-dm text-[13px] text-gray-700 text-center font-normal leading-tight">
                        View All
                    </p>
                </div>

                {/* Fetched Child Categories */}
                {loading ? (
                    <div className="flex items-center justify-center p-4">
                        <span className="text-sm text-gray-500 font-dm">Loading...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center p-4">
                        <span className="text-sm text-red-500 font-dm">Error</span>
                    </div>
                ) : categories.length > 0 ? (
                    categories.slice(0, 16).map((category) => (
                        <div key={category._id}
                            className="flex-shrink-0 flex flex-col items-center cursor-pointer min-w-[72px] max-w-[72px]"
                            onClick={() => navigate(`/category/${category._id}`, { state: { name: category.name } })}
                        >
                            <div className="w-[72px] h-[72px] rounded-full overflow-hidden border border-gray-200 mb-2 bg-gray-50">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                />
                            </div>
                            <p className="font-dm text-[13px] text-gray-700 text-center font-normal leading-tight break-words w-full overflow-hidden whitespace-nowrap text-ellipsis">
                                {category.name.length > 10 ? category.name.slice(0, 10) + "..." : category.name}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center p-4">
                        <span className="text-sm text-gray-500 font-dm">No Categories</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesBar;
