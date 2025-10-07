import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import RestaurantDetailPage from '../pages/RestaurantDetailpage';

/**
 * ✅ Wrapper component to handle restaurant detail routing
 * This ensures restaurant data is passed correctly from both:
 * 1. Direct navigation from restaurant list (has full data)
 * 2. Direct URL access or page refresh (needs to fetch data)
 */
const RestaurantRouteWrapper = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get restaurant data from navigation state if available
  const restaurantFromState = location.state?.restaurant;

  // Create restaurant object - either from state or just ID for fetching
  const restaurant = restaurantFromState || { id };

  const handleBack = () => {
    // If we came from a specific location, go back
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      // Otherwise go to restaurant list
      navigate('/restaurant');
    }
  };

  return (
    <RestaurantDetailPage 
      restaurant={restaurant} 
      onBack={handleBack}
    />
  );
};

export default RestaurantRouteWrapper;