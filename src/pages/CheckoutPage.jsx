import React, { useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Package,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShoppingCart,
  Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCheckout } from '../hooks/useCheckout';
import OrderSuccess from '../components/OrderSuccessComponent';

const CheckoutPage = () => {
  const { user } = useAuth();
  const {
    loading,
    error,
    orderSuccess,
    orderData,
    formData,
    orderSummary,
    isFormValid,
    getFieldError,
    hasFieldError,
    handleInputChange,
    handleInputBlur,
    submitCheckout,
    canCheckout,
    hasItems
  } = useCheckout();

  // Redirect if not authenticated or no items
  useEffect(() => {
    if (!user) {
      // Should redirect to login - placeholder for now
      console.log('Should redirect to login');
      return;
    }
    
    if (!hasItems) {
      // Should redirect to cart - placeholder for now
      console.log('Should redirect to cart');
      return;
    }
  }, [user, hasItems]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation display
    const requiredFields = ['full_name', 'phone', 'email', 'city', 'address_line1'];
    requiredFields.forEach(field => handleInputBlur(field));
    
    if (isFormValid) {
      await submitCheckout();
    }
  };

  // Handle navigation actions
  const handleContinueShopping = () => {
    console.log('Navigate to products page');
    // navigate('/products')
  };

  const handleGoHome = () => {
    console.log('Navigate to home page');
    // navigate('/')
  };

  const handleBackToCart = () => {
    console.log('Navigate to cart');
    // navigate('/cart')
  };

  // Show success screen
  if (orderSuccess && orderData) {
    return (
      <OrderSuccess
        orderData={orderData}
        onContinueShopping={handleContinueShopping}
        onGoHome={handleGoHome}
      />
    );
  }

  // Show loading or error states for unauthenticated users or empty cart
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to login to checkout</p>
          <button
            onClick={() => console.log('Navigate to login')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checkout</p>
          <button
            onClick={handleContinueShopping}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
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
                onClick={handleBackToCart}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Cart</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-lg font-bold text-gray-900">Secure Checkout</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Shipping Information
              </h2>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              <div onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      onBlur={() => handleInputBlur('full_name')}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                        hasFieldError('full_name')
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-emerald-500'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {getFieldError('full_name') && (
                      <p className="text-red-500 text-sm mt-1">{getFieldError('full_name')}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={() => handleInputBlur('phone')}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                        hasFieldError('phone')
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-emerald-500'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {getFieldError('phone') && (
                      <p className="text-red-500 text-sm mt-1">{getFieldError('phone')}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleInputBlur('email')}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                      hasFieldError('email')
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-emerald-500'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {getFieldError('email') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('email')}</p>
                  )}
                </div>

                {/* Address Section */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* City */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        onBlur={() => handleInputBlur('city')}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                          hasFieldError('city')
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-emerald-500'
                        }`}
                        placeholder="Enter your city"
                      />
                      {getFieldError('city') && (
                        <p className="text-red-500 text-sm mt-1">{getFieldError('city')}</p>
                      )}
                    </div>

                    {/* Country */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Address Line 1 */}
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Address Line 1 *</label>
                    <input
                      type="text"
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={(e) => handleInputChange('address_line1', e.target.value)}
                      onBlur={() => handleInputBlur('address_line1')}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                        hasFieldError('address_line1')
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-emerald-500'
                      }`}
                      placeholder="Street address, area, landmark"
                    />
                    {getFieldError('address_line1') && (
                      <p className="text-red-500 text-sm mt-1">{getFieldError('address_line1')}</p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={(e) => handleInputChange('address_line2', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Apartment, suite, unit, etc."
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </h3>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-emerald-600 rounded-full flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-gray-900">Cash on Delivery (COD)</p>
                        <p className="text-sm text-gray-600">Pay when your order is delivered to your doorstep</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !canCheckout}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Order...
                      </>
                    ) : (
                      <>
                        <Package className="w-5 h-5" />
                        Place Order - Rs. {orderSummary.total.toFixed(2)}
                      </>
                    )}
                  </button>

                  {!isFormValid && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Please fill in all required fields to continue
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Order Summary Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                <div className="text-sm text-gray-600 mb-4">
                  {orderSummary.itemCount} item{orderSummary.itemCount !== 1 ? 's' : ''} in your cart
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span className="text-emerald-600">Rs. {orderSummary.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Features */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Secure checkout process
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  Fast delivery across GB
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Quality guaranteed products
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Direct contact with sellers
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;