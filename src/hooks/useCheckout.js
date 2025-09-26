// src/hooks/useCheckout.js (Debug Version)
import { useState, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  processCheckout, 
  validateCartForCheckout, 
  calculateOrderSummary,
  prefillFormData,
  handleApiError
} from '../utils/checkoutUtils';

export const useCheckout = () => {
  const { cartItems, getCartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [formData, setFormData] = useState(() => prefillFormData(user));
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Calculate order summary
  const orderSummary = calculateOrderSummary(cartItems);

  // Handle form input changes
  const handleInputChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [formErrors]);

  // Handle input blur for validation
  const handleInputBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  // Set form field error
  const setFieldError = useCallback((field, errorMessage) => {
    setFormErrors(prev => ({ ...prev, [field]: errorMessage }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setError(null);
    setFormErrors({});
  }, []);

  // Validate cart before checkout
  const validateCart = useCallback(() => {
    const validation = validateCartForCheckout(cartItems);
    if (!validation.isValid) {
      setError(validation.message);
      return false;
    }
    return true;
  }, [cartItems]);

  // Submit checkout with detailed logging
  const submitCheckout = useCallback(async (customFormData = null) => {
    const dataToSubmit = customFormData || formData;
    
    console.log('🚀 Starting checkout submission...');
    console.log('📋 Form data:', dataToSubmit);
    console.log('🛒 Cart items:', cartItems);
    console.log('💰 Order total:', orderSummary.total);
    
    setLoading(true);
    setError(null);
    setFormErrors({});

    try {
      // Validate cart first
      console.log('✅ Validating cart...');
      if (!validateCart()) {
        console.log('❌ Cart validation failed');
        setLoading(false);
        return { success: false };
      }
      console.log('✅ Cart validation passed');

      // Process checkout
      console.log('🔄 Processing checkout...');
      const result = await processCheckout(
        dataToSubmit, 
        cartItems, 
        orderSummary.total
      );
      
      console.log('📨 Checkout result:', result);

      if (result.success) {
        console.log('✅ Checkout successful!');
        console.log('📦 Order data:', result.data);
        
        // Success
        setOrderData(result.data);
        setOrderSuccess(true);
        
        // Clear cart after successful order
        console.log('🗑️ Clearing cart...');
        setTimeout(() => {
          clearCart();
        }, 1000);
        
        return { success: true, data: result.data };
      } else {
        console.log('❌ Checkout failed:', result.message);
        
        // Handle errors
        if (result.errors && typeof result.errors === 'object') {
          console.log('📝 Setting form errors:', result.errors);
          setFormErrors(result.errors);
        }
        setError(result.message);
        return { success: false, message: result.message };
      }
      
    } catch (err) {
      console.error('💥 Unexpected checkout error:', err);
      
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      
      if (errorInfo.type === 'validation' && errorInfo.details) {
        setFormErrors(errorInfo.details);
      }
      
      return { success: false, message: errorInfo.message };
    } finally {
      setLoading(false);
    }
  }, [formData, cartItems, orderSummary.total, validateCart, clearCart]);

  // Reset checkout state
  const resetCheckout = useCallback(() => {
    console.log('🔄 Resetting checkout state...');
    setLoading(false);
    setError(null);
    setOrderSuccess(false);
    setOrderData(null);
    setFormErrors({});
    setTouched({});
    setFormData(prefillFormData(user));
  }, [user]);

  // Update form data with user info
  const updateFormWithUserData = useCallback(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        ...prefillFormData(user)
      }));
    }
  }, [user]);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    const requiredFields = ['full_name', 'phone', 'email', 'city', 'address_line1'];
    const isValid = requiredFields.every(field => 
      formData[field] && formData[field].toString().trim() !== ''
    ) && Object.keys(formErrors).length === 0;
    
    console.log('🔍 Form validation check:', {
      formData,
      formErrors,
      isValid
    });
    
    return isValid;
  }, [formData, formErrors]);

  // Get field error
  const getFieldError = useCallback((field) => {
    return touched[field] ? formErrors[field] : '';
  }, [touched, formErrors]);

  // Check if field has error
  const hasFieldError = useCallback((field) => {
    return touched[field] && formErrors[field];
  }, [touched, formErrors]);

  // Debug logging on state changes
  useState(() => {
    console.log('🏪 Checkout hook initialized:', {
      user: user?.username,
      cartItemsCount: cartItems?.length,
      orderSummary
    });
  });

  return {
    // State
    loading,
    error,
    orderSuccess,
    orderData,
    formData,
    formErrors,
    touched,
    orderSummary,
    
    // Form validation
    isFormValid: isFormValid(),
    getFieldError,
    hasFieldError,
    
    // Actions
    handleInputChange,
    handleInputBlur,
    setFieldError,
    clearErrors,
    submitCheckout,
    resetCheckout,
    updateFormWithUserData,
    validateCart,
    
    // Computed values
    canCheckout: cartItems.length > 0 && !loading,
    totalItems: cartItems.length,
    hasItems: cartItems.length > 0
  };
};