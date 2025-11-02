import React from "react";
import { Calendar, ChevronRight } from "lucide-react";

const CityCard = ({ city, onClick }) => {
let cityName = city?.name?.trim()
  return (
    <div
      onClick={() => onClick(cityName)}
      className="group bg-white  rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col"
      style={{ height: "100%" }} // Ensure full stretch
    >
      {/* City Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={city.image}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* City Name Overlay */}
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-2xl font-bold mb-1">{city.name}</h3>
          <p className="text-sm opacity-90">{city.region?.name || "No Region"}</p>
        </div>
      </div>

      {/* City Info */}
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-gray-600 mb-4 line-clamp-2">{city.description}</p>
  
        <div className="grid grid-cols-2 gap-4 mb-4">  
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">{city.tourist_places_count || 0}</div>
            <div className="text-sm text-gray-600">Attractions</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-emerald-600">{city.altitude || "—"}</div>
            <div className="text-sm text-gray-600">Altitude</div>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-4">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm">Best time: {city.best_time_to_visit || "—"}</span>
        </div>

        {/* Highlights */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {Array.isArray(city.highlights_list) &&
              city.highlights_list.slice(0, 2).map((h, i) => (
                <span
                  key={i}
                  className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full"
                >
                  {h}
                </span>
              ))}

            {Array.isArray(city.highlights_list) && city.highlights_list.length > 2 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{city.highlights_list.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Push Explore Button to bottom */}
        <div className="mt-auto">
          <button 
          className="w-full bg-gradient-to-r cursor-pointer  from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 group-hover:from-emerald-700 group-hover:to-teal-700"
          >
            <span>Explore {city.name}</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityCard;
