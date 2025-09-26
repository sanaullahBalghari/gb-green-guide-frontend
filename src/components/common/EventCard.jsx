// src/components/common/EventCard.jsx
import React from 'react';
import { Calendar, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const EventCard = ({
  event,
  typeInfo,
  expanded,
  onToggle,
  formatDate,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
        />
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white ${typeInfo.color}`}
        >
          {typeInfo.label}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
            <span>
              {formatDate(event.date)} • {event.time}
            </span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
            <span>{event.location}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {expanded
              ? event.description
              : event.description?.slice(0, 100) +
                (event.description?.length > 100 ? '...' : '')}
          </p>
          {event.description?.length > 100 && (
            <button
              onClick={onToggle}
              className="mt-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              {expanded ? (
                <>
                  Show Less <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Read More <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
