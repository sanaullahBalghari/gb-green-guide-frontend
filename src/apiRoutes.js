// src/apiRoutes.js

const API_ROUTES = {
  // Authentication
  REGISTER: '/api/accounts/register/',
  LOGIN: '/api/accounts/login/',
  
  LOGOUT: "/api/accounts/logout/",
  CURRENT_USER: "/api/accounts/current-user/",

  
  
  FORGOTPASSWORD: '/api/accounts/forgot-password/',
  RESETPASSWORDCONFRIM: '/api/accounts/reset-password/', 
  
  // City & Region related endpoints
  CITIES: '/api/cities/',
  REGIONS: '/api/regions/',
  EVENTS: '/api/events/',
  TOURIST_PLACES: '/api/tourist-places/',
  
  PROFILE: '/api/accounts/profile/',
  // Restaurant endpoints
  RESTAURANTS: '/business/restaurants/', 
  MY_RESTAURANTS: '/business/restaurants/my_restaurants/',

  // Products
  PRODUCTS: '/ecommerce/products/',
  MY_PRODUCTS: '/ecommerce/products/my_products/',
  PRODUCT_CATEGORIES: '/ecommerce/categories/',

  // Cart
  CART: '/ecommerce/cart/',
  CART_ADD: '/ecommerce/cart/add/',
  CART_REMOVE: '/ecommerce/cart/remove/',
  CART_CLEAR: '/ecommerce/cart/clear/',

  // Orders - Base endpoints
  ORDERS: '/ecommerce/orders/',
  ORDER_CONFIRM: (orderId) => `/ecommerce/orders/${orderId}/confirm/`,
  MY_ORDERS: '/ecommerce/orders/my_orders/',
  SELLER_ORDERS: '/ecommerce/orders/seller_orders/',

  // Order Management - New endpoints for cancel/delete
  ORDER_CANCEL: (id) => `/ecommerce/orders/${id}/cancel/`,
  ORDER_DELETE: (id) => `/ecommerce/orders/${id}/`,
  PRODUCT_REVIEWS: (id) => `/products/${id}/reviews/`
};

export default API_ROUTES;