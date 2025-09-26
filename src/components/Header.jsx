import React, { useState, useEffect } from "react";
import { Mountain, Menu, X, User, Home, MapPin, Calendar, ShoppingBag, UtensilsCrossed, ShoppingCart } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import apiServer from "../utils/apiServer";
import API_ROUTES from "../apiRoutes";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from 'react-toastify';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { user, logout } = useAuth();
  const { getCartItemCount, cartLoading } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const cartItemCount = getCartItemCount();

  // Check if current page should show cart icon
  const shouldShowCart = () => {
    const currentPath = location.pathname;
    return currentPath.startsWith('/products') || currentPath === '/cart';
  };

  // Check token presence in localStorage
  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    const parsedData = storedData ? JSON.parse(storedData) : null;
    setIsAuthenticated(!!parsedData?.token);
  }, [user]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await apiServer("post", API_ROUTES.LOGOUT, {}, { tokenRequired: false });
      logout();
      setIsMenuOpen(false);
      setShowProfileDropdown(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleMobileNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      toast.warn('Please login to view your cart');
      navigate('/login');
      return;
    }
    navigate('/cart');
  };

  const navigationItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Cities', path: '/cities', icon: MapPin },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Products', path: '/products', icon: ShoppingBag },
    { name: 'Restaurants', path: '/restaurant', icon: UtensilsCrossed },
  ];

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-2 rounded-xl">
                <Mountain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  GB Green Guide
                </h1>
                <p className="text-xs text-gray-500">Discover Gilgit-Baltistan</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="font-medium text-gray-700 hover:text-emerald-600 transition-colors">
                Home
              </Link>
              <Link to="/cities" className="font-medium text-gray-700 hover:text-emerald-600 transition-colors">
                Cities
              </Link>
              <Link to="/events" className="font-medium text-gray-700 hover:text-emerald-600 transition-colors">
                Events
              </Link>
              <Link to="/restaurant" className="font-medium text-gray-700 hover:text-emerald-600 transition-colors">
                Restaurants
              </Link>
              <Link to="/products" className="font-medium text-gray-700 hover:text-emerald-600 transition-colors">
                Products
              </Link>
              <Link to="/gallery" className="font-medium text-gray-700 hover:text-emerald-600 transition-colors">
                Gallery
              </Link>
            </nav>

            {/* Desktop Auth Buttons / Profile / Cart */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Cart Icon - Only show on product pages */}
              {shouldShowCart() && isAuthenticated && (
                <button
                  onClick={handleCartClick}
                  className="relative p-2 text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                  {cartLoading && (
                    <span className="absolute -top-1 -right-1 w-3 h-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    </span>
                  )}
                </button>
              )}

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-700">
                      {user?.username || "My Account"}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Desktop Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setShowProfileDropdown(false);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 w-full text-left transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                      </button>
                      {shouldShowCart() && (
                        <button
                          onClick={() => {
                            handleCartClick();
                            setShowProfileDropdown(false);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 w-full text-left transition-colors"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>My Cart ({cartItemCount})</span>
                        </button>
                      )}
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H3" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden mobile-menu-button p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}></div>
        </div>
      )}

      {/* Mobile Menu */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden mobile-menu ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-2 rounded-xl">
                <Mountain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  GB Green Guide
                </h2>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* User Profile Section (Mobile) */}
          {isAuthenticated && (
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{user?.username || "User"}</p>
                    <p className="text-sm text-gray-600">Welcome back!</p>
                  </div>
                </div>
                {/* Mobile Cart Icon */}
                {shouldShowCart() && (
                  <button
                    onClick={handleCartClick}
                    className="relative p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px]">
                        {cartItemCount > 9 ? '9+' : cartItemCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto">
            <nav className="px-6 py-4">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleMobileNavClick(item.path)}
                    className="flex items-center space-x-4 w-full p-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors mb-2"
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Profile Actions (Mobile) */}
            {isAuthenticated && (
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => handleMobileNavClick("/profile")}
                  className="flex items-center space-x-4 w-full p-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors mb-2"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">My Profile</span>
                </button>
                {shouldShowCart() && (
                  <button
                    onClick={handleCartClick}
                    className="flex items-center space-x-4 w-full p-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors mb-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="font-medium">My Cart ({cartItemCount})</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-4 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H3" />
                  </svg>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Auth Buttons (Mobile) - Only show when not authenticated */}
          {!isAuthenticated && (
            <div className="p-6 border-t border-gray-200 space-y-3">
              <button
                onClick={() => handleMobileNavClick("/login")}
                className="flex items-center space-x-4 w-full p-3 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H3" />
                </svg>
                <span className="font-medium">Login</span>
              </button>

              <button
                onClick={() => handleMobileNavClick("/signup")}
                className="flex items-center space-x-4 w-full p-3 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H3" />
                </svg>
                <span className="font-medium">Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;