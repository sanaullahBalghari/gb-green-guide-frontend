import { MapPin, Star, Calendar, ShoppingBag, Camera, Utensils, ChevronRight } from 'lucide-react';
import useCities from '../hooks/useCities';
import useEvents from '../hooks/useEvents';
import useRestaurants from '../hooks/useRestaurants';
import EventCard from '../components/common/EventCard';
import CityCard from "../components/common/CityCard";
import RestaurantCard from '../components/common/RestaurantCard';
import ProductSliderSection from '../components/ProductSliderSection';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
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

    // Hero Section Image Slideshow State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Curated images for hero section
    const heroImages = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&sat=-20',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80'
    ];

    // Auto-change images every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, []);

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
        navigate(`/restaurants/${restaurant.id}`);
    };

    const handleProductDetails = (product) => {
        navigate(`/products/${product.id}`);
    };

    const handleCityCardClick = (cityName) => {
        navigate(`cities/${slugify(cityName)}`)
    };

    return (
        <div className="min-h-screen bg-white">

            {/* Enhanced Hero Section with Image Slideshow */}
            <section className="relative h-screen overflow-hidden">
                {/* Image Slideshow Background */}
                <div className="absolute inset-0">
                    {heroImages.map((image, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
                                index === currentImageIndex 
                                    ? 'opacity-100 scale-100' 
                                    : 'opacity-0 scale-105'
                            }`}
                            style={{ backgroundImage: `url('${image}')` }}
                        />
                    ))}
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-teal-800/70 to-blue-900/80"></div>

                {/* Animated Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                {/* Floating Orbs */}
                <div className="absolute top-1/4 left-10 w-24 h-24 md:w-40 md:h-40 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/3 right-20 w-32 h-32 md:w-52 md:h-52 bg-blue-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/4 left-1/4 w-28 h-28 md:w-44 md:h-44 bg-teal-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

                {/* Content Container */}
                <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-white max-w-5xl w-full">
                        {/* Main Heading */}
                        <div className="mb-6 space-y-2">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight">
                                <span className="block bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent animate-pulse">
                                    Discover
                                </span>
                                <span className="block mt-2 bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                                    Gilgit-Baltistan
                                </span>
                            </h1>
                        </div>

                        {/* Description */}
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 md:mb-12 text-gray-100 max-w-3xl mx-auto leading-relaxed font-light px-4">
                            Experience the majestic beauty of Pakistan's northern paradise. Explore pristine valleys,
                            taste authentic local products, and create unforgettable memories.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                            <button 
                                className="group relative w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white px-8 py-4 rounded-full text-base md:text-lg font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-105"
                                onClick={() => navigate('/cities')}
                            >
                                <span className="relative z-10 flex items-center justify-center space-x-2">
                                    <span>Start Exploring</span>
                                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                            
                            <button 
                                onClick={() => navigate('/gallery')}
                                className="group w-full sm:w-auto backdrop-blur-md bg-white/10 border-2 border-white/30 text-white px-8 py-4 rounded-full text-base md:text-lg font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105"
                            >
                                <span className="flex items-center justify-center space-x-2">
                                    <Camera className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    <span>View Gallery</span>
                                </span>
                            </button>
                        </div>

                        {/* Image Progress Indicators */}
                        <div className="flex justify-center mt-10 md:mt-16 space-x-2">
                            {heroImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`h-1 rounded-full transition-all duration-300 ${
                                        index === currentImageIndex 
                                            ? 'w-12 bg-white' 
                                            : 'w-6 bg-white/40 hover:bg-white/60'
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="flex flex-col items-center space-y-2">
                        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
                            <div className="w-1 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-white/70 text-xs uppercase tracking-wider">Scroll</span>
                    </div>
                </div>
            </section>

            {/* Cities Section */}
            <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-100 rounded-full blur-3xl opacity-20"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-block mb-4">
                            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider bg-emerald-50 px-4 py-2 rounded-full">
                                Popular Destinations
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                            Explore{" "}
                            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                                Cities
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
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

            {/* Products Slider Section */}
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

                    <div className="text-center">
                        <button onClick={() => navigate('/gallery')} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto">
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