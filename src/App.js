import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from './Components/Navbar/Navbar';
import Home from './Components/Home';
import ProductDetails from './Components/Home/Products/ProductDetails';
import Details from './Components/Details';
import Wishlist from './Components/Wishlist/Wishlist';
import ShopPage from './Components/Shop/ShopPage';
import CategoryPage from './Components/Category/CategoryPage';
import Categories from './Components/Category/Categories';
import MyOrders from './Components/Order/MyOrders';
import Help from './Components/Help/Help';
import SearchResults from './Components/Home/SearchResults';

import Cart from './Components/Cart';
import Addcart from './Components/Addcart/Addcart';
import Address from './Components/Cart/Address/Address';
import { CartProvider } from './Components/CartContext';
import Payments from './Components/Cart/Payments/Payments';
import Summary from './Components/Cart/Summary/Summary';
import AdminPanel from './Components/Admin/AdminPanel';
import AdminLogin from './Components/Admin/AdminLogin';
import ProtectedRoute from './Components/Admin/ProtectedRoute';
import ThankYou from './Components/Order/ThankYou';
import PaymentPending from './Components/Order/PaymentPending';

import { useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  // Hide Navbar if path starts with /bhikha or /product/ or /shop
  const shouldHideNavbar = location.pathname.startsWith('/bhikha') || location.pathname.startsWith('/product/') || location.pathname.startsWith('/shop') || location.pathname.startsWith('/category/') || location.pathname === '/cart' || location.pathname === '/address' || location.pathname === '/payments' || location.pathname === '/summary' || location.pathname === '/thankyou' || location.pathname === '/payment-pending' || location.pathname === '/categories' || location.pathname === '/orders' || location.pathname === '/help' || location.pathname === '/search';

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
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
    </>
  );
}

function App() {
  return (
    <>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>

    </>
  );
}

export default App;
