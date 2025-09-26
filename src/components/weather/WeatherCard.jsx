// components/weather/WeatherCard.js

import React from 'react';
import { Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import Loader from '../common/Loader';
const WeatherCard = ({ 
  currentWeather, 
  loading, 
  error, 
  onViewForecast, 
  cityName,
  showForecastButton = true 
}) => {
  if (loading) {
    return (
      
      <div className="bg-white rounded-2xl shadow-lg p-6">
       
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="h-16 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Current Weather</h3>
        <div className="text-center text-red-500">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentWeather) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Current Weather</h3>
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🌤️</div>
          <p className="text-sm">No weather data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Current Weather</h3>
      
      {/* Main Weather Display */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{currentWeather.icon}</div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {currentWeather.temperature}
        </div>
        <div className="text-gray-600 mb-2">{currentWeather.condition}</div>
        <div className="text-sm text-gray-500">
          Feels like {currentWeather.feelsLike}
        </div>
      </div>

      {/* Weather Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Droplets className="h-4 w-4" />
            <span>Humidity</span>
          </div>
          <span className="font-semibold">{currentWeather.humidity}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Wind className="h-4 w-4" />
            <span>Wind</span>
          </div>
          <span className="font-semibold">{currentWeather.windSpeed}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Eye className="h-4 w-4" />
            <span>Visibility</span>
          </div>
          <span className="font-semibold">{currentWeather.visibility}</span>
        </div>
      </div>

      {/* View Forecast Button */}
      {showForecastButton && onViewForecast && (
        <button
          onClick={onViewForecast}
          className="w-full text-emerald-600 hover:text-emerald-700 font-semibold text-center py-2 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          View 3-day forecast →
        </button>
      )}
      
      {/* Last Updated */}
      <div className="text-xs text-gray-400 text-center mt-2">
        Last updated: {new Date(currentWeather.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
};

// components/weather/ForecastCard.js

export const ForecastCard = ({ day, isToday = false }) => {
  return (
    <div className={`rounded-xl p-4 text-center transition-all hover:scale-105 ${
      isToday 
        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
        : 'bg-gray-50 hover:bg-gray-100'
    }`}>
      <div className={`font-semibold mb-2 ${isToday ? 'text-white' : 'text-gray-900'}`}>
        {isToday ? 'Today' : day.dayName}
      </div>
      <div className="text-3xl mb-2">{day.icon}</div>
      <div className={`font-bold mb-1 ${isToday ? 'text-white' : 'text-gray-900'}`}>
        <div className="text-lg">{day.maxTemp}</div>
        <div className={`text-sm ${isToday ? 'text-emerald-100' : 'text-gray-500'}`}>
          {day.minTemp}
        </div>
      </div>
      <div className={`text-xs ${isToday ? 'text-emerald-100' : 'text-gray-600'}`}>
        {day.condition}
      </div>
      
      {/* Additional details */}
      <div className={`text-xs mt-2 space-y-1 ${isToday ? 'text-emerald-100' : 'text-gray-500'}`}>
        {day.chanceOfRain !== '0%' && (
          <div>🌧️ {day.chanceOfRain}</div>
        )}
        {day.chanceOfSnow !== '0%' && (
          <div>❄️ {day.chanceOfSnow}</div>
        )}
      </div>
    </div>
  );
};

// components/weather/DetailedForecast.js

export const DetailedForecast = ({ 
  forecast, 
  currentWeather, 
  cityName, 
  loading, 
  error 
}) => {
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-red-500">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Weather Data Unavailable</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Weather Forecast</h2>

        {/* Current Weather Highlight */}
        {currentWeather && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Now in {cityName}</h3>
                <p className="opacity-90">Current conditions</p>
              </div>
              <div className="text-center">
                <div className="text-6xl mb-2">{currentWeather.icon}</div>
                <div className="text-4xl font-bold">{currentWeather.temperature}</div>
              </div>
              <div className="text-center md:text-right space-y-1">
                <div className="text-lg font-semibold">{currentWeather.condition}</div>
                <div className="opacity-90">Feels like {currentWeather.feelsLike}</div>
                <div className="opacity-90">Humidity: {currentWeather.humidity}</div>
                <div className="opacity-90">Wind: {currentWeather.windSpeed}</div>
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}

        
        {forecast && forecast.length > 0 && (

          
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-6">3-Day Forecast</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {forecast.map((day, index) => (


                <ForecastCard 
                  key={day.date} 
                  day={day}
                  isToday={day.date === todayDate}
                />
              ))}
            </div>
            
            {/* Detailed Daily Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Detailed Breakdown</h3>
              {forecast.map((day) => (
                <div key={day.date} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-4 mb-2 md:mb-0">
                      <div className="text-2xl">{day.icon}</div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {day.date === todayDate ? 'Today' : day.fullDate}
                        </div>
                        <div className="text-sm text-gray-600">{day.condition}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-gray-600">High/Low</div>
                        <div className="font-semibold">{day.maxTemp} / {day.minTemp}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Humidity</div>
                        <div className="font-semibold">{day.humidity}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Wind</div>
                        <div className="font-semibold">{day.windSpeed}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Rain Chance</div>
                        <div className="font-semibold">{day.chanceOfRain}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherCard;