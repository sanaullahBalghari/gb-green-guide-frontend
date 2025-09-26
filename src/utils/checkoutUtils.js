// // src/utils/checkoutUtils.js
// import apiServer from './apiServer';
// import API_ROUTES from '../apiRoutes';

// // Validation rules
// export const validateCheckoutForm = (formData) => {
//   const errors = {};
  
//   // Required fields
//   const requiredFields = {
//     full_name: 'Full name is required',
//     phone: 'Phone number is required',
//     email: 'Email is required',
//     city: 'City is required',
//     address_line1: 'Address is required'
//   };
  
//   // Check required fields
//   Object.keys(requiredFields).forEach(field => {
//     if (!formData[field] || !formData[field].toString().trim()) {
//       errors[field] = requiredFields[field];
//     }
//   });
  
//   // Email validation
//   if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//     errors.email = 'Please enter a valid email address';
//   }
  
//   // Phone validation
//   if (formData.phone && !/^[+]?[\d\s\-()]+$/.test(formData.phone)) {
//     errors.phone = 'Please enter a valid phone number';
//   }
  
//   return {
//     isValid: Object.keys(errors).length === 0,
//     errors
//   };
// };

// // Format order data for API
// export const formatOrderData = (formData, cartItems, cartTotal) => {
//   return {
//     // Personal information
//     full_name: formData.full_name.trim(),
//     phone: formData.phone.trim(),
//     email: formData.email.trim().toLowerCase(),
    
//     // Address information
//     city: formData.city.trim(),
//     address_line1: formData.address_line1.trim(),
//     address_line2: formData.address_line2 ? formData.address_line2.trim() : '',
//     country: formData.country || 'Pakistan',
    
//     // Payment method (only COD for now)
//     payment_method: 'COD',
    
//     // Additional metadata
//     order_notes: formData.order_notes || '',
    
//     // Cart summary for validation
//     items_count: cartItems.length,
//     expected_total: cartTotal
//   };
// };

// // Process checkout
// export const processCheckout = async (formData, cartItems, cartTotal) => {
//   try {
//     console.log('🛒 Starting checkout process...');
    
//     // Validate form data
//     const validation = validateCheckoutForm(formData);
//     if (!validation.isValid) {
//       console.log('❌ Form validation failed:', validation.errors);
//       return {
//         success: false,
//         errors: validation.errors,
//         message: 'Please fix the form errors before proceeding'
//       };
//     }
    
//     // Check if cart is not empty
//     if (!cartItems || cartItems.length === 0) {
//       console.log('❌ Cart is empty');
//       return {
//         success: false,
//         message: 'Your cart is empty. Please add items before checkout.'
//       };
//     }
    
//     // Format order data
//     const orderData = formatOrderData(formData, cartItems, cartTotal);
//     console.log('📦 Formatted order data:', orderData);
    
//     // Submit order to API
//     console.log('🚀 Submitting order to API...');
//     const response = await apiServer(API_ROUTES.ORDERS, 'POST', orderData);
//     console.log('📨 API Response:', response);
    
//     if (response.error) {
//       console.log('❌ API returned error:', response.message);
//       return {
//         success: false,
//         message: response.message || 'Failed to place order. Please try again.',
//         data: response.data,
//         errors: response.data?.errors || {}
//       };
//     }
    
//     console.log('✅ Order placed successfully!');
//     return {
//       success: true,
//       data: response.data,
//       message: response.message || 'Order placed successfully!',
//       emailSent: response.emailSent || response.data?.email_sent
//     };
    
//   } catch (error) {
//     console.error('💥 Checkout process error:', error);
//     return {
//       success: false,
//       message: error.message || 'Something went wrong. Please try again.',
//       error: error
//     };
//   }
// };

// // Format order for display
// export const formatOrderForDisplay = (orderData) => {
//   if (!orderData) return null;
  
