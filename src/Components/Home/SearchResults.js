import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { ArrowLeft, Search, Heart, ShoppingCart, Star } from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faFilter, faCheck } from "@fortawesome/free-solid-svg-icons";

const SearchResults = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter Logic
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showFilters, setShowFilters] = useState({
        sort: false,
        category: false,
        gender: false,
        more: false,
    });

    const [sortOption, setSortOption] = useState("Relevance");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedGenders, setSelectedGenders] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: 10000 });
    const [categories, setCategories] = useState([]);

    const sortOptions = ["Relevance", "Price (High to Low)", "Price (Low to High)", "Rating", "New Arrivals"];

    // Refs
    const sortRef = useRef(null);
    const categoryRef = useRef(null);
    const genderRef = useRef(null);
    const moreRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) setShowFilters(prev => ({ ...prev, sort: false }));
            if (categoryRef.current && !categoryRef.current.contains(event.target)) setShowFilters(prev => ({ ...prev, category: false }));
            if (genderRef.current && !genderRef.current.contains(event.target)) setShowFilters(prev => ({ ...prev, gender: false }));
            if (moreRef.current && !moreRef.current.contains(event.target)) setShowFilters(prev => ({ ...prev, more: false }));
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch categories for filter
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await axios.get(`${config.API_URL}/categories`);
                setCategories(res.data);
            } catch (e) {
                console.error("Error fetching categories", e);
            }
        }
        fetchCats();
    }, []);

    const toggleFilter = (filterName) => {
        setShowFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));
    };

    const handleCategoryChange = (catName) => {
        setSelectedCategories(prev =>
            prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
        );
    };

    const handleGenderChange = (gender) => {
        setSelectedGenders(prev =>
            prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
        );
    };

    const applyPriceFilter = () => {
        setPriceRange(tempPriceRange);
        setShowFilters(prev => ({ ...prev, more: false }));
    };

    // Fetch Products based on Search Query
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${config.API_URL}/products`, {
                    params: { search: query }
                });
                setProducts(res.data);
                setFilteredProducts(res.data);
            } catch (err) {
                console.error("Error fetching search results", err);
            } finally {
                setLoading(false);
            }
        };
        if (query) {
            fetchData();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [query]);

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

    useEffect(() => {
        let result = [...products];

        // 1. Filter by Category
        if (selectedCategories.length > 0) {
            result = result.filter(product => {
                const catName = product.category?.name || '';
                return selectedCategories.includes(catName);
            });
        }

        // 2. Filter by Gender
        if (selectedGenders.length > 0) {
            result = result.filter(product => {
                const nameUpper = (product.title || '').toUpperCase();
                const catUpper = (product.category?.name || '').toUpperCase();
                let isMale = nameUpper.includes("MEN") || nameUpper.includes("BOY") || catUpper.includes("MEN");
                let isFemale = nameUpper.includes("WOMEN") || nameUpper.includes("GIRL") || catUpper.includes("WOMEN") || catUpper.includes("SAREE") || catUpper.includes("KURTI");
                if (selectedGenders.includes("Male") && isMale) return true;
                if (selectedGenders.includes("Female") && isFemale) return true;
                return false;
            });
        }

        // 3. Filter by Price
        result = result.filter(product => {
            const price = getPrice(product);
            return price >= priceRange.min && price <= priceRange.max;
        });

        // 4. Sort
        switch (sortOption) {
            case "Price (High to Low)":
                result.sort((a, b) => getPrice(b) - getPrice(a));
                break;
            case "Price (Low to High)":
                result.sort((a, b) => getPrice(a) - getPrice(b));
                break;
            case "New Arrivals":
                result.sort((a, b) => new Date(b._id.getTimestamp()) - new Date(a._id.getTimestamp()));
                break;
            case "Rating":
                break; // No rating data yet
            default:
                break;
        }

        setFilteredProducts(result);
    }, [products, sortOption, selectedCategories, selectedGenders, priceRange]);

    if (loading) return <div className="flex justify-center items-center h-screen font-dm">Loading...</div>;

    return (
        <div className="bg-gray-50 min-h-screen font-dm pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-50 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <ArrowLeft size={24} className="text-gray-600 cursor-pointer" onClick={() => navigate(-1)} />
                        <div>
                            <span className="font-bold text-lg text-gray-800 line-clamp-1">"{query}"</span>
                            <p className="text-xs text-gray-500">{filteredProducts.length} Results</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <Search size={22} className="text-[#9F2089]" />
                        <Heart size={22} className="text-[#9F2089]" onClick={() => navigate('/wishlist')} />
                        <ShoppingCart size={22} className="text-[#9F2089]" onClick={() => navigate('/cart')} />
                    </div>
                </div>
            </div>

            {/* Filter Tabs - Same as CategoryPage */}
            <div className="bg-white sticky top-[60px] z-40 border-b border-gray-100">
                <div className="flex h-[50px] w-full border-t border-gray-100">
                    {/* Sort */}
                    <div className="relative flex-1 border-r border-gray-200" ref={sortRef}>
                        <button className="w-full h-full flex items-center justify-center gap-2 font-medium text-[14px] text-gray-700 hover:text-pink-600" onClick={() => toggleFilter('sort')}>
                            Sort
                        </button>
                        {showFilters.sort && (
                            <div className="absolute top-full left-0 w-56 bg-white border rounded-lg shadow-xl z-20 py-2">
                                {sortOptions.map(option => (
                                    <button key={option} className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex justify-between items-center ${sortOption === option ? 'font-bold text-gray-800' : 'text-gray-600'}`} onClick={() => { setSortOption(option); toggleFilter('sort'); }}>
                                        {option}
                                        {sortOption === option && <FontAwesomeIcon icon={faCheck} className="text-pink-500" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Category */}
                    <div className="relative flex-1 border-r border-gray-200" ref={categoryRef}>
                        <button className="w-full h-full flex items-center justify-center gap-2 font-medium text-[14px] text-gray-700 hover:text-pink-600" onClick={() => toggleFilter('category')}>
                            Category {selectedCategories.length > 0 && <span className="bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{selectedCategories.length}</span>}
                            <FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-xs" />
                        </button>
                        {showFilters.category && (
                            <div className="absolute top-full left-0 w-64 max-h-80 overflow-y-auto bg-white border rounded-lg shadow-xl z-20 p-2">
                                {categories.map(cat => (
                                    <label key={cat._id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded">
                                        <input type="checkbox" checked={selectedCategories.includes(cat.name)} onChange={() => handleCategoryChange(cat.name)} className="accent-pink-500 w-4 h-4" />
                                        <span className="text-sm text-gray-700">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Gender */}
                    <div className="relative flex-1 border-r border-gray-200" ref={genderRef}>
                        <button className="w-full h-full flex items-center justify-center gap-2 font-medium text-[14px] text-gray-700 hover:text-pink-600" onClick={() => toggleFilter('gender')}>
                            Gender {selectedGenders.length > 0 && <span className="bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{selectedGenders.length}</span>}
                            <FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-xs" />
                        </button>
                        {showFilters.gender && (
                            <div className="absolute top-full left-0 w-48 bg-white border rounded-lg shadow-xl z-20 p-2">
                                {["Male", "Female"].map(gender => (
                                    <label key={gender} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded">
                                        <input type="checkbox" checked={selectedGenders.includes(gender)} onChange={() => handleGenderChange(gender)} className="accent-pink-500 w-4 h-4" />
                                        <span className="text-sm text-gray-700">{gender}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Filters */}
                    <div className="relative flex-1" ref={moreRef}>
                        <button className="w-full h-full flex items-center justify-center gap-2 font-medium text-[14px] text-gray-700 hover:text-pink-600" onClick={() => toggleFilter('more')}>
                            <FontAwesomeIcon icon={faFilter} className="text-gray-400 text-xs" />
                            Filters
                        </button>
                        {showFilters.more && (
                            <div className="absolute top-full right-0 w-72 bg-white border rounded-lg shadow-xl z-20 p-4">
                                <h4 className="text-sm font-bold text-gray-800 mb-3">Price Range</h4>
                                <div className="flex gap-2 mb-4">
                                    <input type="number" placeholder="Min" value={tempPriceRange.min} onChange={(e) => setTempPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))} className="w-full border p-2 text-sm rounded" />
                                    <input type="number" placeholder="Max" value={tempPriceRange.max} onChange={(e) => setTempPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))} className="w-full border p-2 text-sm rounded" />
                                </div>
                                <button onClick={applyPriceFilter} className="w-full bg-pink-500 text-white py-2 rounded text-sm font-bold">Apply</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 gap-1 bg-gray-100">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => {
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
                                        <span>4.1</span>
                                        <Star size={8} className="fill-white" />
                                    </div>
                                    <span className="text-gray-400 text-[10px]">(345)</span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-2 text-center py-20">
                        <div className="flex justify-center mb-4">
                            <Search size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-gray-800 font-bold mb-2">No results found</h3>
                        <p className="text-gray-500 text-sm">Try searching for something else</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
