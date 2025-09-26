import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Eye,
  Check,
  Clock,
  Truck,
  X,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  Package,
  Phone,
  Mail,
  MapPin,
  Trash2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import Loader from './common/Loader';
import apiServer from '../utils/apiServer';
import API_ROUTES from '../apiRoutes';

const SellerOrdersComponent = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await apiServer(
        'get',
        API_ROUTES.SELLER_ORDERS,
        {},
        {
          tokenRequired: true,
          showNotification: false,
          showErrorNotification: true,
        }
      );

      console.log("Fetched seller orders:", response);
      setOrders(response.results || response || []);
    } catch (err) {
      console.error("Fetch seller orders error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [`status-${orderId}`]: true }));
      console.log(`Updating order ${orderId} to status ${newStatus}`);
      
      const response = await apiServer(
        'post',
        API_ROUTES.ORDER_CONFIRM(orderId),
        { status: newStatus },
        {
          tokenRequired: true,
          showNotification: true,
          showErrorNotification: true,
        }
      );

      if (!response.error) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );

        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        console.error('Update order error:', response);
        alert(`Failed to update order status: ${response.message || 'Please try again'}`);
      }
    } catch (err) {
      console.error("Update order status error:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [`status-${orderId}`]: false }));
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [`cancel-${orderId}`]: true }));
      
      const response = await apiServer(
        'post',
        `${API_ROUTES.ORDERS}${orderId}/cancel/`,
        {},
        {
          tokenRequired: true,
          showNotification: true,
          showErrorNotification: true,
        }
      );

      if (!response.error) {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        
        if (selectedOrder?.id === orderId) {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }
      } else {
        console.error('Cancel order error:', response);
        alert(`Failed to cancel order: ${response.message || 'Please try again'}`);
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [`cancel-${orderId}`]: false }));
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This will permanently remove it from your records.')) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [`delete-${orderId}`]: true }));
      
      const response = await apiServer(
        'delete',
        `${API_ROUTES.ORDERS}${orderId}/`,
        {},
        {
          tokenRequired: true,
          showNotification: true,
          showErrorNotification: true,
        }
      );

      if (!response.error) {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        
        if (selectedOrder?.id === orderId) {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }
      } else {
        console.error('Delete order error:', response);
        alert(`Failed to delete order: ${response.message || 'Please try again'}`);
      }
    } catch (err) {
      console.error("Delete order error:", err);
      alert("Failed to delete order. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${orderId}`]: false }));
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      Delivered: 'bg-green-100 text-green-800 border-green-200',
      Cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: <Clock className="w-4 h-4" />,
      Confirmed: <Check className="w-4 h-4" />,
      Shipped: <Truck className="w-4 h-4" />,
      Delivered: <Check className="w-4 h-4" />,
      Cancelled: <X className="w-4 h-4" />,
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  const canDeleteOrder = (order) => {
    return !['Shipped', 'Delivered'].includes(order.status);
  };

  const canCancelOrder = (order) => {
    return !['Delivered', 'Cancelled'].includes(order.status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Order Management</h2>
        <button
          onClick={fetchMyOrders}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Orders</span>
          <span className="sm:hidden">Refresh</span>
        </button>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="text-center py-12">
          <div className="mx-auto flex justify-center py-16">
            <Loader />
          </div>
          <p className="text-slate-500 mt-4">Loading orders...</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col space-y-4">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Order #{order.id}</h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border w-fit ${getStatusBadgeColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Desktop Actions */}
                  <div className="hidden lg:flex gap-2">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    
                    {canCancelOrder(order) && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        disabled={actionLoading[`cancel-${order.id}`]}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {actionLoading[`cancel-${order.id}`] ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span>Cancel</span>
                      </button>
                    )}
                    
                    {canDeleteOrder(order) && (
                      <button
                        onClick={() => deleteOrder(order.id)}
                        disabled={actionLoading[`delete-${order.id}`]}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {actionLoading[`delete-${order.id}`] ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Info - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">Customer:</span>
                    <span className="truncate">{order.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{order.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{order.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold text-emerald-600">
                      Rs. {Number(order.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package className="w-4 h-4 flex-shrink-0" />
                    <span>{order.items?.length || 0} items</span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{order.shipping_address || `${order.address_line1}, ${order.city}, ${order.country}`}</span>
                </div>

                {/* Mobile Actions */}
                <div className="flex flex-col sm:flex-row gap-2 lg:hidden">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>

                  <div className="flex gap-2">
                    {order.status === "Pending" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "Confirmed")}
                        disabled={actionLoading[`status-${order.id}`]}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {actionLoading[`status-${order.id}`] ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>Confirm</span>
                      </button>
                    )}

                    {order.status === "Confirmed" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "Shipped")}
                        disabled={actionLoading[`status-${order.id}`]}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {actionLoading[`status-${order.id}`] ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Truck className="w-4 h-4" />
                        )}
                        <span>Ship</span>
                      </button>
                    )}

                    {order.status === "Shipped" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "Delivered")}
                        disabled={actionLoading[`status-${order.id}`]}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {actionLoading[`status-${order.id}`] ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>Delivered</span>
                      </button>
                    )}

                    {canCancelOrder(order) && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        disabled={actionLoading[`cancel-${order.id}`]}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {actionLoading[`cancel-${order.id}`] ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span>Cancel</span>
                      </button>
                    )}

                    {canDeleteOrder(order) && (
                      <button
                        onClick={() => deleteOrder(order.id)}
                        disabled={actionLoading[`delete-${order.id}`]}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {actionLoading[`delete-${order.id}`] ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Desktop Status Action Buttons */}
                <div className="hidden lg:flex gap-2">
                  {order.status === "Pending" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "Confirmed")}
                      disabled={actionLoading[`status-${order.id}`]}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                    >
                      {actionLoading[`status-${order.id}`] ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Confirm Order</span>
                    </button>
                  )}

                  {order.status === "Confirmed" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "Shipped")}
                      disabled={actionLoading[`status-${order.id}`]}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                    >
                      {actionLoading[`status-${order.id}`] ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Truck className="w-4 h-4" />
                      )}
                      <span>Mark as Shipped</span>
                    </button>
                  )}

                  {order.status === "Shipped" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "Delivered")}
                      disabled={actionLoading[`status-${order.id}`]}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                    >
                      {actionLoading[`status-${order.id}`] ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Mark as Delivered</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && !loading && (
        <div className="text-center py-16">
          <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-slate-600 mb-2">No orders yet</h3>
          <p className="text-slate-500 mb-6">Orders from customers will appear here</p>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Order Details #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              {/* Order Status and Date */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border w-fit ${getStatusBadgeColor(selectedOrder.status)}`}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Order Date: {new Date(selectedOrder.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                    Rs. {Number(selectedOrder.total_amount || selectedOrder.total_price || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Customer Info + Address */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-gray-900">{selectedOrder.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900 break-all">{selectedOrder.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-900">{selectedOrder.phone}</p>
                    </div>
                    <div className="pt-2">
                      <a
                        href={`tel:${selectedOrder.phone}`}
                        className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call Customer</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-900">{selectedOrder.address_line1}</p>
                    {selectedOrder.address_line2 && (
                      <p className="text-gray-700">{selectedOrder.address_line2}</p>
                    )}
                    <p className="text-gray-700">{selectedOrder.city}, {selectedOrder.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({selectedOrder.items?.length || 0})
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 bg-white border border-gray-200 rounded-xl p-4"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex-shrink-0">
                        {item.product?.image || item.product_image ? (
                          <img
                            src={item.product?.image || item.product_image}
                            alt={item.product?.name || item.product_name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-4 h-4 sm:w-6 sm:h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.product?.name || item.product_name || "Unknown Product"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × Rs. {Number(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900">
                          Rs. {Number(item.subtotal || item.price * item.quantity || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  {selectedOrder.status === "Pending" && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, "Confirmed");
                        setShowOrderDetails(false);
                      }}
                      disabled={actionLoading[`status-${selectedOrder.id}`]}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading[`status-${selectedOrder.id}`] ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      <span>Confirm Order</span>
                    </button>
                  )}

                  {selectedOrder.status === "Confirmed" && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, "Shipped");
                        setShowOrderDetails(false);
                      }}
                      disabled={actionLoading[`status-${selectedOrder.id}`]}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading[`status-${selectedOrder.id}`] ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Truck className="w-5 h-5" />
                      )}
                      <span>Mark as Shipped</span>
                    </button>
                  )}

                  {selectedOrder.status === "Shipped" && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, "Delivered");
                        setShowOrderDetails(false);
                      }}
                      disabled={actionLoading[`status-${selectedOrder.id}`]}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading[`status-${selectedOrder.id}`] ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      <span>Mark as Delivered</span>
                    </button>
                  )}

                  {canCancelOrder(selectedOrder) && (
                    <button
                      onClick={() => {
                        cancelOrder(selectedOrder.id);
                      }}
                      disabled={actionLoading[`cancel-${selectedOrder.id}`]}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading[`cancel-${selectedOrder.id}`] ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      <span>Cancel Order</span>
                    </button>
                  )}

                  {canDeleteOrder(selectedOrder) && (
                    <button
                      onClick={() => {
                        deleteOrder(selectedOrder.id);
                      }}
                      disabled={actionLoading[`delete-${selectedOrder.id}`]}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading[`delete-${selectedOrder.id}`] ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                      <span>Delete Order</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span>Close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrdersComponent;