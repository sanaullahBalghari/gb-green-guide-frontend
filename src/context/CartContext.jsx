// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiServer from '../utils/apiServer';
import API_ROUTES from '../apiRoutes';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  // Fetch cart data when user changes
  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCart(null);
      setCartItems([]);
    }
  }, [user, token]);

  const fetchCart = async () => {
    if (!user || !token) return;
    try {
      setCartLoading(true);
      setCartError(null);

      const response = await apiServer(
        'get',
        API_ROUTES.CART,
        {},
        {
          tokenRequired: true,
          showNotification: false,
          showErrorNotification: false,
        }
      );

      if (response && response.results) {
        // Backend returns list of carts, get the first one
        const cartData = response.results.length > 0 ? response.results[0] : null;
        if (cartData) {
          setCart(cartData);
          setCartItems(cartData.items || []);
        } else {
          setCart(null);
          setCartItems([]);
        }
      } else if (response && response.id) {
        // Direct cart object
        setCart(response);
        setCartItems(response.items || []);
      } else {
        setCart(null);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartError('Failed to fetch cart');
      setCart(null);
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user || !token) {
      toast.error('Login required to add items to your cart');
      navigate('/login');
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setCartLoading(true);
      setCartError(null);

      const response = await apiServer(
        'post',
        API_ROUTES.CART_ADD,
        {
          product_id: productId,
          quantity,
        },
        {
          tokenRequired: true,
          showNotification: true,
          showErrorNotification: true,
        }
      );

      if (response) {
        setCart(response);
        setCartItems(response.items || []);
        return { success: true, data: response };
      } else {
        return { success: false, error: 'Failed to add item to cart' };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartError('Failed to add item to cart');
      return { success: false, error: 'Failed to add item to cart' };
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!user || !token) {
      toast.error('Login required');
      navigate('/login');
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setCartLoading(true);
      setCartError(null);

      const response = await apiServer(
        'post',
        API_ROUTES.CART_REMOVE,
        {
          product_id: productId,
        },
        {
          tokenRequired: true,
          showNotification: true,
          showErrorNotification: true,
        }
      );

      if (response) {
        setCart(response);
        setCartItems(response.items || []);
        return { success: true, data: response };
      } else {
        return { success: false, error: 'Failed to remove item' };
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setCartError('Failed to remove item from cart');
      return { success: false, error: 'Failed to remove item from cart' };
    } finally {
      setCartLoading(false);
    }
  };

  const updateCartItemQuantity = async (productId, newQuantity) => {
    if (!user || !token || newQuantity < 1) return { success: false };

    if (newQuantity === 0) {
      return await removeFromCart(productId);
    }

    try {
      setCartLoading(true);
      setCartError(null);

      // First remove the item
      await apiServer(
        'post',
        API_ROUTES.CART_REMOVE,
        { product_id: productId },
        {
          tokenRequired: true,
          showNotification: false,
          showErrorNotification: false,
        }
      );

      // Then add with new quantity
      const response = await apiServer(
        'post',
        API_ROUTES.CART_ADD,
        {
          product_id: productId,
          quantity: newQuantity,
        },
        {
          tokenRequired: true,
          showNotification: false,
          showErrorNotification: true,
        }
      );

      if (response) {
        setCart(response);
        setCartItems(response.items || []);
        toast.success('Cart updated successfully!');
        return { success: true, data: response };
      } else {
        return { success: false, error: 'Failed to update cart' };
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast.error('Failed to update cart item');
      return { success: false, error: 'Failed to update cart item' };
    } finally {
      setCartLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user || !token) {
      toast.error('Login required');
      navigate('/login');
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setCartLoading(true);
      setCartError(null);

      const response = await apiServer(
        'post',
        API_ROUTES.CART_CLEAR,
        {},
        {
          tokenRequired: true,
          showNotification: true,
          showErrorNotification: true,
        }
      );

      // Clear cart API returns a success message, not cart data
      if (response) {
        setCart(null);
        setCartItems([]);
        return { success: true };
      } else {
        return { success: false, error: 'Failed to clear cart' };
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setCartError('Failed to clear cart');
      return { success: false, error: 'Failed to clear cart' };
    } finally {
      setCartLoading(false);
    }
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.total_price || 0), 0);
  };
  
  const isInCart = (productId) => {
    return cartItems.some(item => item.product?.id === productId);
  };

  const getCartItemQuantity = (productId) => {
    const item = cartItems.find(item => item.product?.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cart,
    cartItems,
    cartLoading,
    cartError,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    fetchCart,
    getCartItemCount,
    getCartSubtotal,
    isInCart,
    getCartItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};