//   return {
//     ...orderData,
//     formattedDate: new Date(orderData.created_at).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     }),
//     formattedTotal: `Rs. ${Number(orderData.total_price || orderData.total_amount || 0).toFixed(2)}`,
//     statusColor: getStatusColor(orderData.status),
//     statusText: formatStatusText(orderData.status)
//   };
// };

// // Get status color for UI
// const getStatusColor = (status) => {
//   const statusColors = {
//     'pending': 'text-yellow-600 bg-yellow-100',
//     'confirmed': 'text-blue-600 bg-blue-100',
//     'shipped': 'text-purple-600 bg-purple-100',
//     'delivered': 'text-green-600 bg-green-100',
//     'cancelled': 'text-red-600 bg-red-100'
//   };
  
//   return statusColors[status?.toLowerCase()] || 'text-gray-600 bg-gray-100';
// };

// // Format status text
// const formatStatusText = (status) => {
//   if (!status) return 'Unknown';
  
//   return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
// };

// // Calculate order summary
// export const calculateOrderSummary = (cartItems) => {
//   if (!cartItems || cartItems.length === 0) {
//     return {
//       subtotal: 0,
//       shipping: 0,
//       tax: 0,
//       total: 0,
//       itemCount: 0
//     };
//   }
  
//   const subtotal = cartItems.reduce((sum, item) => {
//     return sum + (Number(item.total_price) || 0);
//   }, 0);
  
//   const shipping = 0; // Free shipping
//   const tax = 0; // No tax for now
//   const total = subtotal + shipping + tax;
//   const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
//   return {
//     subtotal,
//     shipping,
//     tax,
//     total,
//     itemCount
//   };
// };

// // Pre-fill form with user data
// export const prefillFormData = (user) => {
//   if (!user) {
//     return {
//       full_name: '',
//       phone: '',
//       email: '',
//       city: '',
//       address_line1: '',
//       address_line2: '',
//       country: 'Pakistan'
//     };
//   }
  
//   return {
//     full_name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || '',
//     phone: user.phone || '',
//     email: user.email || '',
//     city: user.city || '',
//     address_line1: user.address || '',
//     address_line2: '',
//     country: 'Pakistan'
//   };
// };

// // Handle different error types from API
// export const handleApiError = (error) => {
//   if (error.response?.status === 400) {
//     // Validation errors
//     return {
//       type: 'validation',
//       message: 'Please check your form data',
//       details: error.response.data
//     };
//   } else if (error.response?.status === 401) {
//     // Authentication error
//     return {
//       type: 'auth',
//       message: 'Please login to continue',
//       details: null
//     };
//   } else if (error.response?.status >= 500) {
//     // Server error
//     return {
//       type: 'server',
//       message: 'Server error. Please try again later.',
//       details: null
//     };
//   } else {
//     // Generic error
//     return {
//       type: 'generic',
//       message: error.message || 'Something went wrong',
//       details: error.response?.data || null
//     };
//   }
// };

// // Validate cart before checkout
// export const validateCartForCheckout = (cartItems) => {
//   if (!cartItems || cartItems.length === 0) {
//     return {
//       isValid: false,
//       message: 'Your cart is empty'
//     };
//   }

//   // Check for products that might be out of stock
//   const outOfStockItems = cartItems.filter(item => 
//     item.product?.stock !== undefined && 
//     item.product.stock < item.quantity
//   );

//   if (outOfStockItems.length > 0) {
//     return {
//       isValid: false,
//       message: `Some items in your cart are out of stock: ${outOfStockItems.map(item => item.product.name).join(', ')}`
//     };
//   }

//   // Check for unavailable products
//   const unavailableItems = cartItems.filter(item => 
//     item.product?.is_available === false
//   );

//   if (unavailableItems.length > 0) {
//     return {
//       isValid: false,
//       message: `Some items in your cart are no longer available: ${unavailableItems.map(item => item.product.name).join(', ')}`
//     };
//   }

