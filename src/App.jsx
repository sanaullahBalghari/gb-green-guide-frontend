// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import RestaurantRouteWrapper from "./components/RestaurantRouteWrapper";
// Import all pages
import {
  Home,
  Login,
  Signup,
  ForgotPassword,
  ResetPassword,
  CitiesPage,
  CityDetailPage,
  ProfilePage,
  EventsPage,
  Torsitprofile,
  RestaurantListPage,
  // RestaurantDetailPage,
  ProductListPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage
} from './pages';

// Import new password reset components
import Gallery from "./components/Gallery";

import { Footer, Header } from './components';
import ChatbotPage from "./pages/ChatbotPage";
import ChatbotWidget from "./components/ChatbotWidget";




const AppWrapper = () => {
  const location = useLocation();

  // Routes where header and footer should be hidden
  const hideLayoutPaths = ['/login', '/signup', '/reset-password', '/forgot-password'];
  const shouldHideLayout = hideLayoutPaths.some((path) => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" />

      {!shouldHideLayout && <Header />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Password Reset Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        
        {/* Other Public Routes */}
        <Route path="/cities" element={<CitiesPage />} />
        <Route path="/cities/:cityName" element={<CityDetailPage />} />
        <Route path="/toursit-profile" element={<Torsitprofile />} />
        <Route path="/restaurant" element={<RestaurantListPage />} />
        {/* <Route path="/restaurants/:id" element={<RestaurantDetailPage />} /> */}
        <Route path="/restaurants/:id" element={<RestaurantRouteWrapper />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/chatbot" element={<ChatbotPage />} />

        {/* Protected Routes */}
        <Route path="/profile" element={<AuthLayout><ProfilePage /></AuthLayout>} />
        <Route path="/cart" element={<AuthLayout><CartPage /></AuthLayout>} />
        <Route path="/checkout" element={<AuthLayout><CheckoutPage /></AuthLayout>} />
      </Routes>
       <ChatbotWidget />

      {!shouldHideLayout && <Footer />}
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <CartProvider>
        <AppWrapper />
      </CartProvider>
    </Router>
  </AuthProvider>
);

export default App;

// import { useEffect, useState } from "react";
// import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import AuthLayout from "./layouts/AuthLayout";
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider } from "./context/AuthContext";
// import { CartProvider } from "./context/CartContext";
// import {
//   Home,
//   Login,
//   Signup,
//   CitiesPage,
//   CityDetailPage,
//   ProfilePage,
//   ForgotPassword,
//   ResetPasswordPage,
//   EventsPage,
//   Torsitprofile,
//   RestaurantListPage,
//   RestaurantDetailPage,
//   ProductListPage,
//   ProductDetailPage,
//   CartPage,
//   CheckoutPage

// } from './pages';

// import { Footer, Header } from './components';

// const AppWrapper = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [selectedCity, setSelectedCity] = useState(null);
//   const [resetUid, setResetUid] = useState(null);
//   const [resetToken, setResetToken] = useState(null);

//   // ✅ Detect reset-password route and extract uid/token
//   useEffect(() => {
//     const match = location.pathname.match(/\/reset-password\/([^/]+)\/([^/]+)/);
//     if (match) {
//       setResetUid(match[1]);
//       setResetToken(match[2]);
//     }
//   }, [location.pathname]);

//   // ✅ Don't show header/footer on login/signup/reset routes
//   const hideLayoutPaths = ['/login', '/signup', '/reset-password', '/forgot-password'];
//   const shouldHideLayout = hideLayoutPaths.some((path) => location.pathname.startsWith(path));

//   return (
//     <div className="min-h-screen">


//       <Toaster position="top-center" />

//       {!shouldHideLayout && <Header />}

//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage uid={resetUid} token={resetToken} />} />
//         <Route path="/cities/:cityName" element={<CityDetailPage />} />
//         <Route path="/toursit-profile" element={<Torsitprofile />} />
//         <Route path="/restaurant" element={<RestaurantListPage />} />
//         <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
//         <Route path="/products" element={<ProductListPage />} />
//         <Route path="/products/:id" element={<ProductDetailPage />} />

//         <Route path="/events" element={ <EventsPage />} />

//         <Route path="/profile" element={ <ProfilePage />} />
//         <Route path="/cities" element={ <CitiesPage />} />


//         {/* Protected Routes */}
//         <Route path="/checkout" element={<AuthLayout><CheckoutPage /> </AuthLayout> } />

//         <Route path="/cart" element={ <AuthLayout> <CartPage /> </AuthLayout>} />
   



//       </Routes>

//       {!shouldHideLayout && <Footer />}
//     </div>
//   );
// };

// const App = () => (
//   <AuthProvider>
//       <Router>
//     <CartProvider>
//         <AppWrapper />
//     </CartProvider>
//       </Router>
//   </AuthProvider>

// );

// export default App;
