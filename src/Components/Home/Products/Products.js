import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faChevronDown, faFilter, faCheck } from "@fortawesome/free-solid-svg-icons";
import config from "../../../config";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState({
    sort: false,
    category: false,
    gender: false,
    more: false,
  });

  // Filter States
  const [sortOption, setSortOption] = useState("Relevance");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: 10000 });

  const sortOptions = ["Relevance", "Price (High to Low)", "Price (Low to High)", "Rating", "New Arrivals"];

  // Refs for click outside
  const sortRef = useRef(null);
  const categoryRef = useRef(null);
  const genderRef = useRef(null);
  const moreRef = useRef(null);

  useEffect(() => {
    // Click outside handler
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) setShowFilters(prev => ({ ...prev, sort: false }));
      if (categoryRef.current && !categoryRef.current.contains(event.target)) setShowFilters(prev => ({ ...prev, category: false }));
      if (genderRef.current && !genderRef.current.contains(event.target)) setShowFilters(prev => ({ ...prev, gender: false }));
      if (moreRef.current && !moreRef.current.contains(event.target)) setShowFilters(prev => ({ ...prev, more: false }));
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Products from Backend
        const prodResponse = await fetch(`${config.API_URL}/products`);
        const prodData = await prodResponse.json();
        setProducts(prodData);
        setFilteredProducts(prodData);

        // Fetch Categories
        const catResponse = await fetch(`${config.API_URL}/categories`);
        if (catResponse.ok) {
          const catData = await catResponse.json();
          setCategories(catData);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getPrice = (product) => {
    if (product.type === 'simple') return product.discountPrice || product.price || 0;
    // For variable, return lowest price
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

    // 2. Filter by Gender (Mock logic as gender isn't explicit in schema yet, checking title/category)
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
        break;
      case "Relevance":
      default:
        break;
    }

    setFilteredProducts(result);
  }, [products, sortOption, selectedCategories, selectedGenders, priceRange]);


  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const toggleFilter = (filterName) => {
    setShowFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
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

  return (
    <div className="mt-4">
      <div>
        <h2 className="font-dm text-[21px] font-normal text-gray-800 mb-2 px-4">Products For You</h2>
      </div>

      {/* Filter Bar */}
      <div className="flex h-[50px] w-full border-t border-b border-gray-200 mb-0 sticky top-0 bg-white z-10">

        {/* Sort Dropdown */}
        <div className="relative flex-1 border-r border-gray-200" ref={sortRef}>
          <button
            className="w-full h-full flex items-center justify-center gap-2 font-dm text-[14px] font-[500] text-gray-700 hover:text-pink-600 transition-colors"
            onClick={() => toggleFilter('sort')}
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
            Sort
          </button>
          {showFilters.sort && (
            <div className="absolute top-full left-0 w-56 bg-white border rounded-lg shadow-xl z-20 py-2">
              {sortOptions.map(option => (
                <button
                  key={option}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex justify-between items-center font-dm ${sortOption === option ? 'font-bold text-gray-800' : 'text-gray-600'}`}
                  onClick={() => { setSortOption(option); toggleFilter('sort'); }}
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  {option}
                  {sortOption === option && <FontAwesomeIcon icon={faCheck} className="text-pink-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="relative flex-1 border-r border-gray-200" ref={categoryRef}>
          <button
            className="w-full h-full flex items-center justify-center gap-2 font-dm text-[14px] font-[500] text-gray-700 hover:text-pink-600 transition-colors"
            onClick={() => toggleFilter('category')}
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Category {selectedCategories.length > 0 && <span className="flex items-center justify-center bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full font-dm">{selectedCategories.length}</span>}
            <FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-xs" />
          </button>
          {showFilters.category && (
            <div className="absolute top-full left-0 w-64 max-h-80 overflow-y-auto bg-white border rounded-lg shadow-xl z-20 p-2">
              <div className="p-2 border-b mb-2">
                <input
                  type="text"
                  placeholder="Search Category"
                  className="w-full text-sm p-2 border rounded outline-none focus:border-pink-500 font-dm"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                />
              </div>
              {categories.length > 0 ? categories.map(cat => (
                <label key={cat._id || cat.name} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() => handleCategoryChange(cat.name)}
                    className="accent-pink-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 font-dm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{cat.name}</span>
                </label>
              )) : <div className="p-4 text-center text-sm text-gray-500 font-dm" style={{ fontFamily: 'DM Sans, sans-serif' }}>No categories found</div>}
            </div>
          )}
        </div>

        {/* Gender Dropdown */}
        <div className="relative flex-1 border-r border-gray-200" ref={genderRef}>
          <button
            className="w-full h-full flex items-center justify-center gap-2 font-dm text-[14px] font-[500] text-gray-700 hover:text-pink-600 transition-colors"
            onClick={() => toggleFilter('gender')}
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Gender {selectedGenders.length > 0 && <span className="flex items-center justify-center bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full font-dm">{selectedGenders.length}</span>}
            <FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-xs" />
          </button>
          {showFilters.gender && (
            <div className="absolute top-full left-0 w-48 bg-white border rounded-lg shadow-xl z-20 p-2">
              {["Male", "Female"].map(gender => (
                <label key={gender} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedGenders.includes(gender)}
                    onChange={() => handleGenderChange(gender)}
                    className="accent-pink-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 font-dm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{gender}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Filters (Price + More) Dropdown */}
        <div className="relative flex-1" ref={moreRef}>
          <button
            className="w-full h-full flex items-center justify-center gap-2 font-dm text-[14px] font-[500] text-gray-700 hover:text-pink-600 transition-colors"
            onClick={() => toggleFilter('more')}
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            <FontAwesomeIcon icon={faFilter} className="text-gray-400 text-xs" />
            Filters
          </button>
          {showFilters.more && (
            <div className="absolute top-full right-0 w-72 bg-white border rounded-lg shadow-xl z-20 p-4">
              <h4 className="text-sm font-bold text-gray-800 mb-3 font-dm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Price Range</h4>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="number"
                  value={tempPriceRange.min}
                  onChange={(e) => setTempPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  className="w-full text-sm p-2 border rounded outline-none focus:border-pink-500 font-dm"
                  placeholder="Min"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={tempPriceRange.max}
                  onChange={(e) => setTempPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-full text-sm p-2 border rounded outline-none focus:border-pink-500 font-dm"
                  placeholder="Max"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                />
              </div>
              <button
                onClick={applyPriceFilter}
                className="w-full bg-pink-500 text-white py-2 rounded-md font-medium text-sm hover:bg-pink-600 transition-colors font-dm"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-0 mb-8 border-l border-gray-200">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const price = getPrice(product);
            const regularPrice = getRegularPrice(product);
            const discount = regularPrice > 0 ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

            return (
              <div
                key={product._id}
                className="border-r border-b border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white relative pb-4 hover:z-10"
                onClick={() => handleProductClick(product._id)}
              >
                <div className="relative group overflow-hidden h-64">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/300'}
                    alt={product.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Wishlist Heart */}
                  <div className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-sm cursor-pointer hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-pink-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                </div>

                <div className="px-3 pt-3 space-y-1 text-left">
                  <h2 className="text-[#8b8ba3] text-[10px] font-semibold font-dm">
                    {product.title.length > 35 ? product.title.slice(0, 35) + "..." : product.title}
                  </h2>

                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-[#333] font-dm">₹{price}</span>
                    {regularPrice > price && (
                      <span className="text-[12px] text-gray-400 line-through font-dm">₹{regularPrice}</span>
                    )}
                    {discount > 0 && (
                      <span className="text-[12px] font-semibold text-green-600 font-dm">{discount}% off</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-[#f9f9f9] text-[#666] text-[10px] uppercase font-medium px-2 py-0.5 rounded-full font-dm border border-gray-200">
                      Free Delivery
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="flex items-center gap-1 bg-[#23bb75] text-white px-2 py-1 rounded-full text-[14px] font-bold font-dm leading-none">
                      4.1 <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                    </span>
                    <span className="text-[#8b8ba3] text-[12px] font-medium font-dm">(316)</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full h-40 flex flex-col items-center justify-center text-gray-500">
            <p className="text-lg font-medium font-dm">No products found</p>
            <p className="text-sm font-dm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