//   return {
//     isValid: true,
//     message: 'Cart is valid for checkout'
//   };
// };

// // Generate order confirmation message
// export const generateOrderConfirmationMessage = (orderData) => {
//   if (!orderData) return '';

//   const itemCount = orderData.items?.length || 0;
//   const total = Number(orderData.total_price || orderData.total_amount || 0).toFixed(2);
  
//   return `Your order #${orderData.id} has been placed successfully! You have ordered ${itemCount} item${itemCount !== 1 ? 's' : ''} worth Rs. ${total}. The seller will contact you shortly at ${orderData.phone} to arrange delivery.`;
// };


// src/utils/checkoutUtils.js
import apiServer from './apiServer';
import API_ROUTES from '../apiRoutes';

// Validation rules
export const validateCheckoutForm = (formData) => {
  const errors = {};
  
  // Required fields
  const requiredFields = {
    full_name: 'Full name is required',
    phone: 'Phone number is required',
    email: 'Email is required',
    city: 'City is required',
    address_line1: 'Address is required'
  };
  
  // Check required fields
  Object.keys(requiredFields).forEach(field => {
    if (!formData[field] || !formData[field].toString().trim()) {
      errors[field] = requiredFields[field];
    }
  });
  
  // Email validation
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Phone validation
  if (formData.phone && !/^[+]?[\d\s\-()]+$/.test(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Format order data for API
export const formatOrderData = (formData, cartItems, cartTotal) => {
  return {
    // Personal information
    full_name: formData.full_name.trim(),
    phone: formData.phone.trim(),
    email: formData.email.trim().toLowerCase(),
    
    // Address information
    city: formData.city.trim(),
    address_line1: formData.address_line1.trim(),
    address_line2: formData.address_line2 ? formData.address_line2.trim() : '',
    country: formData.country || 'Pakistan',
    
    // Payment method (only COD for now)
    payment_method: 'COD',
    
    // Additional metadata
    order_notes: formData.order_notes || '',
    
    // Cart summary for validation
    items_count: cartItems.length,
    expected_total: cartTotal
  };
};

// Process checkout
export const processCheckout = async (formData, cartItems, cartTotal) => {
  try {
    console.log('🛒 Starting checkout process...');
    
    // Validate form data
    const validation = validateCheckoutForm(formData);
    if (!validation.isValid) {
      console.log('❌ Form validation failed:', validation.errors);
      return {
        success: false,
        errors: validation.errors,
        message: 'Please fix the form errors before proceeding'
      };
    }
    
    // Check if cart is not empty
    if (!cartItems || cartItems.length === 0) {
      console.log('❌ Cart is empty');
      return {
        success: false,
        message: 'Your cart is empty. Please add items before checkout.'
      };
    }
    
    // Format order data
    const orderData = formatOrderData(formData, cartItems, cartTotal);
    console.log('📦 Formatted order data:', orderData);
    
    // Submit order to API using apiServer
    console.log('🚀 Submitting order to API...');
    const response = await apiServer(
      'post',
      API_ROUTES.ORDERS,
      orderData,
      {
        tokenRequired: true,
        showNotification: true,
        showErrorNotification: true, // Handle errors manually
      }
    );

    console.log('📨 API Response:', response);
    console.log('✅ Order placed successfully!');
    
    return {
      success: true,
      data: response,
      message: 'Order placed successfully!',
      emailSent: response?.email_sent || false
    };
    
  } catch (error) {
    console.error('💥 Checkout process error:', error);
    
    // Handle different error types
    if (error.response?.status === 400 && error.response?.data) {
      return {
        success: false,
        message: 'Please check your form data',
        errors: error.response.data,
        data: error.response.data
      };
    }
    
    return {
      success: false,
      message: error.message || 'Something went wrong. Please try again.',
      error: error
    };
  }
};

// Format order for display
export const formatOrderForDisplay = (orderData) => {
  if (!orderData) return null;
  
  return {
    ...orderData,
    formattedDate: new Date(orderData.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    formattedTotal: `Rs. ${Number(orderData.total_price || orderData.total_amount || 0).toFixed(2)}`,
    statusColor: getStatusColor(orderData.status),
    statusText: formatStatusText(orderData.status)
  };
};

// Get status color for UI
const getStatusColor = (status) => {
  const statusColors = {
    'pending': 'text-yellow-600 bg-yellow-100',
    'confirmed': 'text-blue-600 bg-blue-100',
    'shipped': 'text-purple-600 bg-purple-100',
    'delivered': 'text-green-600 bg-green-100',
    'cancelled': 'text-red-600 bg-red-100'
  };
  
  return statusColors[status?.toLowerCase()] || 'text-gray-600 bg-gray-100';
};

// Format status text
const formatStatusText = (status) => {
  if (!status) return 'Unknown';
  
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Calculate order summary
export const calculateOrderSummary = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return {
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      itemCount: 0
    };
  }
  
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (Number(item.total_price) || 0);
  }, 0);
  
  const shipping = 0; // Free shipping
  const tax = 0; // No tax for now
  const total = subtotal + shipping + tax;
  const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  return {
    subtotal,
    shipping,
    tax,
    total,
    itemCount
  };
};

// Pre-fill form with user data
export const prefillFormData = (user) => {
  if (!user) {
    return {
      full_name: '',
      phone: '',
      email: '',
      city: '',
      address_line1: '',
      address_line2: '',
      country: 'Pakistan'
    };
  }
  
  return {
    full_name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || '',
    phone: user.phone || '',
    email: user.email || '',
    city: user.city || '',
    address_line1: user.address || '',
    address_line2: '',
    country: 'Pakistan'
  };
};

// Handle different error types from API
export const handleApiError = (error) => {
  if (error.response?.status === 400) {
    // Validation errors
    return {
      type: 'validation',
      message: 'Please check your form data',
      details: error.response.data
    };
  } else if (error.response?.status === 401) {
    // Authentication error
    return {
      type: 'auth',
      message: 'Please login to continue',
      details: null
    };
  } else if (error.response?.status >= 500) {
    // Server error
    return {
      type: 'server',
      message: 'Server error. Please try again later.',
      details: null
    };
  } else {
    // Generic error
    return {
      type: 'generic',
      message: error.message || 'Something went wrong',
      details: error.response?.data || null
    };
  }
};

// Validate cart before checkout
export const validateCartForCheckout = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return {
      isValid: false,
      message: 'Your cart is empty'
    };
  }

  // Check for products that might be out of stock
  const outOfStockItems = cartItems.filter(item => 
    item.product?.stock !== undefined && 
    item.product.stock < item.quantity
  );

  if (outOfStockItems.length > 0) {
    return {
      isValid: false,
      message: `Some items in your cart are out of stock: ${outOfStockItems.map(item => item.product.name).join(', ')}`
    };
  }

  // Check for unavailable products
  const unavailableItems = cartItems.filter(item => 
    item.product?.is_available === false
  );

  if (unavailableItems.length > 0) {
    return {
      isValid: false,
      message: `Some items in your cart are no longer available: ${unavailableItems.map(item => item.product.name).join(', ')}`
    };
  }

  return {
    isValid: true,
    message: 'Cart is valid for checkout'
  };
};

// Generate order confirmation message
export const generateOrderConfirmationMessage = (orderData) => {
  if (!orderData) return '';

  const itemCount = orderData.items?.length || 0;
  const total = Number(orderData.total_price || orderData.total_amount || 0).toFixed(2);
  
  return `Your order #${orderData.id} has been placed successfully! You have ordered ${itemCount} item${itemCount !== 1 ? 's' : ''} worth Rs. ${total}. The seller will contact you shortly at ${orderData.phone} to arrange delivery.`;
};