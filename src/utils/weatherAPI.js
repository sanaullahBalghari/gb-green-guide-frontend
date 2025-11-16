// utils/weatherAPI.js

const WEATHER_API_KEY = 'e29fe44e9b114d0dbac111046251204';
const WEATHER_BASE_URL = 'https://api.weatherapi.com/v1';

// Simple city name mapping - add more as needed
const CITY_WEATHER_MAPPING = {
  'khaplu': ['Khapalu', 'ganche'],
  'gilgit': ['gilgit city'],
  'hunza': ['hunza','karimabad', 'hunza valley'],
  'skardu': ['skardhoo','skardu', 'skardu city'],
  'gailgit': ['gilgit'],  // Common misspelling
  'diamir': ['chilas'],   // District to main city
  'Ghizer': ['chilas','Chilas'],   // District to main city
  'Astore': ['hunza','Chilas'],   // District to main city
  'ghanche': ['khapalu', 'ganche'],
  // Add more mappings here as needed
};

/**
 * Try weather API with city name and its alternatives
 * @param {string} cityName - Original city name
 * @returns {Promise<Object>} - API response
 */
const tryWeatherAPI = async (cityName, endpoint = 'current.json', params = {}) => {
  const alternatives = CITY_WEATHER_MAPPING[cityName.toLowerCase()] || [];
  const allVariants = [cityName, ...alternatives];
  
  console.log(`Trying weather API for "${cityName}" with variants:`, allVariants);
  
  let lastError;
  
  for (const variant of allVariants) {
    try {
      console.log(`Attempting weather API call for: ${variant}`);
      
      const queryParams = new URLSearchParams({
        key: WEATHER_API_KEY,
        q: variant,
        ...params
      });
      
      const response = await fetch(`${WEATHER_BASE_URL}/${endpoint}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Weather API successful for: ${variant} (original: ${cityName})`);
      return data;
      
    } catch (error) {
      console.log(`❌ Failed for ${variant}:`, error.message);
      lastError = error;
    }
  }
  
  // If all variants fail, throw detailed error
  throw new Error(
    `Weather data not available for '${cityName}'. Tried variants: ${allVariants.join(', ')}. Last error: ${lastError.message}`
  );
};

/**
 * Get weather icon based on condition code
 * @param {number} code - Weather condition code from API
 * @param {number} isDay - Whether it's day (1) or night (0)
 * @returns {string} - Emoji representation of weather
 */
export const getWeatherIcon = (code, isDay = 1) => {
  const weatherIcons = {
    1000: isDay ? '☀️' : '🌙', // Sunny/Clear
    1003: '🌤️', // Partly cloudy
    1006: '☁️', // Cloudy
    1009: '☁️', // Overcast
    1030: '🌫️', // Mist
    1063: '🌦️', // Patchy rain possible
    1066: '🌨️', // Patchy snow possible
    1069: '🌨️', // Patchy sleet possible
    1072: '🌨️', // Patchy freezing drizzle possible
    1087: '⛈️', // Thundery outbreaks possible
    1114: '❄️', // Blowing snow
    1117: '❄️', // Blizzard
    1135: '🌫️', // Fog
    1147: '🌫️', // Freezing fog
    1150: '🌦️', // Patchy light drizzle
    1153: '🌦️', // Light drizzle
    1168: '🌨️', // Freezing drizzle
    1171: '🌨️', // Heavy freezing drizzle
    1180: '🌦️', // Patchy light rain
    1183: '🌧️', // Light rain
    1186: '🌦️', // Moderate rain at times
    1189: '🌧️', // Moderate rain
    1192: '🌧️', // Heavy rain at times
    1195: '🌧️', // Heavy rain
    1198: '🌨️', // Light freezing rain
    1201: '🌨️', // Moderate or heavy freezing rain
    1204: '🌨️', // Light sleet
    1207: '🌨️', // Moderate or heavy sleet
    1210: '❄️', // Patchy light snow
    1213: '❄️', // Light snow
    1216: '❄️', // Patchy moderate snow
    1219: '❄️', // Moderate snow
    1222: '❄️', // Patchy heavy snow
    1225: '❄️', // Heavy snow
    1237: '🧊', // Ice pellets
    1240: '🌦️', // Light rain shower
    1243: '🌧️', // Moderate or heavy rain shower
    1246: '🌧️', // Torrential rain shower
    1249: '🌨️', // Light sleet showers
    1252: '🌨️', // Moderate or heavy sleet showers
    1255: '❄️', // Light snow showers
    1258: '❄️', // Moderate or heavy snow showers
    1261: '🧊', // Light showers of ice pellets
    1264: '🧊', // Moderate or heavy showers of ice pellets
    1273: '⛈️', // Patchy light rain with thunder
    1276: '⛈️', // Moderate or heavy rain with thunder
    1279: '⛈️', // Patchy light snow with thunder
    1282: '⛈️', // Moderate or heavy snow with thunder
  };
  
  return weatherIcons[code] || '🌤️';
};

