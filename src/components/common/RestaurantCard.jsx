import React from 'react';
import {
  MapPin,
  Bed,
  Edit,
  Trash2
} from 'lucide-react';

const RestaurantCard = ({ restaurant, showActions = false, onEdit, onDelete, onViewDetails }) => {
  if (!restaurant) return null; // prevent crash if restaurant is null/undefined

  const imageSrc =
    restaurant.images && restaurant.images.length > 0
      ? restaurant.images[0]
      : "https://via.placeholder.com/400x250?text=No+Image";

  // ✅ Fix: Use the correct field name consistently
  const hasRooms = restaurant.roomsAvailable || restaurant.room_available;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <div className="relative h-56">
        <img
          src={imageSrc}
          alt={restaurant.name || "Restaurant"}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm ${restaurant.status === "Active"
              ? "bg-green-100/90 text-green-700"
              : "bg-red-100/90 text-red-700"
              }`}
          >
            {restaurant.status}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm ${hasRooms
              ? "bg-blue-100/90 text-blue-700"
              : "bg-gray-100/90 text-gray-700"
              }`}
          >
            <Bed className="w-4 h-4" />
            {hasRooms ? "Rooms Available" : "No Rooms"}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-1 hover:text-emerald-600 transition-colors cursor-pointer">
              {restaurant.name}
            </h3>
            <div className="flex items-center text-slate-600 mb-2">
              <MapPin className="w-4 h-4 mr-1 text-emerald-600" />
              <span className="text-sm">{restaurant.location}</span>
            </div>
            <span className="bg-emerald-500/90 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
              {restaurant.type}
            </span>
          </div>
        </div>

        <p className="text-slate-600 text-sm mb-4 line-clamp-1">
          {restaurant.description}
        </p>

        <div className="flex gap-2">
          {!showActions ? (
            <button
              onClick={() => onViewDetails(restaurant)}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
            >
              View Details
            </button>
          ) : (
            <>
              <button
                onClick={() => onEdit(restaurant)}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 hover:scale-105 transition-all duration-200 font-semibold"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete(restaurant.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 hover:scale-105 transition-all duration-200 font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;