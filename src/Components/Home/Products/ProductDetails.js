import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, ArrowLeft, Search, Heart as LucideHeart, MapPin, Share, Store, ThumbsUp, X } from 'lucide-react';
import { toggleWishlist, checkWishlistStatus } from '../../../services/wishlistService';
import { useInView } from 'react-intersection-observer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useCart } from '../../../Components/CartContext';
import config from '../../../config';
import Logo from "../../../assets/meeshoLogo.svg";
import { trackViewContent, trackAddToCart, trackCheckoutStep } from '../../../utils/MetaPixel';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleAttributeSelect = (name, value) => {
        setSelectedAttributes(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
    const [isBuyNow, setIsBuyNow] = useState(false);
    const [similarProducts, setSimilarProducts] = useState([]);
    const { addToCart, getCartItems } = useCart();

    // Intersection Observer for sticky buttons
    const { ref: buttonRef, inView, entry } = useInView({
        threshold: 0.1, // Avoid flickering
    });

    const [shouldShowSticky, setShouldShowSticky] = useState(true); // Default to true (safe assumption for mobile usually)

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        // Show sticky triggers:
        // 1. Initial load: If buttons are below viewport (top > 0)
        // 2. Scrolling: If buttons are below viewport
        // Hide triggers:
        // 1. Buttons come into view
        // 2. Buttons are passed (scrolled above them)

        if (entry) {
            const isBelowViewport = entry.boundingClientRect.top > 0;
            // Show sticky ONLY if we are above the inline buttons (they are below viewport)
            // AND they are not currently visible (inView handles the overlap)
            setShouldShowSticky(!inView && isBelowViewport);
        } else {
            // Fallback for initial render before observer fires
            // Assuming buttons are at bottom, so likely show sticky initially
            setShouldShowSticky(true);
        }
    }, [inView, entry]);

    useEffect(() => {
        // Fetch specific product reviews
        if (id) {
            axios.get(`${config.API_URL}/reviews/${id}`)
                .then(res => setReviews(res.data))
                .catch(err => console.error("Error fetching reviews", err));
        }

        // Fetch random products for "People also viewed"
        axios.get(`${config.API_URL}/products`)
            .then(res => {
                const allProducts = res.data;
                // Shuffle and pick 4
                const shuffled = allProducts.sort(() => 0.5 - Math.random());
                setSimilarProducts(shuffled.slice(0, 4));
            })
            .catch(err => console.error("Error fetching similar products", err));
    }, [id]);
    const scrollRef = useRef(null);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const index = Math.round(scrollLeft / clientWidth);
            setActiveImageIndex(index);
        }
    };

    const handleWishlistToggle = async () => {
        if (!product) return;
        try {
            const res = await toggleWishlist(product._id);
            setIsWishlisted(res.isWishlisted);
        } catch (err) {
            console.error("Error toggling wishlist", err);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.title,
                    text: `Check out this product: ${product.title}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing', err);
            }
        } else {
            alert('Share feature is not supported on this browser/device.');
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${config.API_URL}/products/${id}`);
                setProduct(res.data);

                // Track ViewContent
                trackViewContent(res.data);

                // Check wishlist status
                const status = await checkWishlistStatus(id);
                setIsWishlisted(status);
            } catch (err) {
                console.error("Error fetching product details", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!product) return <div className="flex justify-center items-center h-screen">Product not found</div>;

    // Helper to get logic for variations
    const getPrice = () => {
        if (product.type === 'simple') return product.discountPrice || product.price;
        if (product.variations?.length) {
            const min = Math.min(...product.variations.map(v => v.discountPrice || v.price));
            return min;
        }
        return 0;
    };

    const getOriginalPrice = () => {
        if (product.type === 'simple') return product.price;
        if (product.variations?.length) {
            const min = Math.min(...product.variations.map(v => v.price));
            return min;
        }
        return 0;
    }

    // Helpers for Similar Products Grid
    const getProductPrice = (p) => {
        if (p.type === 'simple') return p.discountPrice || p.price || 0;
        if (p.variations && p.variations.length > 0) {
            const prices = p.variations.map(v => v.discountPrice || v.price).filter(p => p);
            return Math.min(...prices) || 0;
        }
        return 0;
    };

    const getProductRegularPrice = (p) => {
        if (p.type === 'simple') return p.price || 0;
        if (p.variations && p.variations.length > 0) {
            const prices = p.variations.map(v => v.price).filter(p => p);
            return Math.min(...prices) || 0;
        }
        return 0;
    };

    const handleAddToCart = (buyNow = false) => {
        setIsBuyNow(buyNow);
        setIsAddToCartOpen(true);
    };

    const confirmAddToCart = () => {
        if (!product) return;

        // Determine selected size/variation
        let selectedSize = 'Free Size';
        if (product.type === 'variable' && product.attributes && product.attributes.length > 0) {
            // Try to find a 'Size' attribute first
            const sizeAttr = product.attributes.find(a => a.name.toLowerCase() === 'size');
            if (sizeAttr) {
                selectedSize = selectedAttributes[sizeAttr.name];
                if (!selectedSize) {
                    alert(`Please select a ${sizeAttr.name}`);
                    return;
                }
            } else {
                // If no explicit 'Size' attribute, maybe just join all selected values or pick the first one
                // For now, let's require all attributes to be selected
                const missing = product.attributes.find(a => !selectedAttributes[a.name]);
                if (missing) {
                    alert(`Please select ${missing.name}`);
                    return;
                }
                selectedSize = Object.values(selectedAttributes).join(', ');
            }
        }

        const price = getPrice();
        const cartItem = {
            image: product.images?.[0] || 'https://via.placeholder.com/150',
            name: product.title,
            salePrice: price,
            regularPrice: getOriginalPrice(),
            size: selectedSize,
            quantity: 1,
            productId: product._id
        };

        addToCart(cartItem);

        // Pixel Tracking
        trackAddToCart(product);
        navigate('/cart');
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20 font-dm overflow-x-hidden">
            {/* Custom Header */}
            <div className="bg-white sticky top-0 z-50">
                {!isSearchOpen ? (
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <ArrowLeft size={24} className="text-gray-600 cursor-pointer" onClick={() => navigate(-1)} />
                            <img src={Logo} alt="Meesho" className="w-[90px] md:w-[120px]" />
                        </div>
                        <div className="flex items-center gap-5">
                            <Search size={22} className="text-[#9F2089] cursor-pointer" onClick={() => setIsSearchOpen(true)} />
                            <LucideHeart size={22} className="text-[#9F2089] cursor-pointer" onClick={() => navigate('/wishlist')} />
                            <ShoppingCart size={22} className="text-[#9F2089] cursor-pointer" onClick={() => navigate('/cart')} />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center px-4 py-3 border-b border-gray-100 gap-3">
                        <ArrowLeft size={24} className="text-gray-600 cursor-pointer" onClick={() => setIsSearchOpen(false)} />
                        <div className="flex-1 flex items-center bg-gray-100 rounded-md px-3 py-2">
                            <Search size={18} className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search by Keyword or Product ID"
                                className="bg-transparent outline-none w-full text-sm text-gray-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                                        setIsSearchOpen(false);
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                    </div>
                )}
                {/* Delivery Bar */}
                <div className="flex items-center gap-2 px-4 py-2 bg-[#f9f9f9] border-b border-gray-200 text-sm text-gray-700">
                    <MapPin size={16} className="text-[#4F585E]" />
                    <span>Delivering to <span className="font-semibold text-gray-900">Chorasi - 394101</span></span>
                    <span className="text-gray-400">›</span>
                </div>
            </div>

            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white">
                    {/* Visual Section */}
                    <div className="">
                        {/* Breadcrumbs */}
                        <div className="text-[12px] text-[#9F2089] font-dm font-medium py-3 px-4">
                            Home / {product.category?.parentCategory?.name || 'Category'} / {product.category?.name || 'Subcategory'} / {product.title.slice(0, 15)}...
                        </div>

                        {/* Native Image Slider */}
                        <div className="w-full relative">
                            <div
                                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide aspect-square w-full"
                                ref={scrollRef}
                                onScroll={handleScroll}
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {product.images && product.images.length > 0 ? (
                                    product.images.map((img, index) => (
                                        <div key={index} className="flex-none w-full h-full snap-center relative">
                                            <img
                                                src={img}
                                                alt={`${product.title} - ${index}`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex-none w-full h-full snap-center relative">
                                        <img
                                            src={'https://via.placeholder.com/600'}
                                            alt={product.title}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Custom Dots */}
                            {product.images && product.images.length > 1 && (
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                    {product.images.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${activeImageIndex === index ? 'bg-[#9F2089] scale-125' : 'bg-[#D9D9D9]'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Floating Actions on Image */}
                            <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
                                <button
                                    className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-pink-500"
                                    onClick={handleWishlistToggle}
                                >
                                    <LucideHeart size={20} fill={isWishlisted ? "#9F2089" : "none"} color={isWishlisted ? "#9F2089" : "currentColor"} />
                                </button>
                            </div>
                        </div>

                        {/* Similar Products Section */}
                        <div className="px-4 mt-6">
                            <h3 className="text-[15px] font-semibold mb-2 text-[rgb(139,139,163)]">1 Similar Products</h3>
                            <div className="flex gap-2">
                                <div
                                    className="w-20 h-20 border-2 border-[#9F2089] rounded-md p-1 cursor-pointer"
                                    onClick={() => {
                                        navigate(`/product/${product._id}`);
                                        window.scrollTo(0, 0);
                                    }}
                                >
                                    <img
                                        src={product.images?.[0] || 'https://via.placeholder.com/150'}
                                        alt="Similar Product"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Info Section (Title, Price, Ratings) */}
                        <div className="p-4 bg-white">
                            <div className="flex justify-between items-start">
                                <h1 className="text-[15px] font-semibold leading-[20px] overflow-hidden text-[rgb(139,139,163)] flex-1 pr-4 line-clamp-2">
                                    {product.title}
                                </h1>
                                <div className="flex gap-4 min-w-fit">
                                    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={handleWishlistToggle}>
                                        <LucideHeart size={20} className={isWishlisted ? "text-[#9F2089]" : "text-gray-600"} fill={isWishlisted ? "#9F2089" : "none"} />
                                        <span className="text-[10px] text-gray-500 font-medium">Wishlist</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={handleShare}>
                                        <svg width="20" height="20" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fill="#fff" d="M.947.979h16v16h-16z"></path>
                                            <path fillRule="evenodd" clipRule="evenodd" d="M10.489 3.912c0-1.62 1.266-2.933 2.829-2.933 1.562 0 2.828 1.313 2.828 2.933 0 1.62-1.266 2.933-2.828 2.933a2.784 2.784 0 0 1-2.175-1.057L7.071 8.303a3.007 3.007 0 0 1 .295 1.866l3.643 2.18a2.797 2.797 0 0 1 2.309-1.238c1.562 0 2.828 1.314 2.828 2.934s-1.266 2.933-2.828 2.933c-1.563 0-2.829-1.313-2.829-2.933 0-.172.014-.34.042-.504l-3.636-2.176a2.798 2.798 0 0 1-2.32 1.254c-1.562 0-2.828-1.314-2.828-2.934s1.266-2.933 2.828-2.933a2.75 2.75 0 0 1 1.674.568l4.33-2.673a3.042 3.042 0 0 1-.09-.735Zm4.423 0c0-.914-.714-1.654-1.594-1.654-.88 0-1.595.74-1.595 1.653s.714 1.654 1.595 1.654c.88 0 1.594-.74 1.594-1.654ZM6.17 9.684c0-.913-.714-1.653-1.595-1.653-.88 0-1.594.74-1.594 1.653s.714 1.653 1.594 1.653c.88 0 1.595-.74 1.595-1.653Zm7.148 2.706c.88 0 1.594.74 1.594 1.653s-.714 1.654-1.594 1.654c-.88 0-1.595-.74-1.595-1.654 0-.913.714-1.653 1.595-1.653Z" fill="#353543"></path>
                                        </svg>
                                        <span className="text-[10px] text-gray-500 font-medium">Share</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-1 flex items-center gap-3">
                                <span className="text-[25px] font-bold leading-[28px] text-[rgb(53,53,67)]">
                                    ₹{getPrice()}
                                </span>
                                {getOriginalPrice() > getPrice() && (
                                    <span className="text-[18px] text-[#58616A] line-through font-medium">
                                        ₹{getOriginalPrice()}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-[#038D63] text-[14px] font-semibold">
                                    ₹{getOriginalPrice() - getPrice()} Get Off ( Only For Today Deal )
                                </span>
                            </div>

                            <div className="mt-2 flex gap-2">
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">Free Delivery</span>
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">Only For Today</span>
                            </div>

                            <div className="flex items-center space-x-2 text-sm mt-3">
                                <span className="bg-[#23bb75] text-white px-2 py-0.5 rounded-full flex items-center text-xs font-bold">
                                    4.1 <Star size={10} className="ml-1 fill-white" />
                                </span>
                                <span className="text-gray-500 text-xs">3457 Ratings, 1900 Reviews •</span>
                            </div>
                        </div>
                    </div>

                    {/* Separator - Always Visible */}
                    <div className="h-2 bg-gray-100 -mx-4 mb-2"></div>

                    {/* Details Section */}
                    <div className="space-y-6 p-4">

                        {/* Size/Variation Config Mockup - Only for Variable Products */}
                        {product.type === 'variable' && product.attributes && (
                            <>
                                <div className="">
                                    {product.attributes.map((attr, index) => (
                                        <div key={index} className="mb-6">
                                            <h3 className="font-semibold mb-3 text-black text-[17px]">
                                                Select {attr.name}
                                            </h3>
                                            <div className="flex gap-3 flex-wrap">
                                                {attr.options.map(option => (
                                                    <button
                                                        key={option}
                                                        className={`border px-5 py-2 rounded-full text-[14px] font-medium transition-colors focus:outline-none
                                                        ${selectedAttributes[attr.name] === option
                                                                ? 'border-[#9F2089] text-[#9F2089] bg-[#FFF5FC] ring-1 ring-[#9F2089]'
                                                                : 'border-gray-300 text-gray-600 hover:border-[#9F2089] hover:text-[#9F2089]'
                                                            }`}
                                                        onClick={() => handleAttributeSelect(attr.name, option)}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Separator - Only show after variations */}
                                <div className="h-2 bg-gray-100 -mx-4 mb-2"></div>
                            </>
                        )}

                        {/* Sold By Section */}
                        <div className="mb-4">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Sold By</h3>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-full border border-blue-100">
                                        <Store size={24} className="text-[#9F2089]" />
                                    </div>
                                    <span className="font-semibold text-lg text-gray-800">Meesho Supply</span>
                                </div>
                                <button
                                    className="border border-[#9F2089] text-[#9F2089] px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-pink-50 transition-colors"
                                    onClick={() => navigate('/shop')}
                                >
                                    View Shop
                                </button>
                            </div>

                            <div className="flex justify-between items-start pr-8">
                                <div className="flex flex-col items-center">
                                    <div className="bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 mb-1">
                                        <span className="font-bold text-blue-600 text-sm">4.9</span>
                                        <Star size={10} className="fill-blue-600 text-blue-600" />
                                    </div>
                                    <span className="text-xs text-gray-500">20,458 Ratings</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-gray-800 text-lg">777.3K</span>
                                    <span className="text-xs text-gray-500">Followers</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-gray-800 text-lg">990</span>
                                    <span className="text-xs text-gray-500">Products</span>
                                </div>
                            </div>
                        </div>

                        {/* Separator before Description */}
                        <div className="h-2 bg-gray-100 -mx-4 mb-2"></div>


                        {/* Product Details Description */}
                        <div className="pt-6 border-t border-gray-100 font-dm">
                            <h3 className="font-bold text-[18px] mb-3 text-gray-800">Product Details</h3>
                            <div
                                className="text-gray-600 text-[14px] leading-7 font-dm break-all w-full [&_*]:max-w-full [&_*]:break-all [&_img]:max-w-full [&_img]:h-auto text-justify"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>

                        {/* Product Ratings & Reviews Section */}
                        <div className="pt-6 border-t border-gray-100 font-dm mb-20">
                            <h3 className="font-bold text-[18px] mb-4 text-gray-800">Product Ratings & Reviews</h3>

                            <div className="flex gap-4">
                                {/* Left: Overall Rating */}
                                <div className="flex flex-col w-1/3 pt-2">
                                    <div className="flex items-center gap-1 mb-1">
                                        <span className="text-[#038D63] text-[32px] font-bold leading-none">4.9</span>
                                        <Star size={24} className="fill-[#038D63] text-[#038D63]" />
                                    </div>
                                    <div className="text-[12px] text-gray-500 font-medium">
                                        <p>3068 Ratings,</p>
                                        <p>1514 Reviews</p>
                                    </div>
                                </div>

                                {/* Right: Rating Breakdown */}
                                <div className="flex-1 flex flex-col gap-2">
                                    {/* Excellent */}
                                    <div className="flex items-center gap-3 text-[12px]">
                                        <span className="w-16 text-gray-600 font-medium">Excellent</span>
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#038D63] rounded-full" style={{ width: '85%' }}></div>
                                        </div>
                                        <span className="w-8 text-right text-gray-500">1539</span>
                                    </div>

                                    {/* Very Good */}
                                    <div className="flex items-center gap-3 text-[12px]">
                                        <span className="w-16 text-gray-600 font-medium">Very Good</span>
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#038D63] rounded-full" style={{ width: '15%' }}></div>
                                        </div>
                                        <span className="w-8 text-right text-gray-500">470</span>
                                    </div>

                                    {/* Good */}
                                    <div className="flex items-center gap-3 text-[12px]">
                                        <span className="w-16 text-gray-600 font-medium">Good</span>
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#F4B619] rounded-full" style={{ width: '10%' }}></div>
                                        </div>
                                        <span className="w-8 text-right text-gray-500">399</span>
                                    </div>

                                    {/* Average */}
                                    <div className="flex items-center gap-3 text-[12px]">
                                        <span className="w-16 text-gray-600 font-medium">Average</span>
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#F49F00] rounded-full" style={{ width: '5%' }}></div>
                                        </div>
                                        <span className="w-8 text-right text-gray-500">125</span>
                                    </div>

                                    {/* Poor */}
                                    <div className="flex items-center gap-3 text-[12px]">
                                        <span className="w-16 text-gray-600 font-medium">Poor</span>
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#E85D5D] rounded-full" style={{ width: '0%' }}></div>
                                        </div>
                                        <span className="w-8 text-right text-gray-500">0</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Customer Reviews List */}
            <div className="border-t border-gray-100 mb-1 bg-white px-4">
                {Array.isArray(reviews) && reviews.length > 0 ? (
                    reviews.slice(0, 2).map((review) => (
                        <div key={review._id} className="py-4 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${review.userName}&background=random&color=fff`}
                                        alt={review.userName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="font-semibold text-[14px] text-gray-800">{review.userName}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-[#038D63] text-white px-2 py-0.5 rounded-[4px] text-[14px] font-bold flex items-center gap-1">
                                    {review.rating}.0 <Star size={10} className="fill-white" />
                                </div>
                                <span className="text-gray-300 text-[6px]">•</span>
                                <span className="text-gray-500 text-[12px]">Posted on {new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>

                            <p className="text-[14px] text-gray-800 mb-3 leading-relaxed">{review.reviewText}</p>

                            {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mb-4">
                                    {review.images.map((img, idx) => (
                                        <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={img} alt="Review" loading="lazy" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-gray-500 text-[13px] font-medium cursor-pointer group">
                                <div className="group-hover:bg-gray-100 p-1 -ml-1 rounded transition-colors">
                                    <ThumbsUp size={18} className="text-gray-500" />
                                </div>
                                <span className="mt-0.5">Helpful ({review.helpfulCount})</span>
                            </div>
                        </div>
                    ))) : (
                    <div className="py-4 text-center text-gray-500 text-sm">No reviews yet</div>
                )}

                {reviews.length > 2 && (
                    <button
                        onClick={() => setShowAllReviews(true)}
                        className="w-full py-4 text-[#9F2089] font-bold text-[14px] flex items-center justify-between border-t border-gray-100 mt-2 uppercase tracking-wide"
                    >
                        View All Reviews <span className="text-lg">›</span>
                    </button>
                )}
            </div>

            {/* Bottom Sheet Modal for All Reviews */}
            {showAllReviews && (
                <div className="fixed inset-0 z-[60] flex justify-end flex-col">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 transition-opacity"
                        onClick={() => setShowAllReviews(false)}
                    ></div>

                    {/* Sheet Content */}
                    <div className="relative bg-white w-full max-h-[85vh] rounded-t-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-bold text-gray-800">All Reviews ({reviews.length})</h2>
                            <button
                                onClick={() => setShowAllReviews(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Scrollable Reviews List */}
                        <div className="overflow-y-auto p-4 pb-20">
                            {reviews.map((review) => (
                                <div key={review._id} className="py-4 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${review.userName}&background=random&color=fff`}
                                                alt={review.userName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-[14px] text-gray-800">{review.userName}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-[#038D63] text-white px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold flex items-center gap-0.5 inline-flex">
                                                    {review.rating}.0 <Star size={8} className="fill-white" />
                                                </div>
                                                <span className="text-gray-500 text-[11px]">Posted on {new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[14px] text-gray-800 mb-3 leading-relaxed mt-2">{review.reviewText}</p>

                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 mb-4">
                                            {review.images.map((img, idx) => (
                                                <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                                    <img src={img} alt="Review" loading="lazy" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-gray-500 text-[13px] font-medium cursor-pointer group">
                                        <div className="group-hover:bg-gray-100 p-1 -ml-1 rounded transition-colors">
                                            <ThumbsUp size={18} className="text-gray-500" />
                                        </div>
                                        <span className="mt-0.5">Helpful ({review.helpfulCount})</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add To Cart Bottom Sheet Modal */}
            {isAddToCartOpen && (
                <div className="fixed inset-0 z-[70] flex justify-end flex-col">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 transition-opacity"
                        onClick={() => setIsAddToCartOpen(false)}
                    ></div>

                    {/* Sheet Content */}
                    <div className="relative bg-white w-full rounded-t-2xl shadow-xl flex flex-col animate-slide-up pb-8">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-[15px] font-bold text-gray-700 tracking-wide">ADD TO CART</h2>
                            <X
                                className="text-gray-500 cursor-pointer"
                                size={22}
                                onClick={() => setIsAddToCartOpen(false)}
                            />
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            {product.type === 'variable' && product.attributes && product.attributes.length > 0 ? (
                                product.attributes.map((attr, index) => (
                                    <div key={index} className="mb-4">
                                        <h3 className="font-bold text-[17px] text-gray-900 mb-3">Select {attr.name}</h3>
                                        <div className="flex gap-3 flex-wrap">
                                            {attr.options.map(option => (
                                                <button
                                                    key={option}
                                                    onClick={() => handleAttributeSelect(attr.name, option)}
                                                    className={`border px-6 py-2 rounded-full text-[15px] font-medium transition-colors focus:outline-none 
                                                    ${selectedAttributes[attr.name] === option
                                                            ? 'border-[#9F2089] bg-[#FFF5FC] text-[#9F2089]'
                                                            : 'border-gray-300 text-gray-600 hover:border-[#9F2089] hover:text-[#9F2089]'
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <h3 className="font-bold text-[17px] text-gray-900 mb-4">Select Size</h3>
                                    <button className="border border-[#9F2089] bg-[#FFF5FC] text-[#9F2089] text-[15px] px-6 py-2 rounded-full font-medium">
                                        Free Size
                                    </button>
                                </>
                            )}

                            <div className="mt-10 border-t border-gray-100 pt-4 flex items-center justify-between">
                                <h3 className="font-medium text-[17px] text-gray-700">Total Price</h3>
                                <span className="font-bold text-[19px] text-gray-900">₹{getPrice()}</span>
                            </div>
                        </div>

                        {/* Confirm Button */}
                        <div className="px-5">
                            <button
                                onClick={confirmAddToCart}
                                className="w-full bg-[#9F2089] text-white font-bold py-3.5 rounded-md flex items-center justify-center gap-3 text-[17px] hover:bg-[#8f1d7b] transition-colors"
                            >
                                <ShoppingCart size={20} className="text-white" />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Assurance Section */}
            <div style={{ backgroundColor: 'rgb(231, 238, 255)' }} className="py-4 mb-4 flex justify-between px-4 -mx-4">
                <div className="flex flex-col items-center gap-2 text-center flex-1 border-r border-[#d4dbe8] last:border-0">
                    <div className="bg-white p-2 rounded-full shadow-sm w-10 h-10 flex items-center justify-center">
                        <img src="/assets/lowest_price_user.png" alt="Lowest Price" loading="lazy" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[12px] text-gray-800 font-medium">Lowest Price</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center flex-1 border-r border-[#d4dbe8] last:border-0">
                    <div className="bg-white p-2 rounded-full shadow-sm w-10 h-10 flex items-center justify-center">
                        <img src="/assets/cod_user.png" alt="COD" loading="lazy" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[12px] text-gray-800 font-medium">Cash on Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center flex-1">
                    <div className="bg-white p-2 rounded-full shadow-sm w-10 h-10 flex items-center justify-center">
                        <img src="/assets/returns_user.png" alt="Returns" loading="lazy" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[12px] text-gray-800 font-medium">7-day Returns</span>
                </div>
            </div>

            {/* Actions (Inline) */}
            <div ref={buttonRef} className="flex space-x-3 px-4 mb-8">
                <button
                    className="flex-1 border border-[#9F2089] text-[#9F2089] py-3 rounded-md font-bold hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
                    onClick={() => handleAddToCart(false)}
                >
                    <ShoppingCart size={20} />
                    Add to Cart
                </button>
                <button
                    className="flex-1 bg-[#9F2089] text-white py-3 rounded-md font-bold hover:bg-[#8f1d7b] transition-colors flex items-center justify-center gap-2"
                    onClick={() => handleAddToCart(true)}
                >
                    <span className="text-lg">»</span> Buy Now
                </button>
            </div>

            {/* Sticky Actions (Conditional) */}
            {shouldShowSticky && (
                <div className="flex space-x-3 p-4 fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 animate-slide-up">
                    <button
                        className="flex-1 border border-[#9F2089] text-[#9F2089] py-3 rounded-md font-bold hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
                        onClick={() => handleAddToCart(false)}
                    >
                        <ShoppingCart size={20} />
                        Add to Cart
                    </button>
                    <button
                        className="flex-1 bg-[#9F2089] text-white py-3 rounded-md font-bold hover:bg-[#8f1d7b] transition-colors flex items-center justify-center gap-2"
                        onClick={() => handleAddToCart(true)}
                    >
                        <span className="text-lg">»</span> Buy Now
                    </button>
                </div>
            )}

            {/* People Also Viewed */}
            <div className="mb-20">
                <h3 className="font-bold text-[21px] font-normal text-gray-800 mb-2 px-4 font-dm">People also viewed</h3>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-gray-200">
                    {similarProducts.map(prod => {
                        const price = getProductPrice(prod);
                        const regularPrice = getProductRegularPrice(prod);
                        const discount = regularPrice > 0 ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;

                        return (
                            <div
                                key={prod._id}
                                className="border-r border-b border-gray-200 bg-white relative pb-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:z-10"
                                onClick={() => {
                                    navigate(`/product/${prod._id}`);
                                    window.scrollTo(0, 0);
                                }}
                            >
                                <div className="relative h-64 overflow-hidden group">
                                    <img
                                        src={prod.images?.[0] || 'https://via.placeholder.com/300'}
                                        alt={prod.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Wishlist Heart - Replicated Style */}
                                    <div className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-sm cursor-pointer hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-pink-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="px-3 pt-3 space-y-1 text-left">
                                    <h2 className="text-[#8b8ba3] text-[10px] font-semibold font-dm truncate">
                                        {prod.title.length > 35 ? prod.title.slice(0, 35) + "..." : prod.title}
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

                                    <div className="flex items-center gap-2 mt-3 cursor-default">
                                        <span className="flex items-center gap-1 bg-[#23bb75] text-white px-2 py-1 rounded-full text-[14px] font-bold font-dm leading-none">
                                            4.1 <FontAwesomeIcon icon={faStar} className="text-[10px]" />
                                        </span>
                                        <span className="text-[#8b8ba3] text-[12px] font-medium font-dm">(316)</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};


export default ProductDetails;
