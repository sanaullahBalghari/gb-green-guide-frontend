import React, { useEffect } from 'react';
import {
  CheckCircle,
  Package,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

const OrderSuccess = ({ orderData, onContinueShopping, onGoHome }) => {
  useEffect(() => {
    // Auto redirect after 10 seconds - only if onGoHome is available
    if (typeof onGoHome === 'function') {
      const timer = setTimeout(() => {
        onGoHome();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [onGoHome]);

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No order data available</p>
        </div>
      </div>
    );
  }

  // Helper functions to safely extract data
  // Debug log the orderData structure
  console.log('🔍 OrderData in OrderSuccess:', orderData);
  
  // Handle nested data structure from API response
  const actualOrderData = orderData.data || orderData;
  
  const getOrderId = () => {
    return actualOrderData.id || actualOrderData.order_id || 'N/A';
  };

  const getFormattedDate = () => {
    const dateValue = actualOrderData.created_at || actualOrderData.date || actualOrderData.order_date;
    if (!dateValue) {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    try {
      return new Date(dateValue).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Date formatting error:', error);
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const getOrderItems = () => {
    // Try different possible structures for items
    return actualOrderData.items || 
           actualOrderData.order_items || 
           actualOrderData.cart_items || 
           [];
  };

  const getTotalAmount = () => {
    // Try different possible fields for total amount
    const total = actualOrderData.total_amount || 
                  actualOrderData.total_price || 
                  actualOrderData.total || 
                  actualOrderData.amount || 
                  0;
    
    const numericTotal = Number(total);
    return isNaN(numericTotal) ? 0 : numericTotal;
  };

  const getItemPrice = (item) => {
    const price = item.subtotal || 
                  item.total_price || 
                  item.price * item.quantity || 
                  item.amount || 
                  0;
    
    const numericPrice = Number(price);
    return isNaN(numericPrice) ? 0 : numericPrice;
  };

  const getProductName = (item) => {
    return item.product_name || 
           item.name || 
           (item.product && item.product.name) || 
           'Product';
  };

  const getProductImage = (item) => {
    return (item.product && item.product.image) || 
           item.image || 
           "https://via.placeholder.com/64x64?text=Product";
  };

  const orderItems = getOrderItems();
  const totalAmount = getTotalAmount();

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full mb-4 sm:mb-6">
            <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 text-base sm:text-lg">Thank you for shopping with GB Green Guide</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-6 sm:mb-8">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-white gap-2 sm:gap-0">
              <div>
                <p className="text-sm opacity-90">Order Number</p>
                <p className="text-lg sm:text-xl font-bold">#{getOrderId()}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm opacity-90">Order Date</p>
                <p className="font-medium text-sm sm:text-base">
                  {getFormattedDate()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Order Status */}
            <div className="flex items-start gap-3 mb-6 p-3 sm:p-4 bg-yellow-50 rounded-xl">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 text-sm sm:text-base">Order Status: Pending</p>
                <p className="text-sm text-yellow-600">
                  The seller has been notified and will contact you soon
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base sm:text-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                Order Items ({orderItems.length})
              </h3>
              <div className="space-y-3">
                {orderItems.length > 0 ? (
                  orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-xl">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={getProductImage(item)}
                          alt={getProductName(item)}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/64x64?text=Product";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {getProductName(item)}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Quantity: {item.quantity || 1}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-emerald-600 text-sm sm:text-base">
                          Rs. {getItemPrice(item).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No items information available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-base sm:text-lg">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  Shipping Address
                </h3>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {actualOrderData.full_name || 'N/A'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {actualOrderData.address_line1 || 'Address not available'}
                  </p>
                  {actualOrderData.address_line2 && (
                    <p className="text-gray-600 text-sm">{actualOrderData.address_line2}</p>
                  )}
                  <p className="text-gray-600 text-sm">
                    {actualOrderData.city || 'City'}, {actualOrderData.country || 'Pakistan'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-base sm:text-lg">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  Contact Information
                </h3>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base break-all">
                      {actualOrderData.phone || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base break-all">
                      {actualOrderData.email || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 text-sm sm:text-base">Payment Method:</span>
                <span className="font-medium text-sm sm:text-base">Cash on Delivery (COD)</span>
              </div>
              <div className="flex justify-between items-center text-base sm:text-lg font-bold text-gray-900">
                <span>Total Amount:</span>
                <span className="text-emerald-600">Rs. {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="font-semibold text-blue-900 mb-3 text-base sm:text-lg">What happens next?</h3>
          <div className="space-y-2 text-blue-800 text-sm sm:text-base">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>The seller has been notified about your order via email</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>They will contact you shortly to confirm the order and arrange delivery</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>You will pay when the order is delivered to your address</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>You can track your order status in the "My Orders" section</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={onContinueShopping}
            className="px-6 sm:px-8 py-3 sm:py-4 border border-emerald-600 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onGoHome}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            Go to Homepage
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Auto redirect notice - only show if onGoHome is available */}
        {typeof onGoHome === 'function' && (
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-6">
            You will be redirected to the homepage automatically in 10 seconds
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;