import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import {
    LayoutDashboard,
    Edit,
    Package,
    Layers,
    Grid,
    Users,
    ShoppingBag,
    Menu,
    X,
    LogOut,
    ChevronDown
} from 'lucide-react';
import JoditEditor from 'jodit-react';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Data State
    const [categories, setCategories] = useState([]);
    const [parentCategories, setParentCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({ products: 0, categories: 0, parents: 0, users: 0 });

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
    const [generatedVariations, setGeneratedVariations] = useState([]);

    // Review Form State
    const [reviewProduct, setReviewProduct] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [reviewImage, setReviewImage] = useState('');
    const [reviewRating, setReviewRating] = useState(5);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const [catRes, parentCatRes, prodRes, userRes] = await Promise.all([
                axios.get(`${config.API_URL}/categories`),
                axios.get(`${config.API_URL}/parent-categories`),
                axios.get(`${config.API_URL}/products`),
                axios.get(`${config.API_URL}/users`)
            ]);
            setCategories(Array.isArray(catRes.data) ? catRes.data : []);
            setParentCategories(Array.isArray(parentCatRes.data) ? parentCatRes.data : []);
            setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);

            const users = Array.isArray(userRes.data) ? userRes.data : [];

            // Calculate pseudo-stats
            setStats({
                categories: Array.isArray(catRes.data) ? catRes.data.length : 0,
                parents: Array.isArray(parentCatRes.data) ? parentCatRes.data.length : 0,
                products: Array.isArray(prodRes.data) ? prodRes.data.length : 0,
                users: users.length
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
                        <StatCard title="Total orders" value="0" icon={<Package className="text-blue-500" />} />
                        <StatCard title="Parent Categories" value={stats.parents} icon={<Layers className="text-purple-500" />} />
                        <StatCard title="Child Categories" value={stats.categories} icon={<Grid className="text-green-500" />} />
                        <StatCard title="Total Users" value={stats.users} icon={<Users className="text-orange-500" />} />
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

                    <NavItem icon={<Package size={20} />} label="Add Product" active={activeTab === 'product'} onClick={() => { setActiveTab('product'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<ShoppingBag size={20} />} label="All Products" active={activeTab === 'all-products'} onClick={() => { setActiveTab('all-products'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<Layers size={20} />} label="Parent Categories" active={activeTab === 'parent'} onClick={() => { setActiveTab('parent'); setIsSidebarOpen(false); }} />
                    <NavItem icon={<Grid size={20} />} label="Child Categories" active={activeTab === 'child'} onClick={() => { setActiveTab('child'); setIsSidebarOpen(false); }} />
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
