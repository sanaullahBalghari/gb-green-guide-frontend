import React, { useState, useEffect } from 'react';

import RestaurantCard from '../components/common/RestaurantCard';
import RestaurantDetailPage from './RestaurantDetailpage';
import useRestaurants from '../hooks/useRestaurants.js';  // ✅ custom hook import
import Loader from '../components/common/Loader';
import ErrorMessage from "../components/common/ErrorMessage";

const RestaurantListPage = ({ isOwnerProfile = false }) => {
  // ✅ Fixed: Pass mode based on isOwnerProfile prop
  const { restaurants, loading, error } = useRestaurants({ 
    showLoader: true,
    mode: isOwnerProfile ? "my" : "public" // ✅ Added mode parameter
  });

  const [currentView, setCurrentView] = useState('list');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);

  // ✅ Debug logging
  useEffect(() => {
    console.log("🏪 RestaurantListPage State:", {
      restaurants: restaurants?.length || 0,
      loading,
      error,
      isOwnerProfile,
      mode: isOwnerProfile ? "my" : "public"
    });
  }, [restaurants, loading, error, isOwnerProfile]);

  // ✅ jab bhi restaurants ya searchTerm change ho
  useEffect(() => {
    if (restaurants?.length > 0) {
      const filtered = restaurants.filter(restaurant =>
        restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.location_inside_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.restaurant_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRestaurants(filtered);
      console.log("🔍 Filtered restaurants:", filtered.length);
    } else {
      setFilteredRestaurants([]);
    }
  }, [restaurants, searchTerm]);

  const handleViewDetails = (restaurant) => {
    console.log("👀 Viewing restaurant details:", restaurant);
    setSelectedRestaurant(restaurant);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedRestaurant(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {currentView === 'list' && (
        <section className="relative min-h-[70vh] flex items-center justify-center py-20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=800&fit=crop')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/70 via-emerald-800/60 to-slate-900/80"></div>
          </div>

          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {isOwnerProfile ? "My" : ""} Restaurants in <span className="text-emerald-300">Gilgit Baltistan</span>
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90 leading-relaxed">
              {isOwnerProfile 
                ? "Manage your restaurant listings and bookings with ease."
                : "Discover authentic flavors and dining experiences from traditional Balti cuisine to modern continental dishes, all set against the breathtaking backdrop of the world's most beautiful mountains."
              }
            </p>
          </div>
        </section>
      )}

      {currentView === 'list' ? (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isOwnerProfile ? "My Restaurants" : "Featured Restaurants"}
            </h2>
            <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-8">
              
              {/* ✅ Status/Count Display */}
              <div className="flex items-center">
               
                  <p className="text-slate-600">
                    {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
                  </p>
                
              </div>

              {/* ✅ Search Input */}
              <div className="relative max-w-md w-full">
                <input
                  type="text"
                  placeholder="Search restaurants, location, or cuisine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* ✅ Content Display Logic */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center mx-auto">
                <Loader />
                <p className="text-slate-500">Loading restaurants...</p>
              </div>
            ) : error ? (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <ErrorMessage message={`Failed to load restaurants. ${error}`} />
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏪</div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  {searchTerm ? "No restaurants found" : "No restaurants available"}
                </h3>
                <p className="text-slate-500">
                  {searchTerm 
                    ? `No restaurants match "${searchTerm}". Try different keywords.`
                    : isOwnerProfile 
                      ? "You haven't added any restaurants yet."
                      : "Check back later for new listings."
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              /* ✅ Restaurant Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={{
                      id: restaurant.id,
                      name: restaurant.name,
                      type: restaurant.restaurant_type,
                      location: restaurant.location_inside_city,
                      status: restaurant.is_active ? "Active" : "Not Active",
                      room_available: restaurant.room_available,
                      roomsAvailable: restaurant.room_available, // ✅ Add both for consistency
                      description: restaurant.description,
                      images: restaurant.image ? [restaurant.image] : [
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop"
                      ]
                    }}
                    showActions={isOwnerProfile}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <RestaurantDetailPage
          restaurant={selectedRestaurant}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

export default RestaurantListPage;