/**
 * Format weather data from API response
 * @param {Object} data - Raw API response
 * @returns {Object} - Formatted weather data
 */
const formatWeatherData = (data) => {
  const current = data.current;
  const location = data.location;
  
  return {
    current: {
      temperature: `${Math.round(current.temp_c)}°C`,
      condition: current.condition.text,
      icon: getWeatherIcon(current.condition.code, current.is_day),
      feelsLike: `${Math.round(current.feelslike_c)}°C`,
      humidity: `${current.humidity}%`,
      windSpeed: `${Math.round(current.wind_kph)} km/h`,
      windDirection: current.wind_dir,
      pressure: `${current.pressure_mb} mb`,
      visibility: `${current.vis_km} km`,
      uvIndex: current.uv,
      lastUpdated: current.last_updated,
    },
    location: {
      name: location.name,
      region: location.region,
      country: location.country,
      localTime: location.localtime,
    }
  };
};

/**
 * Format forecast data from API response
 * @param {Object} data - Raw API response
 * @returns {Array} - Array of formatted forecast days
 */
const formatForecastData = (data) => {
  console.log('Raw forecast data from API:', data.forecast.forecastday);
  console.log('Number of days received:', data.forecast.forecastday.length);
  
  return data.forecast.forecastday.map(day => {
    const dayData = day.day;
    const date = new Date(day.date);
    
    return {
      date: day.date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      maxTemp: `${Math.round(dayData.maxtemp_c)}°C`,
      minTemp: `${Math.round(dayData.mintemp_c)}°C`,
      avgTemp: `${Math.round(dayData.avgtemp_c)}°C`,
      condition: dayData.condition.text,
      icon: getWeatherIcon(dayData.condition.code, 1),
      chanceOfRain: `${dayData.daily_chance_of_rain}%`,
      chanceOfSnow: `${dayData.daily_chance_of_snow}%`,
      humidity: `${dayData.avghumidity}%`,
      windSpeed: `${Math.round(dayData.maxwind_kph)} km/h`,
      uvIndex: dayData.uv,
    };
  });
};

/**
 * Fetch current weather for a city
 * @param {string} cityName - Name of the city
 * @returns {Promise<Object>} - Current weather data
 */
export const getCurrentWeather = async (cityName) => {
  try {
    const data = await tryWeatherAPI(cityName, 'current.json', { aqi: 'no' });
    return formatWeatherData(data);
  } catch (error) {
    console.error(`Error fetching current weather for ${cityName}:`, error);
    throw error;
  }
};

/**
 * Fetch 3-day weather forecast for a city
 * @param {string} cityName - Name of the city
 * @param {number} days - Number of days to forecast (default: 3)
 * @returns {Promise<Object>} - Weather forecast data
 */
export const getWeatherForecast = async (cityName, days = 3) => {
  try {
    const data = await tryWeatherAPI(cityName, 'forecast.json', { 
      days, 
      aqi: 'no', 
      alerts: 'no' 
    });
    
    return {
      current: formatWeatherData(data).current,
      location: formatWeatherData(data).location,
      forecast: formatForecastData(data)
    };
  } catch (error) {
    console.error(`Error fetching weather forecast for ${cityName}:`, error);
    throw error;
  }
};

/**
 * Get complete weather data (current + forecast) for a city
 * @param {string} cityName - Name of the city
 * @returns {Promise<Object>} - Complete weather data
 */
export const getCompleteWeather = async (cityName) => {
  try {
    // Use forecast API which includes current weather + forecast in single call
    return await getWeatherForecast(cityName);
  } catch (error) {
    console.error(`Error fetching complete weather for ${cityName}:`, error);
    throw error;
  }
};

/**
 * Test if a city name works with weather API (useful for debugging)
 * @param {string} cityName - Name of the city to test
 * @returns {Promise<Object>} - Test result
 */
export const testCityName = async (cityName) => {
  try {
    await tryWeatherAPI(cityName, 'current.json', { aqi: 'no' });
    return { success: true, message: `Weather data available for '${cityName}'` };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Helper function to get today's date in YYYY-MM-DD format
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Helper function to format date for display
export const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    weekday: 'short'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};