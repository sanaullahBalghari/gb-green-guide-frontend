// hooks/useWeather.js

import { useState, useEffect } from 'react';
import { getCompleteWeather, getCurrentWeather, getWeatherForecast } from '../utils/weatherAPI';

/**
 * Custom hook for fetching weather data
 * @param {Object} options - Configuration options
 * @param {string} options.cityName - Name of the city
 * @param {boolean} options.enabled - Whether to fetch data automatically
 * @param {boolean} options.forecastOnly - Whether to fetch only forecast data
 * @param {boolean} options.currentOnly - Whether to fetch only current weather
 * @returns {Object} - Weather data and loading states
 */
const useWeather = ({ 
  cityName, 
  enabled = true, 
  forecastOnly = false, 
  currentOnly = false 
} = {}) => {
  const [weatherData, setWeatherData] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (city) => {
    if (!city) return;

    setLoading(true);
    setError(null);

    try {
      let data;

      if (currentOnly) {
        data = await getCurrentWeather(city);
        setCurrentWeather(data.current);
      } else if (forecastOnly) {
        data = await getWeatherForecast(city);
        setForecast(data.forecast);
        setCurrentWeather(data.current);
      } else {
        // Get complete weather data (current + forecast)
        data = await getCompleteWeather(city);
        setCurrentWeather(data.current);
        setForecast(data.forecast);
      }

      setWeatherData(data);
    } catch (err) {
      setError(err.message);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetchWeather = () => {
    if (cityName) {
      fetchWeatherData(cityName);
    }
  };

  useEffect(() => {
    if (enabled && cityName) {
      fetchWeatherData(cityName);
    }
  }, [cityName, enabled, forecastOnly, currentOnly]);

  return {
    weatherData,
    currentWeather,
    forecast,
    loading,
    error,
    refetchWeather,
    fetchWeatherData
  };
};

export default useWeather;