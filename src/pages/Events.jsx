// src/pages/EventsPage.jsx
import React, { useState, useMemo } from 'react';
import { Search, Calendar, Download , MapPin} from 'lucide-react';
import useEvents from '../hooks/useEvents';
import useEventTypes from '../hooks/useEventTypes';
import EventCard from '../components/common/EventCard';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

const EventsPage = () => {
  const { events, eventLoading,eventsError } = useEvents({ showLoader: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedCards, setExpandedCards] = useState({});

 
  const eventTypes = useEventTypes();

  const filters = useMemo(() => [
    { label: 'All', value: 'All' },
    ...Object.entries(eventTypes).map(([key, value]) => ({
      label: value.label,
      value: key,
    })),
  ], [eventTypes]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        activeFilter === 'All' || event.type === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, activeFilter, events]);

  const filterCounts = useMemo(() => {
    const counts = events.reduce((acc, event) => {
      const type = event.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    counts['All'] = events.length;
    return counts;
  }, [events]);

  const toggleDescription = (eventId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

 const downloadCalendar = () => {
  let icalContent =
    'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//GB Green Guide//Events Calendar//EN\n';

  filteredEvents.forEach((event) => {
    let eventDateTime;

    try {
      if (event.date && event.time) {
        // Safe combine date and time
        const isoString = new Date(`${event.date}T${event.time}:00`).toISOString();
        eventDateTime = isoString.replace(/[-:]/g, '').split('.')[0] + 'Z';
      }
    } catch (error) {
      console.error("Invalid date/time for event:", event, error);
      return; // Skip this event
    }

    if (!eventDateTime) return; // Skip invalid

    icalContent += `BEGIN:VEVENT\n`;
    icalContent += `DTSTART:${eventDateTime}\n`;
    icalContent += `SUMMARY:${event.title || "Untitled"}\n`;
    icalContent += `DESCRIPTION:${event.description || ""}\n`;
    icalContent += `LOCATION:${event.location || ""}\n`;
    icalContent += `END:VEVENT\n`;
  });

  icalContent += 'END:VCALENDAR';

  const blob = new Blob([icalContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gb-green-guide-events.ics';
  link.click();
  URL.revokeObjectURL(url);
};


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-emerald-800 to-teal-800 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop')",
          }}
        ></div>
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Events{' '}
              <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                in Gilgit Baltistan
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              From cultural celebrations to adventure sports, explore the best
              events that celebrate Gilgit Baltistan's natural beauty and rich
              heritage.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events by name, location, or description..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-full text-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {filters.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-200 ${
                    activeFilter === value
                      ? 'bg-emerald-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  {label}
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      activeFilter === value
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {filterCounts[value] || 0}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={downloadCalendar}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              Download Calendar Events
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {eventLoading ? (
          <div className="flex justify-center py-16">
            <Loader /> 
          </div>
        ) : eventsError ?(
        <ErrorMessage message={eventsError || "Unable to load events. Please try again."} />
        ):
        
        filteredEvents.length === 0 ? (
             <div className="text-center py-16">
               
                 <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">
      No Events found
    </h3>
   
    <h3 className="text-gray-500    mb-2">
      
      Try adjusting your search or filter criteria to see more results.
    
    </h3>
   
              </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const typeInfo = eventTypes[event.type] || {
                label: event.type,
                color: 'bg-emerald-600',
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
      </div>
    </div>
  );
};

export default EventsPage;
