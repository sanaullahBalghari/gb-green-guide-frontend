// src/context/OrderContext.js
import React, { createContext, useContext, useState } from 'react';
import apiServer from '../utils/apiServer';
import API_ROUTES from '../apiRoutes';

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Create a new order
  const createOrder = async (orderData) => {
    setOrderLoading(true);
    setOrderError(null);
    
    try {
      const response = await apiServer(
        'post',
        API_ROUTES.ORDERS,
        orderData,
        {
          tokenRequired: true,
          showNotification: true,
          showErrorNotification: true,
        }
      );
      
      // Add new order to local state
      setOrders(prevOrders => [response, ...prevOrders]);
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = 'Failed to place order. Please try again.';
      setOrderError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setOrderLoading(false);
    }
  };

  // Fetch user orders
  const fetchOrders = async () => {
    setOrderLoading(true);
    setOrderError(null);
    
    try {
      const response = await apiServer(
        'get',
        API_ROUTES.ORDERS,
        {},
        {
          tokenRequired: true,
          showNotification: false,
          showErrorNotification: true,
        }
      );
      
      setOrders(response.results || response);
    } catch (error) {
      setOrderError('Failed to fetch orders');
    } finally {
      setOrderLoading(false);
    }
  };

  // Confirm order (for business owners)
  const confirmOrder = async (orderId) => {
    setOrderLoading(true);
    setOrderError(null);
    
    try {
      const response = await apiServer(
        'post',
        API_ROUTES.ORDER_CONFIRM(orderId),
        {},
        {
          tokenRequired: true,
          showNotification: true,
          showErrorNotification: true,
        }
      );
      
      // Update order status in local state
      setOrders(prevOrders =>
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'confirmed' }
            : order
        )
      );
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = 'Failed to confirm order. Please try again.';
      setOrderError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setOrderLoading(false);
    }
  };

  // Get order by ID
  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  // Clear orders (logout)
  const clearOrders = () => {
    setOrders([]);
    setOrderError(null);
  };

  // Filter orders by status
  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status.toLowerCase() === status.toLowerCase());
  };

  // Get buyer orders (orders made by current user)
  const getBuyerOrders = () => {
    return orders.filter(order => order.buyer_id || order.user); // Depending on your API structure
  };

  // Get seller orders (orders for current user's products)
  const getSellerOrders = () => {
    return orders.filter(order => order.seller_id || order.owner); // Depending on your API structure
  };

  const value = {
    // State
    orders,
    orderLoading,
    orderError,
    
    // Actions
    createOrder,
    fetchOrders,
    confirmOrder,
    getOrderById,
    clearOrders,
    getOrdersByStatus,
    getBuyerOrders,
    getSellerOrders,
    
    // Utils
    setOrderError
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};