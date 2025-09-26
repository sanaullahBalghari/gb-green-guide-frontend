import React, { useState, useEffect } from "react";
import { ChevronRight, Star, MapPin, Calendar, Utensils, Camera } from "lucide-react";
import useEvents from "../hooks/useEvents";
import useEventTypes from "../hooks/useEventTypes";
import useWeather from "../hooks/useWeather";
import EventCard from "../components/common/EventCard";
import { useParams } from "react-router-dom";
import useCities from "../hooks/useCities";
import { slugify } from "../utils/fixRouteSpace";
import { useNavigate } from 'react-router-dom';
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";
import TouristPlacesTab from "../components/TouristPlacesTab";
import WeatherCard from "../components/weather/WeatherCard";
import { DetailedForecast } from "../components/weather/WeatherCard";

import useRestaurants from "../hooks/useRestaurants";
import RestaurantCard from "../components/common/RestaurantCard";
import RestaurantDetailPage from "./RestaurantDetailpage";

// City Detail Page Component
const CityDetailPage = () => {
    const navigate = useNavigate();
    const [selectedCity, setSelectedCity] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showFullWeather, setShowFullWeather] = useState(false);
    const [expandedCards, setExpandedCards] = useState({});

    // Add states for restaurant detail view
    const [showRestaurantDetail, setShowRestaurantDetail] = useState(false);
    const [selectedRestaurantForDetail, setSelectedRestaurantForDetail] = useState(null);

    const eventTypes = useEventTypes();
    const { cityName } = useParams(); // this is actually slug now
    const { cities, citiesloading } = useCities({ showLoader: true });

    //  Use slugify to match against the URL param
    const matchedCity = cities.find(
        (city) => slugify(city.name) === cityName
    );

    const cityId = matchedCity?.id;
    const { events: filteredEvents, eventloading } = useEvents({ cityId, showLoader: true });

    // Weather hook - fetch weather data for the current city
    const {
        currentWeather,
        forecast,
        loading: weatherLoading,
        error: weatherError,
        refetchWeather
    } = useWeather({
        cityName: matchedCity?.name,
        enabled: !!matchedCity?.name
    });



    useEffect(() => {
        if (matchedCity) {
            setSelectedCity(matchedCity);
        } else {
            setSelectedCity(null);
        }

         console.log("Matched city:", matchedCity);
  console.log("CityId passed to TouristPlacesTab:", matchedCity?.id);
    }, [matchedCity]);

    const toggleDescription = (eventId) => {
        setExpandedCards((prev) => ({
            ...prev,
            [eventId]: !prev[eventId],
        }));
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const {
        restaurants: cityRestaurants,
        loading: restaurantsLoading,
        error: restaurantsError
    } = useRestaurants({ cityId });

    // Updated restaurant detail handlers
    const handleViewRestaurantDetails = (restaurant) => {
        setSelectedRestaurantForDetail(restaurant);
        setShowRestaurantDetail(true);
    };

    const handleBackToRestaurantsList = () => {
        setShowRestaurantDetail(false);
        setSelectedRestaurantForDetail(null);
    };

    // Handle view forecast button click
    const handleViewForecast = () => {
        setActiveTab('weather');
    };

    if (!selectedCity) {
        return (
            <div className="flex justify-center py-16">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative h-96 overflow-hidden">
                <img
                    src={selectedCity.image}
                    alt={selectedCity.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                {/* Back Button */}
                <button
                    onClick={() => navigate('/cities')}
                    className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                >
                    <ChevronRight className="h-6 w-6 rotate-180" />
                </button>

                {/* City Info Overlay */}
                <div className="absolute bottom-8 left-8 text-white">
                    <h1 className="text-5xl font-bold mb-2">{selectedCity.name}</h1>
                    <p className="text-xl opacity-90 mb-4">{selectedCity.region?.name || "Unknown"} Region • {selectedCity.altitude}</p>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <MapPin className="h-5 w-5" />
                            <span>{selectedCity.tourist_places_count} attractions</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Navigation Tabs */}
            <section className="bg-white shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Overview', icon: MapPin },
                            { id: 'weather', label: 'Weather', icon: Calendar },
                            { id: 'events', label: 'Events', icon: Calendar },
                            { id: 'restaurants', label: 'Restaurants', icon: Utensils },
                            { id: 'places', label: 'Tourist Places', icon: Camera }
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${activeTab === id
                                    ? 'border-emerald-500 text-emerald-600'
                                    : 'border-transparent text-gray-600 hover:text-emerald-600'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl shadow-lg p-8">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-6">About {selectedCity.name}</h2>
                                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                        {selectedCity.description}. This magnificent destination offers breathtaking landscapes,
                                        rich cultural heritage, and unforgettable experiences for every type of traveler.
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                            <div className="text-2xl font-bold text-emerald-600">
                                                {currentWeather?.temperature || selectedCity.temperature}
                                            </div>
                                            <div className="text-sm text-gray-600">Current Temp</div>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">{selectedCity.altitude}</div>
                                            <div className="text-sm text-gray-600">Altitude</div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">{selectedCity.tourist_places_count}</div>
                                            <div className="text-sm text-gray-600">Attractions</div>
                                        </div>
                                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {currentWeather?.humidity || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-600">Humidity</div>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Top Highlights</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Array.isArray(selectedCity.highlights_list) ? (
                                            selectedCity.highlights_list.map((highlight, index) => (
                                                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                    <span className="font-medium text-gray-800">{highlight}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No highlights available</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Weather Card - Updated to use real weather data */}
                                <WeatherCard
                                    currentWeather={currentWeather}
                                    loading={weatherLoading}
                                    error={weatherError}
                                    onViewForecast={handleViewForecast}
                                    cityName={selectedCity.name}
                                />

                                {/* Quick Stats */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Travel Info</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Best time to visit</span>
                                            <span className="font-semibold">{selectedCity.best_time_to_visit}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Language</span>
                                            <span className="font-semibold">Urdu, Balti</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Currency</span>
                                            <span className="font-semibold">PKR</span>
                                        </div>
                                        {currentWeather && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Wind Speed</span>
                                                    <span className="font-semibold">{currentWeather.windSpeed}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Visibility</span>
                                                    <span className="font-semibold">{currentWeather.visibility}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Weather Tab - Updated to use real forecast data */}
                    {activeTab === 'weather' && (
                        <DetailedForecast
                            forecast={forecast}
                            currentWeather={currentWeather}
                            cityName={selectedCity.name}
                            loading={weatherLoading}
                            error={weatherError}
                        />
                    )}

                    {/* Events Tab */}
                    {activeTab === 'events' && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Events in {selectedCity.name}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {eventloading ? (
                                    <div className="flex justify-center py-16">
                                        <Loader />
                                    </div>
                                ) :
                                    filteredEvents.length > 0 ? (
                                        filteredEvents.map((event) => {
                                            const typeInfo = {
                                                label: event.type,
                                                color: "bg-emerald-500",
                                            };

                                            return (
                                                <EventCard
                                                    key={event.id}
                                                    event={event}
                                                    typeInfo={typeInfo}
                                                    expanded={expandedCards[event.id]}
                                                    onToggle={() => toggleDescription(event.id)}
                                                    formatDate={formatDate}
                                                />
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Calendar className="h-12 w-12 text-gray-400" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                                No Events found in {selectedCity.name}
                                            </h3>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

                    {/* Restaurants Tab - Updated to handle detail view */}
                    {activeTab === 'restaurants' && !showRestaurantDetail && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">
                                Restaurants in {selectedCity.name}
                            </h2>

                            {restaurantsLoading ? (
                                <div className="flex justify-center py-16">
                                    <Loader />
                                </div>
                            ) : restaurantsError ? (
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <ErrorMessage message={restaurantsError || "Failed to load restaurants."} />
                                </div>
                            ) : cityRestaurants.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Utensils className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                        No restaurants found in {selectedCity.name}
                                    </h3>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {cityRestaurants.map((r) => (
                                        <RestaurantCard
                                            key={r.id}
                                            restaurant={{
                                                id: r.id,
                                                name: r.name,
                                                type: r.restaurant_type,
                                                location: r.location_inside_city,
                                                status: r.is_active ? "Active" : "Not Active",
                                                roomsAvailable: r.room_available,
                                                description: r.description,
                                                images: r.image ? [r.image] : [
                                                    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop"
                                                ]
                                            }}
                                            showActions={false}
                                            onViewDetails={() => handleViewRestaurantDetails(r)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Restaurant Detail View */}
                    {activeTab === 'restaurants' && showRestaurantDetail && selectedRestaurantForDetail && (
                        <RestaurantDetailPage
                            restaurant={selectedRestaurantForDetail}
                            onBack={handleBackToRestaurantsList}
                        />
                    )}

                    {/* Tourist Places Tab */}
                    {activeTab === 'places' && (
                        <TouristPlacesTab cityId={selectedCity.id} cityName={selectedCity.name} />
                    )}

                </div>
            </section>
        </div>
    );
};

export default CityDetailPage;