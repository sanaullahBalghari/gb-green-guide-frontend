import { MapPin, Star, Calendar, ShoppingBag, Camera, Utensils, ChevronRight } from 'lucide-react';
import useCities from '../hooks/useCities';
import useEvents from '../hooks/useEvents';
import useRestaurants from '../hooks/useRestaurants';
import EventCard from '../components/common/EventCard';
import CityCard from "../components/common/CityCard";
import RestaurantCard from '../components/common/RestaurantCard';
import ProductSliderSection from '../components/ProductSliderSection'; // ✅ Import new slider component
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { slugify } from "../utils/fixRouteSpace"
import ErrorMessage from '../components/common/ErrorMessage';
import Loader from '../components/common/Loader';
import useProducts from '../hooks/useProducts';
import GalleryPreview from '../components/GalleryPreview';
const Home = () => {
    const navigate = useNavigate();
    const { products, loading: productsLoading, error: productsError } = useProducts({});
    const { events, eventLoading, eventsError } = useEvents({ upcomingOnly: true, limit: 4, showLoader: true });
    const { getRandomCities, citiesloading, citieserror } = useCities({ showLoader: true });
    const { getRandomRestaurants, loading: restaurantsLoading, error: restaurantsError } = useRestaurants({ showLoader: true });

    const randomCities = getRandomCities(3);
    const randomRestaurants = getRandomRestaurants(3);
    const [expandedCards, setExpandedCards] = useState({});

    const handleExploreClick = () => {
        navigate('/cities');
    };

    const upcomingEvents = events.filter(
        (event) => new Date(event.date) > new Date()
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const toggleDescription = (eventId) => {
        setExpandedCards((prev) => ({
            ...prev,
            [eventId]: !prev[eventId],
        }));
    };

  const handleRestaurantDetails = (restaurant) => {
    navigate(`/restaurants/${restaurant.id}`, { state: { restaurant } });
};

    // ✅ Product details handler for the slider
    const handleProductDetails = (product) => {
        navigate(`/products/${product.id}`);
    };

    // const galleryImages = [
    //     "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
    //     "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=300&fit=crop",
    //     "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=300&h=300&fit=crop",
    //     "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=300&h=300&fit=crop",
    // ];

    const handleCityCardClick = (cityName) => {
        navigate(`cities/${slugify(cityName)}`)
    };

    return (
        <div className="min-h-screen bg-white">

            {/* Hero Section */}
            <section className="relative h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-blue-900 overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')"
                    }}
                ></div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

                <div className="relative z-10 flex items-center justify-center h-full">
                    <div className="text-center text-white px-4 max-w-4xl">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                            Discover
                            <span className="block bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                                Gilgit-Baltistan
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
                            Experience the majestic beauty of Pakistan's northern paradise. Explore pristine valleys,
                            taste authentic local products, and create unforgettable memories.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2" onClick={() => navigate('/cities')}>
                                <span>Start Exploring</span>
                                <ChevronRight className="h-5 w-5" />
                            </button>
                            <button 
                             onClick={() => navigate('/gallery')}
                            className="border-2 border-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center space-x-2">
                                <Camera className="h-5 w-5" />
                                <span>View Gallery</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-1 h-16 bg-gradient-to-b from-white/50 to-transparent rounded-full"></div>
                </div>
            </section>

            {/* Cities Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Explore{" "}
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Cities
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Discover the breathtaking cities of Gilgit-Baltistan, each offering unique experiences and natural wonders.
                        </p>
                    </div>

                    {citiesloading ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader />
                        </div>
                    ) : citieserror ? (
                        <ErrorMessage message="Unable to load cities. Please try again." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {randomCities.map((city) => (
                                <div key={city.id} className="h-full">
                                    <CityCard city={city} onClick={handleCityCardClick} />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center pt-7">
                        <button
                            onClick={() => navigate('/cities')}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            View All Cities
                        </button>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            <section className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Upcoming{" "}
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Events
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Join us for spectacular festivals and adventures that celebrate the rich culture of Gilgit-Baltistan.
                        </p>
                    </div>

                    {eventLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader />
                        </div>
                    ) : eventsError ? (
                        <ErrorMessage message="Unable to load events. Please try again." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {upcomingEvents.map((event) => {
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
                            })}
                        </div>
                    )}

                    <div className="text-center">
                        <button
                            onClick={() => navigate('/events')}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            View All Events
                        </button>
                    </div>
                </div>
            </section>

            {/* Restaurants Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Featured{" "}
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Restaurants
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Discover authentic flavors and dining experiences from traditional Balti cuisine to modern continental dishes.
                        </p>
                    </div>

                    {restaurantsLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader />
                        </div>
                    ) : restaurantsError ? (
                        <ErrorMessage message="Unable to load restaurants. Please try again." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {randomRestaurants.map((restaurant) => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={{
                                        id: restaurant.id,
                                        name: restaurant.name,
                                        type: restaurant.restaurant_type,
                                        location: restaurant.location_inside_city,
                                        status: restaurant.is_active ? "Active" : "Not Active",
                                        room_available: restaurant.room_available,
                                        description: restaurant.description,
                                        images: restaurant.image ? [restaurant.image] : [
                                            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop"
                                        ]
                                    }}
                                    showActions={false}
                                    onViewDetails={handleRestaurantDetails}
                                />
                            ))}
                        </div>
                    )}

                    <div className="text-center">
                        <button
                            onClick={() => navigate('/restaurant')}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            View All Restaurants
                        </button>
                    </div>
                </div>
            </section>

            {/* ✅ Products Slider Section - REPLACED WITH NEW COMPONENT */}
            <ProductSliderSection onProductClick={handleProductDetails} />

            {/* Gallery Section */}
            <section className="py-10 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Explore <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Gallery</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Capture the breathtaking beauty of Gilgit-Baltistan through our curated collection of stunning photographs.
                        </p>
<GalleryPreview maxItems={12} />
                    </div>
                    {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {galleryImages.map((image, index) => (
                            <div key={index} className="group relative overflow-hidden rounded-xl aspect-square">
                                <img
                                    src={image}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <Camera className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div> */}

                    <div className="text-center">
                        <button  onClick={() => navigate('/gallery')} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto">
                            <Camera className="h-5 w-5" />
                            <span>View Full Gallery</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Explore?
                    </h2>
                    <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of travelers who have discovered the magic of Gilgit-Baltistan.
                        Start your journey today and create memories that last a lifetime.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button className="bg-white text-emerald-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2" onClick={() => navigate('/products')}>
                            <span>Find Products</span>
                            <ChevronRight className="h-5 w-5" />
                        </button>
                        <button className="border-2 border-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center space-x-2" onClick={() => navigate('/restaurant')}>
                            <Utensils className="h-5 w-5" />
                            <span>Find Restaurants</span>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;