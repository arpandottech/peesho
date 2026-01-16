import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import {
    Globe,
    LayoutDashboard,
    Edit,
    Package,
    Layers,
    Grid,
    Users,
    ShoppingBag,
    Menu,
    X,
    FileText,
    LogOut,
    ChevronDown,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import JoditEditor from 'jodit-react';

const AdminPanel = () => {
    // Force rebuild
    console.log("AdminPanel Loaded");
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Data State
    const [categories, setCategories] = useState([]);
    const [parentCategories, setParentCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]); // Add Order State
    const [stats, setStats] = useState({ products: 0, categories: 0, parents: 0, users: 0, orders: 0 });

    // User Form State
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');

    // Parent Category Form State
    const [parentCatName, setParentCatName] = useState('');
    const [parentCatImage, setParentCatImage] = useState('');

    // Child Category Form State
    const [catName, setCatName] = useState('');
    const [catImage, setCatImage] = useState('');
    const [selectedParentCat, setSelectedParentCat] = useState('');

    // Product Form State
    const [prodTitle, setProdTitle] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [prodDiscountPrice, setProdDiscountPrice] = useState('');
    const [prodCategory, setProdCategory] = useState('');
    const [prodImage, setProdImage] = useState('');
    const [additionalImages, setAdditionalImages] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const editor = useRef(null);

    // Jodit Config
    const editorConfig = useMemo(() => ({
        readonly: false,
        placeholder: 'Start typing...',
        height: 400,
        uploader: {
            insertImageAsBase64URI: true
        }
    }), []);

    // Variable Product State
    const [prodType, setProdType] = useState('simple'); // 'simple' or 'variable'
    const [hasColor, setHasColor] = useState(false);
    const [hasSize, setHasSize] = useState(false);
    const [colors, setColors] = useState('');
    const [sizes, setSizes] = useState('');
    // Variation State
    const [generatedVariations, setGeneratedVariations] = useState([]);

    // Reconciliation State
    const [selectedDomain, setSelectedDomain] = useState('All');

    const [domains, setDomains] = useState([]);

    useEffect(() => {
        if (activeTab === 'domains') {
            fetchDomains();
            const interval = setInterval(fetchDomains, 5000); // Poll status every 5s
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    const fetchDomains = async () => {
        try {
            const res = await axios.get(`${config.API_URL}/domains`);
            setDomains(res.data);
        } catch (err) {
            console.error("Failed to fetch domains", err);
        }
    };

    const handleAddDomain = async (domain) => {
        const meta_pixel_id = prompt("Enter Meta Pixel ID for this domain (Optional):");
        try {
            await axios.post(`${config.API_URL}/domains`, { domain_name: domain, meta_pixel_id });
            fetchDomains();
            alert("Domain queued for setup.");
        } catch (err) {
            alert("Failed to add domain: " + (err.response?.data?.error || err.message));
        }
    };

    const handleToggleDomain = async (id, currentStatus) => {
        try {
            // Toggle between 'active' and 'inactive'
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await axios.put(`${config.API_URL}/domains/${id}/toggle`, { status: newStatus });
            fetchDomains();
        } catch (err) {
            alert("Failed to toggle: " + (err.response?.data?.error || err.message));
        }
    };

    const handleRetryDomain = async (id) => {
        try {
            await axios.post(`${config.API_URL}/domains/${id}/retry`);
            fetchDomains();
            alert("Retry queued.");
        } catch (err) {
            alert("Failed to retry: " + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteDomain = async (id) => {
        if (!window.confirm("Are you sure? This will remove the domain from the panel but DNS must be removed manually.")) return;
        try {
            await axios.delete(`${config.API_URL}/domains/${id}`);
            fetchDomains();
        } catch (err) {
            alert("Failed to delete domain");
        }
    };

    const handleEditPixelId = async (domainId, domainName, currentPixelId) => {
        const newPixelId = prompt(`Enter Meta Pixel ID for ${domainName}:`, currentPixelId || '');
        if (newPixelId !== null && newPixelId !== currentPixelId) {
            try {
                await axios.put(`${config.API_URL}/domains/${domainId}`, { meta_pixel_id: newPixelId });
                fetchDomains();
                alert("Meta Pixel ID updated successfully!");
            } catch (err) {
                alert("Failed to update Meta Pixel ID: " + (err.response?.data?.error || err.message));
            }
        }
    };
    const [reviewProduct, setReviewProduct] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [reviewImage, setReviewImage] = useState('');
    const [reviewRating, setReviewRating] = useState(5);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const [catRes, parentCatRes, prodRes, userRes, orderRes] = await Promise.all([
                axios.get(`${config.API_URL}/categories`),
                axios.get(`${config.API_URL}/parent-categories`),
                axios.get(`${config.API_URL}/products`),
                axios.get(`${config.API_URL}/users`),
                axios.get(`${config.API_URL}/orders`) // Fetch Orders
            ]);
            setCategories(Array.isArray(catRes.data) ? catRes.data : []);
            setParentCategories(Array.isArray(parentCatRes.data) ? parentCatRes.data : []);
            setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
            setOrders(Array.isArray(orderRes.data) ? orderRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);

            const users = Array.isArray(userRes.data) ? userRes.data : [];

            setStats({
                categories: Array.isArray(catRes.data) ? catRes.data.length : 0,
                parents: Array.isArray(parentCatRes.data) ? parentCatRes.data.length : 0,
                products: Array.isArray(prodRes.data) ? prodRes.data.length : 0,
                users: users.length,
                orders: Array.isArray(orderRes.data) ? orderRes.data.length : 0
            });

        } catch (err) {
            console.error("Error fetching resources", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        navigate('/bhikha/login');
    };

    // --- Handlers ---
    const handleManualReviewToggle = async (order) => {
        try {
            // Optimistic Update
            const updated = orders.map(o => o._id === order._id ? { ...o, isManualReviewNeeded: !o.isManualReviewNeeded } : o);
            setOrders(updated);

            // Call API to persist
            await axios.put(`${config.API_URL}/orders/${order._id}/manual-review`, { isManualReviewNeeded: !order.isManualReviewNeeded });
        } catch (err) {
            console.error("Failed to toggle review flag", err);
            // Revert on error
            fetchResources();
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.API_URL}/users`, { email: userEmail, password: userPassword });
            alert('User Created!');
            setUserEmail(''); setUserPassword(''); fetchResources();
        } catch (err) { alert('Failed to create user'); }
    };

    const handleParentCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.API_URL}/parent-categories`, { name: parentCatName, image: parentCatImage });
            alert('Parent Category Added!');
            setParentCatName(''); setParentCatImage(''); fetchResources();
        } catch (err) { alert('Failed to add parent category'); }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.API_URL}/categories`, { name: catName, image: catImage, parentCategory: selectedParentCat || null });
            alert('Child Category Added!');
            setCatName(''); setCatImage(''); setSelectedParentCat(''); fetchResources();
        } catch (err) { alert('Failed to add category'); }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.API_URL}/reviews`, {
                productId: reviewProduct,
                reviewText: reviewText,
                images: reviewImage ? [reviewImage] : [],
                rating: reviewRating
            });
            alert('Review Added!');
            setReviewProduct(''); setReviewText(''); setReviewImage(''); setReviewRating(5);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || err.message || 'Unknown Error';
            alert(`Failed to add review: ${msg}`);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                title: prodTitle,
                description: prodDesc,
                category: prodCategory,
                images: [prodImage, ...additionalImages].filter(img => img && img.trim() !== ''),
                type: prodType
            };

            if (prodType === 'simple') {
                productData.price = prodPrice;
                productData.discountPrice = prodDiscountPrice;
            } else {
                // Construct attributes
                const attributes = [];
                if (hasColor) attributes.push({ name: 'Color', options: colors.split(',').map(c => c.trim()).filter(c => c) });
                if (hasSize) attributes.push({ name: 'Size', options: sizes.split(',').map(s => s.trim()).filter(s => s) });
                productData.attributes = attributes;
                productData.variations = generatedVariations;
            }

            if (editingProduct) {
                await axios.put(`${config.API_URL}/products/${editingProduct._id}`, productData);
                alert('Product Updated!');
            } else {
                await axios.post(`${config.API_URL}/products`, productData);
                alert('Product Added!');
            }

            // Reset Form
            setProdTitle(''); setProdDesc(''); setProdPrice(''); setProdDiscountPrice(''); setProdCategory(''); setProdImage('');
            setAdditionalImages([]);
            setProdType('simple'); setHasColor(false); setHasSize(false); setColors(''); setSizes(''); setGeneratedVariations([]);
            setEditingProduct(null);
            fetchResources();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || err.message || 'Unknown Error';
            alert(`Failed to save product: ${msg}`);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProdTitle(product.title);
        setProdDesc(product.description);
        setProdCategory(product.category?._id || product.category); // Handle populated or ID
        setProdImage(product.images?.[0] || '');
        setAdditionalImages(product.images?.slice(1) || []);
        setProdType(product.type);

        if (product.type === 'simple') {
            setProdPrice(product.price);
            setProdDiscountPrice(product.discountPrice);
            setHasColor(false); setHasSize(false); setColors(''); setSizes(''); setGeneratedVariations([]);
        } else {
            setProdPrice(''); setProdDiscountPrice('');
            const colorAttr = product.attributes.find(a => a.name === 'Color');
            const sizeAttr = product.attributes.find(a => a.name === 'Size');

            setHasColor(!!colorAttr);
            setHasSize(!!sizeAttr);
            setColors(colorAttr ? colorAttr.options.join(', ') : '');
            setSizes(sizeAttr ? sizeAttr.options.join(', ') : '');

            // For variations, we load them directly
            setGeneratedVariations(product.variations || []);
        }

        setActiveTab('product');
    };

    const generateVariations = () => {
        const colorOptions = hasColor ? colors.split(',').map(c => c.trim()).filter(c => c) : [];
        const sizeOptions = hasSize ? sizes.split(',').map(s => s.trim()).filter(s => s) : [];

        let newVariations = [];

        if (hasColor && hasSize) {
            colorOptions.forEach(color => {
                sizeOptions.forEach(size => {
                    newVariations.push({
                        combination: { Color: color, Size: size },
                        price: prodPrice || 0,
                        discountPrice: prodDiscountPrice || 0,
                        stock: 10,
                        sku: `${color}-${size}`
                    });
                });
            });
        } else if (hasColor) {
            colorOptions.forEach(color => {
                newVariations.push({
                    combination: { Color: color },
                    price: prodPrice || 0,
                    discountPrice: prodDiscountPrice || 0,
                    stock: 10,
                    sku: `${color}`
                });
            });
        } else if (hasSize) {
            sizeOptions.forEach(size => {
                newVariations.push({
                    combination: { Size: size },
                    price: prodPrice || 0,
                    discountPrice: prodDiscountPrice || 0,
                    stock: 10,
                    sku: `${size}`
                });
            });
        }
        setGeneratedVariations(newVariations);
    };

    const handleVariationChange = (index, field, value) => {
        const updated = [...generatedVariations];
        updated[index][field] = value;
        setGeneratedVariations(updated);
    };

    const getPriceDisplay = (product) => {
        if (product.type === 'simple') return product.price;
        if (product.variations && product.variations.length > 0) {
            const prices = product.variations.map(v => v.price).filter(p => p !== undefined && p !== null);
            if (prices.length === 0) return '-';
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            return min === max ? min : `${min} - ${max}`;
        }
        return '-';
    };

    const getSalePriceDisplay = (product) => {
        if (product.type === 'simple') return product.discountPrice || '-';
        if (product.variations && product.variations.length > 0) {
            const prices = product.variations.map(v => v.discountPrice).filter(p => p !== undefined && p !== null && p !== 0 && p !== '');
            if (prices.length === 0) return '-';
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            return min === max ? min : `${min} - ${max}`;
        }
        return '-';
    };

    // --- Render Content ---
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <StatCard title="Total Products" value={stats.products} icon={<Package className="text-blue-500" />} />
                        <StatCard title="Total orders" value={stats.orders} icon={<FileText className="text-blue-500" />} />
                        <StatCard title="Parent Categories" value={stats.parents} icon={<Layers className="text-purple-500" />} />
                        <StatCard title="Child Categories" value={stats.categories} icon={<Grid className="text-green-500" />} />
                        <StatCard title="Total Users" value={stats.users} icon={<Users className="text-orange-500" />} />
                    </div>
                );
            case 'reconciliation':
                const uniqueDomains = ['All', ...new Set(orders.map(o => o.domain ? new URL(o.domain).hostname : 'Unknown').filter(d => d !== 'Unknown'))];
                const filteredOrders = selectedDomain === 'All'
                    ? orders
                    : orders.filter(o => o.domain && new URL(o.domain).hostname === selectedDomain);
                return (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex justify-between items-center">
                            <span>Payment Reconciliation</span>

                            <select
                                value={selectedDomain}
                                onChange={(e) => setSelectedDomain(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#9F2089]"
                            >
                                {uniqueDomains.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-600 text-sm">
                                    <tr>
                                        <th className="p-3 border-b">Date</th>
                                        <th className="p-3 border-b">Order ID</th>
                                        <th className="p-3 border-b">Txn ID</th>
                                        <th className="p-3 border-b">Amount</th>
                                        <th className="p-3 border-b">Domain / Pixel</th>
                                        <th className="p-3 border-b">Status</th>
                                        <th className="p-3 border-b">Review</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map(order => {
                                        const isIssue = ['PAYMENT_FAILED', 'PAYMENT_ABANDONED'].includes(order.status);
                                        const isPending = order.status === 'PAYMENT_PENDING';

                                        let bgClass = '';
                                        if (isIssue) bgClass = 'bg-red-50 hover:bg-red-100';
                                        else if (isPending) bgClass = 'bg-yellow-50 hover:bg-yellow-100';
                                        else bgClass = 'hover:bg-gray-50';

                                        return (
                                            <tr key={order._id} className={`border-b ${bgClass}`}>
                                                <td className="p-3 text-sm text-gray-600">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                    <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</div>
                                                </td>
                                                <td className="p-3 text-xs font-mono text-gray-500">
                                                    {order._id.slice(-6).toUpperCase()}
                                                    {order.riskMetadata?.flagged && (
                                                        <div className="group relative inline-block ml-2 align-middle">
                                                            <AlertTriangle size={14} className="text-red-600 cursor-help" />
                                                            <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-40 bg-black text-white text-[10px] p-2 rounded z-20">
                                                                <p className="font-bold border-b border-gray-700 pb-1 mb-1">Risk Detected</p>
                                                                <ul className="list-disc pl-3">
                                                                    {order.riskMetadata.reasons.map((r, i) => <li key={i}>{r.replace(/_/g, ' ')}</li>)}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3 text-xs font-mono">{order.transactionId || 'N/A'}</td>
                                                <td className="p-3 font-bold text-gray-700">₹{order.totalAmount}</td>
                                                <td className="p-3 text-sm">
                                                    <div className="text-blue-600">{order.domain ? new URL(order.domain).hostname : 'N/A'}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono">Pixel: {order.pixelId || 'N/A'}</div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'PAYMENT_SUCCESS' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'PAYMENT_FAILED' ? 'bg-red-100 text-red-700' :
                                                            order.status === 'PAYMENT_ABANDONED' ? 'bg-gray-200 text-gray-600' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.status.replace('PAYMENT_', '')}
                                                    </span>
                                                    {order.retryAttempts > 0 && (
                                                        <div className="text-[10px] text-gray-500 mt-1">Retries: {order.retryAttempts}</div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={order.isManualReviewNeeded || false}
                                                            onChange={() => handleManualReviewToggle(order)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500 relative"></div>
                                                        <span className="ml-2 text-xs text-gray-500">Flag</span>
                                                    </label>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'product':
                return (
                    <FormCard title={editingProduct ? "Edit Product" : "Add New Product"}>
                        <form onSubmit={handleProductSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <SelectField label="Product Type" value={prodType} onChange={(e) => setProdType(e.target.value)}>
                                    <option value="simple">Simple Product</option>
                                    <option value="variable">Variable Product</option>
                                </SelectField>
                                <SelectField label="Category" value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}>
                                    <option value="">Select Child Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name} {cat.parentCategory ? `(${cat.parentCategory.name})` : ''}</option>
                                    ))}
                                </SelectField>
                            </div>

                            <InputField label="Product Title" value={prodTitle} onChange={(e) => setProdTitle(e.target.value)} />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <JoditEditor
                                    ref={editor}
                                    value={prodDesc}
                                    config={editorConfig}
                                    tabIndex={1}
                                    onBlur={newContent => setProdDesc(newContent)}
                                    onChange={newContent => { }}
                                />
                            </div>
                            <InputField label="Featured Image URL" value={prodImage} onChange={(e) => setProdImage(e.target.value)} />

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Additional Images</label>
                                {additionalImages.map((img, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={img}
                                            onChange={(e) => {
                                                const newImages = [...additionalImages];
                                                newImages[idx] = e.target.value;
                                                setAdditionalImages(newImages);
                                            }}
                                            className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F2089]"
                                            placeholder="Image URL"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newImages = additionalImages.filter((_, i) => i !== idx);
                                                setAdditionalImages(newImages);
                                            }}
                                            className="text-red-500 hover:text-red-700 font-bold px-2"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setAdditionalImages([...additionalImages, ''])}
                                    className="text-sm text-[#9F2089] font-bold hover:underline"
                                >
                                    + Add New Image
                                </button>
                            </div>

                            {prodType === 'simple' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Regular Price" type="number" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} />
                                    <InputField label="Sale Price" type="number" value={prodDiscountPrice} onChange={(e) => setProdDiscountPrice(e.target.value)} />
                                </div>
                            )}

                            {prodType === 'variable' && (
                                <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                                    <h3 className="font-bold text-gray-700">Variations Configuration</h3>

                                    <div className="flex space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" checked={hasColor} onChange={(e) => setHasColor(e.target.checked)} />
                                            <span>Has Color</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" checked={hasSize} onChange={(e) => setHasSize(e.target.checked)} />
                                            <span>Has Size</span>
                                        </label>
                                    </div>

                                    {hasColor && (
                                        <InputField label="Colors (comma separated)" placeholder="e.g. Red, Blue, Green" value={colors} onChange={(e) => setColors(e.target.value)} />
                                    )}
                                    {hasSize && (
                                        <InputField label="Sizes (comma separated)" placeholder="e.g. S, M, L, XL" value={sizes} onChange={(e) => setSizes(e.target.value)} />
                                    )}

                                    <button type="button" onClick={generateVariations} className="bg-blue-600 text-white px-4 py-2 rounded">Generate Variations</button>

                                    {generatedVariations.length > 0 && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-gray-200">
                                                    <tr>
                                                        <th className="p-2">Variation</th>
                                                        <th className="p-2">Regular Price</th>
                                                        <th className="p-2">Sale Price</th>
                                                        <th className="p-2">Stock</th>
                                                        <th className="p-2">SKU</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {generatedVariations.map((v, idx) => (
                                                        <tr key={idx} className="border-b">
                                                            <td className="p-2">
                                                                {Object.entries(v.combination).map(([key, val]) => `${key}: ${val}`).join(', ')}
                                                            </td>
                                                            <td className="p-2">
                                                                <input type="number" value={v.price} onChange={(e) => handleVariationChange(idx, 'price', e.target.value)} className="w-20 border rounded px-1" />
                                                            </td>
                                                            <td className="p-2">
                                                                <input type="number" value={v.discountPrice} onChange={(e) => handleVariationChange(idx, 'discountPrice', e.target.value)} className="w-20 border rounded px-1" />
                                                            </td>
                                                            <td className="p-2">
                                                                <input type="number" value={v.stock} onChange={(e) => handleVariationChange(idx, 'stock', e.target.value)} className="w-20 border rounded px-1" />
                                                            </td>
                                                            <td className="p-2">
                                                                <input type="text" value={v.sku} onChange={(e) => handleVariationChange(idx, 'sku', e.target.value)} className="w-24 border rounded px-1" />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            <SubmitButton>{editingProduct ? "Update Product" : "Add Product"}</SubmitButton>
                        </form>
                    </FormCard>
                );
            case 'reviews':
                return (
                    <FormCard title="Review">
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <SelectField label="Select Product" value={reviewProduct} onChange={(e) => setReviewProduct(e.target.value)}>
                                <option value="">-- Choose Product --</option>
                                {products.map(p => (
                                    <option key={p._id} value={p._id}>{p.title}</option>
                                ))}
                            </SelectField>
                            <InputField label="Description Review" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                                />
                                {reviewImage && <img src={reviewImage} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />}
                            </div>

                            <div className="hidden">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating: {reviewRating} Stars</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={reviewRating}
                                    onChange={(e) => setReviewRating(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <SubmitButton>Add Review</SubmitButton>
                        </form>
                    </FormCard>
                );
            case 'all-products':
                return (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 border-b border-gray-100 font-bold text-gray-800">All Products</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-600 text-sm">
                                    <tr>
                                        <th className="p-3 border-b">Image</th>
                                        <th className="p-3 border-b">Title</th>
                                        <th className="p-3 border-b">Category</th>
                                        <th className="p-3 border-b">Type</th>
                                        <th className="p-3 border-b">Regular Price</th>
                                        <th className="p-3 border-b">Sale Price</th>
                                        <th className="p-3 border-b">Stock</th>
                                        <th className="p-3 border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p._id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <img src={p.images?.[0] || 'https://via.placeholder.com/40'} alt={p.title} className="w-10 h-10 object-cover rounded" />
                                            </td>
                                            <td className="p-3 font-medium">{p.title}</td>
                                            <td className="p-3 text-sm text-gray-500">{p.category?.name || '-'}</td>
                                            <td className="p-3 text-sm capitalize">{p.type}</td>
                                            <td className="p-3">{getPriceDisplay(p)}</td>
                                            <td className="p-3">{getSalePriceDisplay(p)}</td>
                                            <td className="p-3">{p.type === 'simple' ? (p.stock || 'N/A') : `${p.variations?.length || 0} Variants`}</td>
                                            <td className="p-3">
                                                <button onClick={() => handleEditProduct(p)} className="text-blue-600 hover:text-blue-800">
                                                    <Edit size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'domains':
                return (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Domain Management</h2>
                                <p className="text-sm text-gray-500">Manage custom domains for your store front.</p>
                            </div>
                            <button
                                onClick={() => {
                                    const domain = prompt("Enter new domain (e.g., shop.example.com):");
                                    if (domain) handleAddDomain(domain);
                                }}
                                className="bg-[#9F2089] text-white px-4 py-2 rounded shadow hover:bg-[#7a1869] flex items-center gap-2"
                            >
                                <Globe size={16} />
                                + Add Domain
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Domain</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Setup Progress</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Site Status</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {domains && domains.map(d => {
                                        // Determine Setup Stage
                                        let setupStage = 'Initializing';
                                        let setupColor = 'text-yellow-600';
                                        let showDnsWarning = false;

                                        if (d.apache_status === 'pending') {
                                            setupStage = 'Configuring Server...';
                                        } else if (d.apache_status === 'failed') {
                                            setupStage = 'Server Config Failed';
                                            setupColor = 'text-red-600';
                                        } else if (d.ssl_status === 'pending') {
                                            setupStage = 'Verifying DNS & Issuing SSL...';
                                            showDnsWarning = true; // Likely waiting for DNS
                                        } else if (d.ssl_status === 'failed') {
                                            setupStage = 'SSL Failed (Check DNS)';
                                            setupColor = 'text-red-600';
                                            showDnsWarning = true;
                                        } else if (d.ssl_status === 'active') {
                                            setupStage = 'Ready';
                                            setupColor = 'text-green-600';
                                        }

                                        return (
                                            <tr key={d._id} className="border-b hover:bg-gray-50">
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-800">{d.domain_name}</div>
                                                    <div className="text-xs text-gray-400 mt-1">Pixel ID: {d.meta_pixel_id || 'Not Set'}</div>
                                                    {showDnsWarning && (
                                                        <div className="flex items-center gap-1 text-[10px] text-orange-600 bg-orange-50 px-2 py-1 rounded mt-1 w-fit">
                                                            <AlertTriangle size={10} />
                                                            <span>Ensure DNS points to this server IP</span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Unified Setup Progress */}
                                                <td className="p-4">
                                                    <div className={`text-sm font-bold ${setupColor} flex items-center gap-2`}>
                                                        {setupColor.includes('yellow') && <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
                                                        {setupColor.includes('green') && <CheckCircle size={14} />}
                                                        {setupStage}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-1">
                                                        Apache: {d.apache_status} | SSL: {d.ssl_status}
                                                    </div>
                                                </td>

                                                {/* Site Status Toggle */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <label className={`relative inline-flex items-center cursor-pointer ${setupStage !== 'Ready' ? 'opacity-50 pointer-events-none' : ''}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={d.status === 'active'}
                                                                onChange={() => handleToggleDomain(d._id, d.status)}
                                                                className="sr-only peer"
                                                                disabled={setupStage !== 'Ready'}
                                                            />
                                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                                        </label>
                                                        <span className={`text-xs font-bold ${d.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                                                            {d.status === 'active' ? 'Live' : 'Maintenance Mode'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {(d.apache_status === 'failed' || d.ssl_status === 'failed') && (
                                                            <button
                                                                onClick={() => handleRetryDomain(d._id)}
                                                                className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-xs transition-colors"
                                                            >
                                                                Retry Setup
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEditPixelId(d._id, d.domain_name, d.meta_pixel_id)}
                                                            className="text-white bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded text-xs transition-colors"
                                                        >
                                                            Edit Pixel
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDomain(d._id)}
                                                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {(!domains || domains.length === 0) && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-400 italic">
                                                No domains attached. improved setup visibility.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 bg-blue-50 p-4 rounded-lg text-xs text-blue-700 flex items-start gap-2">
                            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                            <div>
                                <strong>Setup Guide:</strong>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>Add your domain here (e.g., <code>myshop.com</code>).</li>
                                    <li>Go to your Domain Registrar (Godaddy, Namecheap) and point the <strong>A Record</strong> to this server's IP.</li>
                                    <li>The system will automatically configure SSL (HTTPS) once DNS propagates (usually 1 hour).</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case 'parent':
                return (
                    <div className="space-y-6">
                        <FormCard title="Add Parent Category">
                            <form onSubmit={handleParentCategorySubmit} className="space-y-4">
                                <InputField label="Name (e.g. Men)" value={parentCatName} onChange={(e) => setParentCatName(e.target.value)} />
                                <InputField label="Image URL" value={parentCatImage} onChange={(e) => setParentCatImage(e.target.value)} />
                                <SubmitButton>Create Parent Category</SubmitButton>
                            </form>
                        </FormCard>

                        {/* Existing Parent Categories Table */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b border-gray-100 font-bold text-gray-800">Existing Parent Categories</div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm">
                                        <th className="p-3 border-b">Image</th>
                                        <th className="p-3 border-b">Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parentCategories.map(p => (
                                        <tr key={p._id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
                                            </td>
                                            <td className="p-3 font-medium">{p.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'child':
                return (
                    <div className="space-y-6">
                        <FormCard title="Add Child Category">
                            <form onSubmit={handleCategorySubmit} className="space-y-4">
                                <SelectField label="Parent Category" value={selectedParentCat} onChange={(e) => setSelectedParentCat(e.target.value)}>
                                    <option value="">Select Parent Category</option>
                                    {parentCategories.map(pc => (
                                        <option key={pc._id} value={pc._id}>{pc.name}</option>
                                    ))}
                                </SelectField>
                                <InputField label="Category Name (e.g. Shirts)" value={catName} onChange={(e) => setCatName(e.target.value)} />
                                <InputField label="Image URL" value={catImage} onChange={(e) => setCatImage(e.target.value)} />
                                <SubmitButton>Create Child Category</SubmitButton>
                            </form>
                        </FormCard>

                        {/* Existing Child Categories Table */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b border-gray-100 font-bold text-gray-800">Existing Child Categories</div>
                            <div className="overflow-x-auto max-h-96">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-gray-50 z-10">
                                        <tr className="text-gray-600 text-sm">
                                            <th className="p-3 border-b">Image</th>
                                            <th className="p-3 border-b">Name</th>
                                            <th className="p-3 border-b">Parent Category</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map(c => (
                                            <tr key={c._id} className="border-b hover:bg-gray-50">
                                                <td className="p-3">
                                                    <img src={c.image} alt={c.name} className="w-10 h-10 object-cover rounded" />
                                                </td>
                                                <td className="p-3 font-medium">{c.name}</td>
                                                <td className="p-3 text-gray-500 text-sm">{c.parentCategory ? c.parentCategory.name : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'user':
                return (
                    <FormCard title="Create New User">
                        <form onSubmit={handleUserSubmit} className="space-y-4">
                            <InputField label="Email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                            <InputField label="Password" type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                            <SubmitButton>Create User</SubmitButton>
                        </form>
                    </FormCard>
                );
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-dm">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-[#1E1E1E] text-white transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">Meesho Admin</h2>
                    <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}><X /></button>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />

                    <div className="pt-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Manage Business</div>

                    <NavItem icon={<FileText size={20} />} label="Reconciliation" active={activeTab === 'reconciliation'} onClick={() => { setActiveTab('reconciliation'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<Package size={20} />} label="Add Product" active={activeTab === 'product'} onClick={() => { setActiveTab('product'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<ShoppingBag size={20} />} label="All Products" active={activeTab === 'all-products'} onClick={() => { setActiveTab('all-products'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<Layers size={20} />} label="Parent Categories" active={activeTab === 'parent'} onClick={() => { setActiveTab('parent'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<Grid size={20} />} label="Child Categories" active={activeTab === 'child'} onClick={() => { setActiveTab('child'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<Globe size={20} />} label="Domains" active={activeTab === 'domains'} onClick={() => { setActiveTab('domains'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<Users size={20} />} label="Review" active={activeTab === 'reviews'} onClick={() => { setActiveTab('reviews'); setIsSidebarOpen(false); }} />

                    <div className="pt-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Settings</div>
                    <NavItem icon={<Users size={20} />} label="User Management" active={activeTab === 'user'} onClick={() => { setActiveTab('user'); setIsSidebarOpen(false); }} />
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
                    <button onClick={handleLogout} className="flex items-center space-x-2 text-red-400 hover:text-red-300 w-full">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-200">
                {/* Mobile Header */}
                <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
                        <Menu />
                    </button>
                    <span className="font-bold text-lg">Admin Panel</span>
                    <div className="w-6"></div> {/* Spacer */}
                </header>

                {/* Desktop Header / Breadcrumb Area */}
                <header className="hidden md:flex bg-white shadow-sm p-4 justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}</h1>
                    <div className="flex items-center space-x-2 text-gray-600">
                        <span>Admin User</span>
                        <ChevronDown size={16} />
                    </div>
                </header>

                {/* Content Body */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

// --- Subcomponents for Clean Code ---
const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 w-full p-3 rounded-md transition-colors ${active ? 'bg-[#9F2089] text-white' : 'text-gray-300 hover:bg-gray-800'}`}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
    </div>
);

const FormCard = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const InputField = ({ label, type = "text", value, onChange, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F2089] focus:border-transparent transition"
            required
            {...props}
        />
    </div>
);



const SelectField = ({ label, value, onChange, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F2089] focus:border-transparent transition bg-white"
            required
            {...props}
        >
            {children}
        </select>
    </div>
);

const SubmitButton = ({ children }) => (
    <button type="submit" className="w-full bg-[#9F2089] text-white py-2.5 rounded-lg font-bold hover:bg-[#801a6f] transition-colors shadow-sm">
        {children}
    </button>
);

export default AdminPanel;
