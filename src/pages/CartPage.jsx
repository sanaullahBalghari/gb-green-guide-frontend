import React, { useEffect } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  CreditCard,
  Shield,
  Truck,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    cartItems,
    cartLoading,
    cartError,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartSubtotal,
    fetchCart
  } = useCart();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  // --- Handlers ---
  const handleQuantityChange = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    await updateCartItemQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      await removeFromCart(productId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      await clearCart();
    }
  };

  // Cart validation function
  const validateCartItems = () => {
    const issues = [];
    
    cartItems.forEach(item => {
      if (!item.product) {
        issues.push(`Product information missing for cart item`);
      } else {
        if (item.product.stock !== undefined && item.product.stock < item.quantity) {
          issues.push(`${item.product.name} - Only ${item.product.stock} left in stock`);
        }
        if (!item.product.is_available) {
          issues.push(`${item.product.name} - No longer available`);
        }
      }
    });
    
    return issues;
  };

  const handleCheckout = () => {
    // Validate cart before checkout
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before checkout.');
      return;
    }

    // Check for out of stock items
    const outOfStockItems = cartItems.filter(item => 
      item.product?.stock !== undefined && 
      item.product.stock < item.quantity
    );

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => item.product.name).join(', ');
      alert(`Some items in your cart are out of stock: ${itemNames}. Please update quantities.`);
      return;
    }

    // Check for unavailable items
    const unavailableItems = cartItems.filter(item => 
      item.product?.is_available === false
    );

    if (unavailableItems.length > 0) {
      const itemNames = unavailableItems.map(item => item.product.name).join(', ');
      alert(`Some items in your cart are no longer available: ${itemNames}. Please remove them from cart.`);
      return;
    }

    // Check if all items belong to the same seller (if required)
    const sellers = [...new Set(cartItems.map(item => item.product?.owner?.id || item.product?.owner))];
    if (sellers.length > 1) {
      alert('Your cart contains items from multiple sellers. Please checkout items from one seller at a time.');
      return;
    }

    // Navigate to checkout page
    navigate('/checkout');
  };

  // --- Totals (Only Subtotal & Total) ---
  const subtotal = getCartSubtotal();
  const total = subtotal;

  // Get cart validation issues
  const cartIssues = validateCartItems();

  // --- States ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to login to view your cart</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={cartError} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/products')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium ">Continue Shopping</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-lg font-bold text-gray-900">Shopping Cart</h1>
            </div>

            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                disabled={cartLoading}
                className="text-red-600 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          // Empty Cart
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet.
              Start shopping to fill it up with amazing products from Gilgit-Baltistan!
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  {/* Item Content */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image */}
                    <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.product?.image || "https://via.placeholder.com/200x200?text=No+Image"}
                        alt={item.product?.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3
                          className="text-lg font-bold text-gray-900 hover:text-emerald-600 cursor-pointer"
                          onClick={() => navigate(`/products/${item.product?.id}`)}
                        >
                          {item.product?.name || "Unknown Product"}
                        </h3>
                        <button
                          onClick={() => handleRemoveItem(item.product?.id)}
                          disabled={cartLoading}
                          className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Price */}
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            {item.product?.category?.name} • {item.product?.city?.name}
                          </p>
                          <div className="flex items-center gap-2">
                            {item.product?.discount_price ? (
                              <>
                                <span className="text-lg font-bold text-emerald-600">
                                  Rs. {item.product.discount_price}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  Rs. {item.product.price}
                                </span>
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                  {item.product.discount_percentage}% OFF
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-emerald-600">
                                Rs. {item.product?.price}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Quantity + Total */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.product?.id, item.quantity, -1)}
                              disabled={cartLoading || item.quantity <= 1}
                              className="p-2 hover:bg-gray-50 disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.product?.id, item.quantity, 1)}
                              disabled={cartLoading || item.quantity >= (item.product?.stock || 1)}
                              className="p-2 hover:bg-gray-50 disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              Rs. {Number(item.total_price || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Rs. {Number(item.product?.discount_price ?? item.product?.price ?? 0).toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock Warning */}
                  {item.product?.stock < 10 && item.product?.stock > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Only {item.product.stock} left in stock - order soon!
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Cart Issues Warning */}
                {cartIssues.length > 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Cart Issues</span>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {cartIssues.map((issue, index) => (
                        <li key={index}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={cartLoading || cartItems.length === 0 || cartIssues.length > 0}
                  className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                </button>
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-600" /> Secure checkout</div>
                  <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-emerald-600" /> Fast delivery across GB</div>
                  <div className="flex items-center gap-2"><Package className="w-4 h-4 text-emerald-600" /> Quality guaranteed</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;