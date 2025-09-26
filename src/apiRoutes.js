// src/apiRoutes.js

const API_ROUTES = {
  // Authentication
  REGISTER: '/api/accounts/register/',
  LOGIN: '/api/accounts/login/',
  LOGOUT: "/api/accounts/logout/",
  CURRENT_USER: "/api/accounts/current-user/",
  
  FORGOTPASSWORD: '/api/accounts/forgot-password/',
  RESETPASSWORDCONFRIM: '/api/accounts/reset-password/', 
  
  PROFILE: '/api/accounts/profile/',

  // City & Region related endpoints
  CITIES: '/api/core/cities/',
  REGIONS: '/api/core/regions/',
  EVENTS: '/api/core/events/',
  TOURIST_PLACES: '/api/core/tourist-places/',

  // Restaurant endpoints
  RESTAURANTS: '/api/business/restaurants/', 
  MY_RESTAURANTS: '/api/business/restaurants/my_restaurants/',

  // Products
  PRODUCTS: '/api/ecommerce/products/',
  MY_PRODUCTS: '/api/ecommerce/products/my_products/',
  PRODUCT_CATEGORIES: '/api/ecommerce/categories/',

  // Cart
  CART: '/api/ecommerce/cart/',
  CART_ADD: '/api/ecommerce/cart/add/',
  CART_REMOVE: '/api/ecommerce/cart/remove/',
  CART_CLEAR: '/api/ecommerce/cart/clear/',

   // Orders - Base endpoints
  ORDERS: '/api/ecommerce/orders/',
  ORDER_CONFIRM: (orderId) => `/api/ecommerce/orders/${orderId}/confirm/`,
  MY_ORDERS: '/api/ecommerce/orders/my_orders/',
  SELLER_ORDERS: '/api/ecommerce/orders/seller_orders/',

  // Order Management - cancel/delete
  ORDER_CANCEL: (id) => `/api/ecommerce/orders/${id}/cancel/`,
  ORDER_DELETE: (id) => `/api/ecommerce/orders/${id}/`,

  // Product Reviews
  PRODUCT_REVIEWS: (id) => `/api/ecommerce/products/${id}/reviews/`

};

export default API_ROUTES;
