import React, { useState } from "react";
import { MapPin } from "lucide-react";
import useCities from "../hooks/useCities.js";
import CityCard from "../components/common/CityCard";
import { useNavigate } from 'react-router-dom';
import { slugify } from "../utils/fixRouteSpace"
import Loader from '../components/common/Loader';
import ErrorMessage from "../components/common/ErrorMessage"; // ✅ Added

const CitiesPage = () => {
  const navigate = useNavigate();
  const { cities, regions, citiesloading, citieserror } = useCities({ showLoader: true }); // ✅ Make sure your hook supports error
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const filteredCities = cities.filter(city => {
    const matchesSearch =
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = selectedRegion === 'all' || city.region.name === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleCityClick = (cityName) => {
    navigate(`${slugify(cityName)}`)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-emerald-800 to-teal-800 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop')"
          }}
        ></div>
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Explore <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">Cities</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
              Discover the magical cities of Gilgit-Baltistan, each with its own unique charm and adventures
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-12 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Region Filter */}
            <div className="flex space-x-2">
              {regions.map(region => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${selectedRegion === region
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {region === 'all' ? 'All Regions' : region}
                </button>
              ))}
            </div>

            {/* Results Count */}
            <div className="text-gray-600">
              <span className="font-semibold">{filteredCities.length}</span> cities found
            </div>
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="py-16">
        {citiesloading ? (
          <div className="flex justify-center items-center py-16">
            <Loader />
          </div>
        ) : citieserror ? ( // ✅ If API failed
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ErrorMessage message="Failed to load cities. Please try again." />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCities.map((city) => (
                <CityCard key={city.id} city={city} onClick={handleCityClick} />
              ))}
            </div>

            {/* No Results (search/filter) */}
            {filteredCities.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
              
                <MapPin className="h-16 w-16 text-emerald-500 mb-4 flex items-center justify-center mx-auto" /> 
                </div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">
      No cities found
    </h3>
    <p className="text-gray-500 text-center ">
      Try adjusting your search or filter criteria to see more results.
    </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default CitiesPage;
