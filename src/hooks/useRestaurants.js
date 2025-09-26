// src/hooks/useRestaurants.js
import { useState, useEffect } from "react";
import apiServer from "../utils/apiServer";
import API_ROUTES from "../apiRoutes";

const useRestaurants = (options = {}) => {
  const {
    search = "",
    cityId = "",
    ownerId = "",
    restaurantId = "",
    limit = null,
    showLoader = false,
    mode = "public", // ✅ new prop (public | my)
  } = options;

  const [restaurants, setRestaurants] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(showLoader);
  const [error, setError] = useState(null);

  // ✅ Random restaurants picker
  const getRandomRestaurants = (count) => {
    if (!restaurants || restaurants.length === 0) return [];
    const shuffled = [...restaurants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (showLoader) setLoading(true);
      setError(null);

      try {
        let endpoint = API_ROUTES.RESTAURANTS;

        // ✅ Select endpoint based on mode
        if (mode === "my") {
          endpoint = API_ROUTES.MY_RESTAURANTS;
        }

        // ✅ Specific restaurant detail
        if (restaurantId) {
          endpoint = `${API_ROUTES.RESTAURANTS}${restaurantId}/`;
        }

        // ✅ Build query parameters for list endpoints
        let queryParams = {};
        if (!restaurantId) {
          if (search) queryParams.search = search;
          if (cityId) queryParams.city = cityId;
          if (ownerId) queryParams.owner = ownerId;
          if (limit) queryParams.limit = limit;
        }

        console.log("🔄 Fetching restaurants with:", {
          endpoint,
          mode,
          queryParams,
          tokenRequired: mode === "my"
        });

        // ✅ API call with correct parameter structure
        const response = await apiServer(
          "get",
          endpoint,
          queryParams,
          {
            tokenRequired: mode === "my", // ✅ Fixed: pass as options object
            showNotification: false, // Don't show toast for data fetching
            showErrorNotification: true
          }
        );

        console.log("✅ API Response:", response);

        if (restaurantId) {
          setRestaurant(response.data || response);
        } else {
          // ✅ Handle different response structures
          let restaurantsData = [];
          if (Array.isArray(response)) {
            restaurantsData = response;
          } else if (response.data && Array.isArray(response.data)) {
            restaurantsData = response.data;
          } else if (response.results && Array.isArray(response.results)) {
            restaurantsData = response.results;
          } else if (response.data?.results && Array.isArray(response.data.results)) {
            restaurantsData = response.data.results;
          }

          console.log("📊 Processed restaurants data:", restaurantsData);
          setRestaurants(restaurantsData);
        }
      } catch (err) {
        console.error("❌ useRestaurants Error:", err);
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.detail || 
                           err.message || 
                           "Something went wrong while fetching restaurants.";
        setError(errorMessage);
      } finally {
        if (showLoader) setLoading(false);
      }
    };

    fetchRestaurants();
  }, [search, cityId, ownerId, restaurantId, limit, showLoader, mode]);

  return {
    restaurants,
    restaurant,
    loading,
    error,
    getRandomRestaurants,
  };
};

export default useRestaurants;