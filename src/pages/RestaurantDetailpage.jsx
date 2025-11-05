import React, { useState, useEffect } from 'react';
import { ChevronLeft, Phone, Mail, Star, Clock, Wifi, Car, DollarSign,Users, Calendar, MessageCircle, Navigation, Bed, Shield, Award, MapPin } from 'lucide-react';
import { BookingForm } from '../components';
import useRestaurants from '../hooks/useRestaurants';
import Loader from '../components/common/Loader';
import ErrorMessage from "../components/common/ErrorMessage";

const RestaurantDetailPage = ({ restaurant: selectedRestaurantProp, onBack }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { restaurants, loading, error } = useRestaurants({ showLoader: true });


  // ✅ Fetch restaurant from backend if passed prop is just id or undefined
  useEffect(() => {
    if (selectedRestaurantProp?.id) {
      const found = restaurants.find(r => r.id === selectedRestaurantProp.id);
      if (found) setRestaurant(found);
      else setRestaurant(selectedRestaurantProp); // fallback
    }
  }, [selectedRestaurantProp, restaurants]);

  useEffect(() => {
    console.log('Restaurant details:', restaurant);
  }, [restaurant]);

  // Add null check before rendering
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <Loader />
        <p className="text-slate-500">Loading restaurant details...</p>
      </div>


    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ErrorMessage message="Failed to load restaurant details. Please try again." />
      </div>
    );
  }

  // Add this check to prevent the error
  if (!restaurant) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <section className="py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero section */}
          <div className="relative mb-8 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop"}
              alt={restaurant.name || "Restaurant"}
              className="w-full h-96 object-cover"
            />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-4xl font-bold mb-2">{restaurant.name || "Restaurant"}</h1>
              <div className="flex items-center gap-4">
              </div>
            </div>
          </div>

          {/* Back button */}
          <div className="bg-white/90 backdrop-blur-sm border-b px-4 py-4">
            <div className="max-w-7xl mx-auto">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Restaurants
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2 space-y-8">
              {/* About section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Restaurant</h2>
                <p className="text-slate-700 leading-relaxed mb-6">{restaurant.description || "No description available."}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contact & Hours */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact & Hours</h3>
                    <div className="space-y-3">
                      {(restaurant.contacts_and_hours || []).map((value, idx) => {
                        const contactTypes = ['phone', 'email', 'location', 'hours'];
                        const type = contactTypes[idx];
                        let Icon;
                        switch (type) {
                          case 'phone': Icon = Phone; break;
                          case 'email': Icon = Mail; break;
                          case 'location': Icon = MapPin; break;
                          case 'hours': Icon = Clock; break;
                          default: Icon = null;
                        }
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            {Icon && (
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <Icon className="w-4 h-4 text-emerald-600" />
                              </div>
                            )}
                            <span className="text-slate-700">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(restaurant.amenities || []).map((amenity, index) => (
                        <div key={index} className="bg-slate-50 rounded-lg p-3 flex items-center gap-2">
                          {amenity === 'WiFi' && <Wifi className="w-4 h-4 text-blue-500" />}
                          {amenity === 'Parking' && <Car className="w-4 h-4 text-green-500" />}
                          {amenity === 'AC' && <div className="w-4 h-4 bg-cyan-500 rounded-full" />}
                          {!['WiFi', 'Parking', 'AC'].includes(amenity) && <div className="w-4 h-4 bg-orange-500 rounded-full" />}
                          <span className="text-slate-700 text-sm font-medium">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Restaurant Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Room Status - FIXED */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl text-center border border-emerald-100">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Bed className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-lg font-bold text-emerald-600 mb-1">
                      {restaurant.room_available ? "Available" : "Not Available"}
                    </div>
                    <div className="text-sm text-slate-600">Room Status</div>
                  </div>


                   {/* Average Room Rent - NEW */}
    {restaurant.room_available && restaurant.average_room_rent && (
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl text-center border border-violet-100">
        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-2">
          {/* <span className="text-violet-600 font-bold text-sm">₨</span> */}
            <DollarSign className="w-4 h-4 text-violet-600" />
        </div>
        <div className="text-lg font-bold text-violet-600 mb-1">
          ₨{Number(restaurant.average_room_rent).toLocaleString()}
        </div>
        <div className="text-sm text-slate-600">Avg. Room Rent</div>
      </div>
    )}

                  {/* Restaurant Type */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl text-center border border-blue-100">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Award className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-lg font-bold text-purple-600 mb-1">
                      {restaurant.restaurant_type || "Unknown"}
                    </div>
                    <div className="text-sm text-slate-600">Type</div>
                  </div>

                  {/* Active Status */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl text-center border border-orange-100">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="text-lg font-bold text-orange-600 mb-1">
                      {restaurant.is_active ? "Active" : "Not Active"}
                    </div>
                    <div className="text-sm text-slate-600">Status</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar & Quick actions */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Need Help?</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Have questions about the menu, reservations, or special requests? Our friendly staff is here to help!
                </p>
                <div className="space-y-2">
                  {restaurant.whatsapp_link && (
                    <button
                      onClick={() =>
                        window.open(
                          `${restaurant.whatsapp_link}?text=Hi! I'm interested in your restaurant services.`,
                          "_blank"
                        )
                      }
                      className="group w-full relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        <MessageCircle className="w-5 h-5" />
                        <span>Chat Book Room</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
                <div className="space-y-4">
                  {restaurant.get_direction && (
                    <button
                      onClick={() => window.open(restaurant.get_direction, "_blank")}
                      className="group w-full relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        <Navigation className="w-5 h-5" />
                        <span>Get Directions</span>
                      </div>
                    </button>
                  )}

                  {/* <button
                    onClick={() => setShowBookingForm(true)}
                    className="group w-full relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                    <div className="relative flex items-center justify-center gap-3">
                      <Calendar className="w-5 h-5" />
                      <span>Book Room</span>
                    </div>
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <BookingForm
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
      />
    </div>
  );
};

export default RestaurantDetailPage;