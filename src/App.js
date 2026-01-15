import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from 'react';
import Navbar from './Components/Navbar/Navbar';
import { CartProvider } from './Components/CartContext';
import { BrandProvider, useBrand } from './BrandContext';
import ProtectedRoute from './Components/Admin/ProtectedRoute';
import { trackPageView } from './utils/MetaPixel';

// Lazy-loaded route components
const Home = lazy(() => import('./Components/Home'));
const ProductDetails = lazy(() => import('./Components/Home/Products/ProductDetails'));
const Details = lazy(() => import('./Components/Details'));
const Wishlist = lazy(() => import('./Components/Wishlist/Wishlist'));
const ShopPage = lazy(() => import('./Components/Shop/ShopPage'));
const CategoryPage = lazy(() => import('./Components/Category/CategoryPage'));
const Categories = lazy(() => import('./Components/Category/Categories'));
const MyOrders = lazy(() => import('./Components/Order/MyOrders'));
const Help = lazy(() => import('./Components/Help/Help'));
const SearchResults = lazy(() => import('./Components/Home/SearchResults'));
const Cart = lazy(() => import('./Components/Cart'));
const Addcart = lazy(() => import('./Components/Addcart/Addcart'));
const Address = lazy(() => import('./Components/Cart/Address/Address'));
const Payments = lazy(() => import('./Components/Cart/Payments/Payments'));
const Summary = lazy(() => import('./Components/Cart/Summary/Summary'));
const MaintenancePage = lazy(() => import('./Components/MaintenancePage'));
const AdminPanel = lazy(() => import('./Components/Admin/AdminPanel'));
const AdminLogin = lazy(() => import('./Components/Admin/AdminLogin'));
const ThankYou = lazy(() => import('./Components/Order/ThankYou'));
const PaymentPending = lazy(() => import('./Components/Order/PaymentPending'));
const PaymentFailed = lazy(() => import('./Components/Order/PaymentFailed'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9F2089] mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const { maintenanceMode, loading } = useBrand();

  // Track PageView on route change
  useEffect(() => {
    trackPageView();
  }, [location]);

  if (loading) return <LoadingFallback />;
  if (maintenanceMode) return <Suspense fallback={<LoadingFallback />}><MaintenancePage /></Suspense>;

  // Hide Navbar if path starts with /bhikha or ...
  const shouldHideNavbar = location.pathname.startsWith('/bhikha') || location.pathname.startsWith('/product/') || location.pathname.startsWith('/shop') || location.pathname.startsWith('/category/') || location.pathname === '/cart' || location.pathname === '/address' || location.pathname === '/payments' || location.pathname === '/summary' || location.pathname === '/thankyou' || location.pathname === '/payment-pending' || location.pathname === '/payment-failed' || location.pathname === '/categories' || location.pathname === '/orders' || location.pathname === '/help' || location.pathname === '/search';

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/details" element={<Details />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path='/address' element={<Address />} />
          <Route path='/payments' element={<Payments />} />
          <Route path='/summary' element={<Summary />} />
          <Route path='/thankyou' element={<ThankYou />} />
          <Route path='/payment-pending' element={<PaymentPending />} />
          <Route path='/payment-failed' element={<PaymentFailed />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/help" element={<Help />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/addcart" element={<Addcart />} />
          <Route path="/bhikha/login" element={<AdminLogin />} />
          <Route path="/bhikha" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <>
      <BrandProvider>
        <CartProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </CartProvider>
      </BrandProvider>
    </>
  );
}

export default App;
