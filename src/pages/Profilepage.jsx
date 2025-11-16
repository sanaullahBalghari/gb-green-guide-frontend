import React, { useState, useEffect } from "react";
import { AddEditForm } from "../components";
import Loader from '../components/common/Loader';
import EditProfileForm from "../components/EditProfileForm"; // Import the new component
import {
  Mail,
  Phone,
  MapPin,
  Utensils,
  Store,
   User,
  Package,
  ShoppingBag
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import RestaurantCard from "../components/common/RestaurantCard";
import ProductCard from "../components/ProductCard";
import BuyerOrdersComponent from "../components/BuyerOrdersforTourists";
import SellerOrdersComponent from "../components/SellerOrdersComponent";
import apiServer from "../utils/apiServer";
import API_ROUTES from "../apiRoutes";

const ProfilePage = () => {
  const { user } = useAuth();
  
  console.log("Profile page user =>", user);

  const [activeTab, setActiveTab] = useState(() => {
    // Set default tab based on user role
    if (user?.role === "business_owner") {
      return "restaurants";
    } else {
      return "orders"; // For tourists, show orders first
    }
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const userData = {
    name: "",
    email: "",
    phone: "",
    location: "",
    joinDate: "",
    userType: 'tourist',
    stats: {
      restaurants: "",
      products: 12,
      reviews: 45,
      rating: 4.8
    },
  };

  useEffect(() => {
    if (user?.role === "business_owner") {
      fetchMyRestaurants();
      fetchMyProducts();
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await apiServer(
        'get',
        API_ROUTES.PROFILE,
        {},
        {
          tokenRequired: true,
          showNotification: false,
          showErrorNotification: true,
        }
      );
      console.log("Fetched profile:", response);
      setProfileData(response);
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  };

  const fetchMyRestaurants = async () => {
    try {
      setLoading(true);
      const response = await apiServer(
        'get',
        API_ROUTES.MY_RESTAURANTS,
        {},
        {
          tokenRequired: true,
          showNotification: false,
          showErrorNotification: true,
        }
      );

      console.log("Fetched my restaurants:", response);
      setRestaurants(response?.results || response || []);
    } catch (err) {
      console.error("Fetch restaurants error:", err);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await apiServer(
        'get',
        API_ROUTES.MY_PRODUCTS,
        { all: 'true' },
        {
          tokenRequired: true,
          showNotification: false,
          showErrorNotification: true,
        }
      );

      console.log("Fetched my products:", response);
      setProducts(response.results || response || []);
    } catch (err) {
      console.error("Fetch products error:", err);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      if (type === "restaurant") {
        await apiServer(
          'delete',
          `${API_ROUTES.RESTAURANTS}${id}/`,
          { all: 'true' },
          {
            tokenRequired: true,
            showNotification: true,
            showErrorNotification: true,
          }
        );

        setRestaurants(prev => prev.filter(r => r.id !== id));
      } else if (type === "product") {
        await apiServer(
          'delete',
          `${API_ROUTES.PRODUCTS}${id}/`,
          {},
          {
            tokenRequired: true,
            showNotification: true,
            showErrorNotification: true,
          }
        );

        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEdit = (type, item) => {
    setEditingItem({ type, item });
    setShowAddForm(true);
  };

  const handleAdd = (type) => {
    setEditingItem({ type, item: null });
    setShowAddForm(true);
  };

  const handleViewDetails = (item) => {
    console.log(`View details for item: ${item.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-emerald-800 to-teal-800 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop')",
          }}
        ></div>
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative -mt-10 z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-6xl md:text-6xl font-bold mb-6">
              WELCOME{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                {(profileData?.username || user?.username)?.toUpperCase()}
              </span>
            </h1>
            <p className="text-xl md:text-xl text-gray-200 max-w-2xl mx-auto">
              {user?.role === "business_owner" 
                ? "Manage your business, in one place."
                : "Track your orders and explore Gilgit-Baltistan."
              }
            </p>
          </div>
        </div>
      </section>

      {/* Profile Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 relative z-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-full flex items-center justify-center bg-emerald-500 ring-4 ring-emerald-500 ring-offset-4 ring-offset-white text-white font-bold text-5xl">
                {(profileData?.username || user?.username)?.charAt(0)?.toUpperCase()}
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {profileData?.username || user?.username}
                  </h2>
                  <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {user?.role === "business_owner" ? "Business Owner" : "Tourist"}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowEditProfile(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
                  Edit Profile
                </button>
              </div>

              <div className="sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-slate-600 mb-6">

                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <User className="h-4 w-4 text-emerald-600" />
  <span>
    {`${profileData?.first_name || user?.first_name || ''} ${profileData?.last_name || user?.last_name || ''}`}
  </span>
                </div>
                 
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  <span>{profileData?.email || user?.email}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span>{profileData?.phone || user?.phone || "N/A"}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>{profileData?.address || ""}</span>
                </div>
                {user?.role === "business_owner" && (
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <Store className="h-4 w-4 text-emerald-600" />
                    <span>{profileData?.shop_name || "N/A"}</span>
                  </div>
                )}
              </div>

              {/* Stats - Different for business owners vs tourists */}
              {user?.role === "business_owner" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl text-center border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">{restaurants.length}</div>
                    <div className="text-sm text-slate-600 font-medium">Restaurants</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl text-center border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                    <div className="text-sm text-slate-600 font-medium">Products</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl text-center border border-amber-100">
                    <div className="text-2xl font-bold text-amber-600">{profileData?.total_reviews || 0}</div>
                    <div className="text-sm text-slate-600 font-medium">Reviews</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl text-center border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">5</div>
                    <div className="text-sm text-slate-600 font-medium">Orders</div>
                  </div>
                  {/* <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl text-center border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-slate-600 font-medium">Reviews</div>
                  </div> */}
                  {/* <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl text-center border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600">8</div>
                    <div className="text-sm text-slate-600 font-medium">Wishlist</div>
                  </div> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Different for business owners vs tourists */}
  {/* Tabs - Different for business owners vs tourists */}
<section className="bg-white/90 backdrop-blur-sm border-t shadow-sm sticky top-0 z-40">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex space-x-8 overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-slate-100">
      {user?.role === "business_owner" ? (
        <>
          <button
            onClick={() => setActiveTab("restaurants")}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === "restaurants"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
            }`}
          >
            <Utensils className="h-5 w-5 flex-shrink-0" />
            <span>My Restaurants ({restaurants.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === "products"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
            }`}
          >
            <Package className="h-5 w-5 flex-shrink-0" />
            <span>My Products ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === "orders"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
            }`}
          >
            <ShoppingBag className="h-5 w-5 flex-shrink-0" />
            <span>Order Management</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === "orders"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
            }`}
          >
            <ShoppingBag className="h-5 w-5 flex-shrink-0" />
            <span>My Orders</span>
          </button>
        </>
      )}
    </div>
  </div>
</section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Business Owner Tabs */}
          {user?.role === "business_owner" && (
            <>
              {/* Restaurants Tab */}
              {activeTab === "restaurants" && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 sm:mb-0">
                      My Restaurants
                    </h2>
                    <button
                      onClick={() => handleAdd("restaurant")}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Restaurant</span>
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="mx-auto flex py-16">
                        <Loader />
                      </div>
                      <p className="text-slate-500 mt-4">Loading restaurants...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {restaurants.map((restaurant) => (
                        <RestaurantCard
                          key={restaurant.id}
                          restaurant={{
                            id: restaurant.id,
                            name: restaurant.name,
                            type: restaurant.restaurant_type,
                            location: restaurant.location_inside_city,
                            status: restaurant.is_active ? "Active" : "Not Active",
                            roomsAvailable: restaurant.room_available,
                            description: restaurant.description,
                            images: restaurant.image ? [restaurant.image] : [
                              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop"
                            ]
                          }}
                          showActions={true}
                          onEdit={() => handleEdit("restaurant", restaurant)}
                          onDelete={() => handleDelete("restaurant", restaurant.id)}
                          onViewDetails={() => handleViewDetails(restaurant)}
                        />
                      ))}
                    </div>
                  )}

                  {restaurants.length === 0 && !loading && (
                    <div className="text-center py-16">
                      <Utensils className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-600 mb-2">No restaurants yet</h3>
                      <p className="text-slate-500 mb-6">Start by adding your first restaurant</p>
                      <button
                        onClick={() => handleAdd("restaurant")}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        Add Your First Restaurant
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Products Tab */}
              {activeTab === "products" && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 sm:mb-0">My Products</h2>
                    <button
                      onClick={() => handleAdd("product")}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Product</span>
                    </button>
                  </div>

                  {productsLoading ? (
                    <div className="text-center py-12">
                      <div className="mx-auto flex py-16">
                        <Loader />
                      </div>
                      <p className="text-slate-500 mt-4">Loading products...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          showActions={true}
                          onEdit={() => handleEdit("product", product)}
                          onDelete={() => handleDelete("product", product.id)}
                          onViewDetails={() => handleViewDetails(product)}
                        />
                      ))}
                    </div>
                  )}

                  {products.length === 0 && !productsLoading && (
                    <div className="text-center py-16">
                      <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-600 mb-2">No products yet</h3>
                      <p className="text-slate-500 mb-6">Start by adding your first product</p>
                      <button
                        onClick={() => handleAdd("product")}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        Add Your First Product
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab for Business Owners */}
              {activeTab === "orders" && <SellerOrdersComponent />}
            </>
          )}

          {/* Tourist Tabs */}
          {user?.role !== "business_owner" && (
            <>
              {/* Orders Tab for Tourists */}
              {activeTab === "orders" && <BuyerOrdersComponent />}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div className="text-center py-16">
                  <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">Wishlist Feature Coming Soon</h3>
                  <p className="text-slate-500 mb-6">Save your favorite products and restaurants</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Add/Edit Form Modal - Only for business owners */}
      {showAddForm && user?.role === "business_owner" && (
        <AddEditForm
          editingItem={editingItem}
          setShowAddForm={setShowAddForm}
          restaurants={restaurants}
          setRestaurants={setRestaurants}
          products={products}
          setProducts={setProducts}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileForm
          profileData={profileData}
          setProfileData={setProfileData}
          setShowEditProfile={setShowEditProfile}
          user={user}
        />
      )}
    </div>
  );
};

export default ProfilePage;


// import React, { useState, useEffect } from "react";
// import { AddEditForm } from "../components";
// import Loader from '../components/common/Loader';
// import {
//   Mail,
//   Phone,
//   MapPin,
//   Utensils,
//   Package,
//   ShoppingBag
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import RestaurantCard from "../components/common/RestaurantCard";
// import ProductCard from "../components/ProductCard";
// import BuyerOrdersComponent from "../components/BuyerOrdersforTourists";
// import SellerOrdersComponent from "../components/SellerOrdersComponent";
// import apiServer from "../utils/apiServer";
// import API_ROUTES from "../apiRoutes";

// const ProfilePage = () => {
//   const { user } = useAuth();
  
//   console.log("Profile page user =>", user);

//   const [activeTab, setActiveTab] = useState(() => {
//     // Set default tab based on user role
//     if (user?.role === "business_owner") {
//       return "restaurants";
//     } else {
//       return "orders"; // For tourists, show orders first
//     }
//   })
  
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);

//   const [restaurants, setRestaurants] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [productsLoading, setProductsLoading] = useState(false);

//   const userData = {
//     name: "",
//     email: "ahmad.khan@gbguide.com",
//     phone: "",
//     location: "Skardu, Baltistan",
//     joinDate: "January 2024",
//     userType: 'tourist',
//     stats: {
//       restaurants: "",
//       products: 12,
//       reviews: 45,
//       rating: 4.8
//     },
//   };

//   useEffect(() => {
//     if (user?.role === "business_owner") {
//       fetchMyRestaurants();
//       fetchMyProducts();
//     }
//   }, [user]);

//   const fetchMyRestaurants = async () => {
//     try {
//       setLoading(true);
//       const response = await apiServer(
//         'get',
//         API_ROUTES.MY_RESTAURANTS,
//         {},
//         {
//           tokenRequired: true,
//           showNotification: false,
//           showErrorNotification: true,
//         }
//       );

//       console.log("Fetched my restaurants:", response);
//       setRestaurants(response?.results || response || []);
//     } catch (err) {
//       console.error("Fetch restaurants error:", err);
//       setRestaurants([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchMyProducts = async () => {
//     try {
//       setProductsLoading(true);
//       const response = await apiServer(
//         'get',
//         API_ROUTES.MY_PRODUCTS,
//         {},
//         {
//           tokenRequired: true,
//           showNotification: false,
//           showErrorNotification: true,
//         }
//       );

//       console.log("Fetched my products:", response);
//       setProducts(response.results || response || []);
//     } catch (err) {
//       console.error("Fetch products error:", err);
//       setProducts([]);
//     } finally {
//       setProductsLoading(false);
//     }
//   };

//   const handleDelete = async (type, id) => {
//     if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

//     try {
//       if (type === "restaurant") {
//         await apiServer(
//           'delete',
//           `${API_ROUTES.RESTAURANTS}${id}/`,
//           {},
//           {
//             tokenRequired: true,
//             showNotification: true,
//             showErrorNotification: true,
//           }
//         );

//         setRestaurants(prev => prev.filter(r => r.id !== id));
//       } else if (type === "product") {
//         await apiServer(
//           'delete',
//           `${API_ROUTES.PRODUCTS}${id}/`,
//           {},
//           {
//             tokenRequired: true,
//             showNotification: true,
//             showErrorNotification: true,
//           }
//         );

//         setProducts(prev => prev.filter(p => p.id !== id));
//       }
//     } catch (error) {
//       console.error("Delete failed:", error);
//     }
//   };

//   const handleEdit = (type, item) => {
//     setEditingItem({ type, item });
//     setShowAddForm(true);
//   };

//   const handleAdd = (type) => {
//     setEditingItem({ type, item: null });
//     setShowAddForm(true);
//   };

//   const handleViewDetails = (item) => {
//     console.log(`View details for item: ${item.name}`);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
//       {/* Hero Section */}
//       <section className="relative h-96 bg-gradient-to-r from-emerald-800 to-teal-800 overflow-hidden">
//         <div
//           className="absolute inset-0 bg-cover bg-center opacity-30"
//           style={{
//             backgroundImage:
//               "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop')",
//           }}
//         ></div>
//         <div className="absolute inset-0 bg-black/20"></div>

//         <div className="relative -mt-10 z-10 flex items-center justify-center h-full">
//           <div className="text-center text-white px-4 max-w-4xl">
//             <h1 className="text-6xl md:text-6xl font-bold mb-6">
//               WELCOME{" "}
//               <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
//                 {user?.username?.toUpperCase()}
//               </span>
//             </h1>
//             <p className="text-xl md:text-xl text-gray-200 max-w-2xl mx-auto">
//               {user?.role === "business_owner" 
//                 ? "Manage your business, in one place."
//                 : "Track your orders and explore Gilgit-Baltistan."
//               }
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Profile Card */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 relative z-20">
//         <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
//           <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
//             <div className="relative flex-shrink-0">
//               <div className="w-32 h-32 rounded-full flex items-center justify-center bg-emerald-500 ring-4 ring-emerald-500 ring-offset-4 ring-offset-white text-white font-bold text-5xl">
//                 {user?.username?.charAt(0)?.toUpperCase()}
//               </div>
//             </div>

//             <div className="flex-1 text-center lg:text-left">
//               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
//                 <div>
//                   <h2 className="text-3xl font-bold text-slate-900 mb-2">
//                     {user?.username}
//                   </h2>
//                   <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
//                     <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
//                       {user?.role === "business_owner" ? "Business Owner" : "Tourist"}
//                     </span>
//                   </div>
//                 </div>
//                 <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
//                   Edit Profile
//                 </button>
//               </div>

//               <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-slate-600 mb-6">
//                 <div className="flex items-center justify-center lg:justify-start space-x-2">
//                   <Mail className="h-4 w-4 text-emerald-600" />
//                   <span>{user?.email}</span>
//                 </div>
//                 <div className="flex items-center justify-center lg:justify-start space-x-2">
//                   <Phone className="h-4 w-4 text-emerald-600" />
//                   <span>{user?.phone || "N/A"}</span>
//                 </div>
//                 <div className="flex items-center justify-center lg:justify-start space-x-2">
//                   <MapPin className="h-4 w-4 text-emerald-600" />
//                   <span>Skardu, Baltistan</span>
//                 </div>
//               </div>

//               {/* Stats - Different for business owners vs tourists */}
//               {user?.role === "business_owner" ? (
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                   <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl text-center border border-emerald-100">
//                     <div className="text-2xl font-bold text-emerald-600">{restaurants.length}</div>
//                     <div className="text-sm text-slate-600 font-medium">Restaurants</div>
//                   </div>
//                   <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl text-center border border-blue-100">
//                     <div className="text-2xl font-bold text-blue-600">{products.length}</div>
//                     <div className="text-sm text-slate-600 font-medium">Products</div>
//                   </div>
//                   <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl text-center border border-amber-100">
//                     <div className="text-2xl font-bold text-amber-600">{userData.stats.rating}</div>
//                     <div className="text-sm text-slate-600 font-medium">Rating</div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                   <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl text-center border border-emerald-100">
//                     <div className="text-2xl font-bold text-emerald-600">5</div>
//                     <div className="text-sm text-slate-600 font-medium">Orders</div>
//                   </div>
//                   <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl text-center border border-blue-100">
//                     <div className="text-2xl font-bold text-blue-600">12</div>
//                     <div className="text-sm text-slate-600 font-medium">Reviews</div>
//                   </div>
//                   <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl text-center border border-purple-100">
//                     <div className="text-2xl font-bold text-purple-600">8</div>
//                     <div className="text-sm text-slate-600 font-medium">Wishlist</div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabs - Different for business owners vs tourists */}
//       <section className="bg-white/90 backdrop-blur-sm border-t shadow-sm sticky top-0 z-40">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex space-x-8">
//             {user?.role === "business_owner" ? (
//               <>
//                 <button
//                   onClick={() => setActiveTab("restaurants")}
//                   className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-all duration-200 ${
//                     activeTab === "restaurants"
//                       ? "border-emerald-500 text-emerald-600"
//                       : "border-transparent text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
//                   }`}
//                 >
//                   <Utensils className="h-5 w-5" />
//                   <span>My Restaurants ({restaurants.length})</span>
//                 </button>
//                 <button
//                   onClick={() => setActiveTab("products")}
//                   className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-all duration-200 ${
//                     activeTab === "products"
//                       ? "border-emerald-500 text-emerald-600"
//                       : "border-transparent text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
//                   }`}
//                 >
//                   <Package className="h-5 w-5" />
//                   <span>My Products ({products.length})</span>
//                 </button>
//                 <button
//                   onClick={() => setActiveTab("orders")}
//                   className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-all duration-200 ${
//                     activeTab === "orders"
//                       ? "border-emerald-500 text-emerald-600"
//                       : "border-transparent text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
//                   }`}
//                 >
//                   <ShoppingBag className="h-5 w-5" />
//                   <span>Order Management</span>
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button
//                   onClick={() => setActiveTab("orders")}
//                   className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-all duration-200 ${
//                     activeTab === "orders"
//                       ? "border-emerald-500 text-emerald-600"
//                       : "border-transparent text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
//                   }`}
//                 >
//                   <ShoppingBag className="h-5 w-5" />
//                   <span>My Orders</span>
//                 </button>
//                 <button
//                   onClick={() => setActiveTab("wishlist")}
//                   className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-all duration-200 ${
//                     activeTab === "wishlist"
//                       ? "border-emerald-500 text-emerald-600"
//                       : "border-transparent text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
//                   }`}
//                 >
//                   <Package className="h-5 w-5" />
//                   <span>Wishlist</span>
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </section>

//       <section className="py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           {/* Business Owner Tabs */}
//           {user?.role === "business_owner" && (
//             <>
//               {/* Restaurants Tab */}
//               {activeTab === "restaurants" && (
//                 <div>
//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
//                     <h2 className="text-3xl font-bold text-slate-900 mb-4 sm:mb-0">
//                       My Restaurants
//                     </h2>
//                     <button
//                       onClick={() => handleAdd("restaurant")}
//                       className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2"
//                     >
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                       </svg>
//                       <span>Add Restaurant</span>
//                     </button>
//                   </div>

//                   {loading ? (
//                     <div className="text-center py-12">
//                       <div className="mx-auto flex py-16">
//                         <Loader />
//                       </div>
//                       <p className="text-slate-500 mt-4">Loading restaurants...</p>
//                     </div>
//                   ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                       {restaurants.map((restaurant) => (
//                         <RestaurantCard
//                           key={restaurant.id}
//                           restaurant={{
//                             id: restaurant.id,
//                             name: restaurant.name,
//                             type: restaurant.restaurant_type,
//                             location: restaurant.location_inside_city,
//                             status: restaurant.is_active ? "Active" : "Not Active",
//                             roomsAvailable: restaurant.room_available,
//                             description: restaurant.description,
//                             images: restaurant.image ? [restaurant.image] : [
//                               "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop"
//                             ]
//                           }}
//                           showActions={true}
//                           onEdit={() => handleEdit("restaurant", restaurant)}
//                           onDelete={() => handleDelete("restaurant", restaurant.id)}
//                           onViewDetails={() => handleViewDetails(restaurant)}
//                         />
//                       ))}
//                     </div>
//                   )}

//                   {restaurants.length === 0 && !loading && (
//                     <div className="text-center py-16">
//                       <Utensils className="h-16 w-16 text-slate-300 mx-auto mb-4" />
//                       <h3 className="text-xl font-semibold text-slate-600 mb-2">No restaurants yet</h3>
//                       <p className="text-slate-500 mb-6">Start by adding your first restaurant</p>
//                       <button
//                         onClick={() => handleAdd("restaurant")}
//                         className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
//                       >
//                         Add Your First Restaurant
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Products Tab */}
//               {activeTab === "products" && (
//                 <div>
//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
//                     <h2 className="text-3xl font-bold text-slate-900 mb-4 sm:mb-0">My Products</h2>
//                     <button
//                       onClick={() => handleAdd("product")}
//                       className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2"
//                     >
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                       </svg>
//                       <span>Add Product</span>
//                     </button>
//                   </div>

//                   {productsLoading ? (
//                     <div className="text-center py-12">
//                       <div className="mx-auto flex py-16">
//                         <Loader />
//                       </div>
//                       <p className="text-slate-500 mt-4">Loading products...</p>
//                     </div>
//                   ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                       {products.map((product) => (
//                         <ProductCard
//                           key={product.id}
//                           product={product}
//                           showActions={true}
//                           onEdit={() => handleEdit("product", product)}
//                           onDelete={() => handleDelete("product", product.id)}
//                           onViewDetails={() => handleViewDetails(product)}
//                         />
//                       ))}
//                     </div>
//                   )}

//                   {products.length === 0 && !productsLoading && (
//                     <div className="text-center py-16">
//                       <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
//                       <h3 className="text-xl font-semibold text-slate-600 mb-2">No products yet</h3>
//                       <p className="text-slate-500 mb-6">Start by adding your first product</p>
//                       <button
//                         onClick={() => handleAdd("product")}
//                         className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
//                       >
//                         Add Your First Product
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Orders Tab for Business Owners */}
//               {activeTab === "orders" && <SellerOrdersComponent />}
//             </>
//           )}

//           {/* Tourist Tabs */}
//           {user?.role !== "business_owner" && (
//             <>
//               {/* Orders Tab for Tourists */}
//               {activeTab === "orders" && <BuyerOrdersComponent />}

//               {/* Wishlist Tab */}
//               {activeTab === "wishlist" && (
//                 <div className="text-center py-16">
//                   <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
//                   <h3 className="text-xl font-semibold text-slate-600 mb-2">Wishlist Feature Coming Soon</h3>
//                   <p className="text-slate-500 mb-6">Save your favorite products and restaurants</p>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </section>

//       {/* Add/Edit Form Modal - Only for business owners */}
//       {showAddForm && user?.role === "business_owner" && (
//         <AddEditForm
//           editingItem={editingItem}
//           setShowAddForm={setShowAddForm}
//           restaurants={restaurants}
//           setRestaurants={setRestaurants}
//           products={products}
//           setProducts={setProducts}
//         />
//       )}
//     </div>
//   );
// };

// export default ProfilePage;