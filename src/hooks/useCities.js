
import { useEffect, useState } from "react";
import apiServer from "../utils/apiServer";
import API_ROUTES from "../apiRoutes";

const CACHE_KEY_CITIES = "cachedCities";
const CACHE_KEY_REGIONS = "cachedRegions";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

const useCities = ({ showLoader = true } = {}) => {
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState(["all"]);
  const [citiesloading, setcitiesLoading] = useState(false);
  const [citieserror, setcitiesError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCitiesAndRegions = async () => {
      if (showLoader) setcitiesLoading(true);

      try {
        // 🧠 Check cache first
        const cachedCities = localStorage.getItem(CACHE_KEY_CITIES);
        const cachedRegions = localStorage.getItem(CACHE_KEY_REGIONS);
        const cacheTime = localStorage.getItem(`${CACHE_KEY_CITIES}_time`);

        const isCacheValid = cacheTime && Date.now() - cacheTime < CACHE_EXPIRY;

        if (cachedCities && cachedRegions && isCacheValid) {
          console.log("⚡ Loaded cities from cache");
          setCities(JSON.parse(cachedCities));
          setRegions(JSON.parse(cachedRegions));
          setcitiesLoading(false);
          return; // Stop here — no API call
        }

        // ✅ Otherwise fetch from API
        const citiesRes = await apiServer("get", API_ROUTES.CITIES, { all: "true" }, { showNotification: false });
        const regionsRes = await apiServer("get", API_ROUTES.REGIONS, { all: "true" }, { showNotification: false });

        if (!cancelled) {
          let citiesData = [];
          if (Array.isArray(citiesRes)) {
            citiesData = citiesRes;
          } else if (citiesRes?.data && Array.isArray(citiesRes.data)) {
            citiesData = citiesRes.data;
          } else if (citiesRes?.results && Array.isArray(citiesRes.results)) {
            citiesData = citiesRes.results;
          } else if (citiesRes?.cities && Array.isArray(citiesRes.cities)) {
            citiesData = citiesRes.cities;
          } else if (citiesRes?.items && Array.isArray(citiesRes.items)) {
            citiesData = citiesRes.items;
          } else {
            console.warn("⚠️ Unexpected cities response structure:", citiesRes);
          }

          let regionsData = [];
          if (Array.isArray(regionsRes)) {
            regionsData = regionsRes;
          } else if (regionsRes?.data && Array.isArray(regionsRes.data)) {
            regionsData = regionsRes.data;
          } else if (regionsRes?.results && Array.isArray(regionsRes.results)) {
            regionsData = regionsRes.results;
          } else if (regionsRes?.regions && Array.isArray(regionsRes.regions)) {
            regionsData = regionsRes.regions;
          }

          console.log("🏙️ Total cities loaded:", citiesData.length);
          console.log("🗺️ Total regions loaded:", regionsData.length);

          setCities(citiesData);
          setRegions(["all", ...regionsData.map((r) => r.name)]);

          // 💾 Store in cache
          localStorage.setItem(CACHE_KEY_CITIES, JSON.stringify(citiesData));
          localStorage.setItem(CACHE_KEY_REGIONS, JSON.stringify(["all", ...regionsData.map((r) => r.name)]));
          localStorage.setItem(`${CACHE_KEY_CITIES}_time`, Date.now());
        }
      } catch (err) {
        if (!cancelled) {
          console.error("❌ useCities error:", err);
          setcitiesError("Failed to fetch cities or regions.");
        }
      } finally {
        if (showLoader && !cancelled) setcitiesLoading(false);
      }
    };

    fetchCitiesAndRegions();

    return () => {
      cancelled = true;
    };
  }, [showLoader]);

  const handlePaginatedResponse = (response, dataKey = "results") => {
    if (Array.isArray(response)) {
      return {
        data: response,
        hasMore: false,
        totalPages: 1,
        currentPage: 1,
        total: response.length,
      };
    }

    return {
      data: response?.[dataKey] || response?.data || response?.items || [],
      hasMore: response?.has_next || response?.hasMore || false,
      totalPages: response?.total_pages || response?.totalPages || 1,
      currentPage: response?.current_page || response?.page || 1,
      total: response?.total || response?.count || 0,
    };
  };

  const getRandomCities = (count) => {
    const shuffled = [...cities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  return {
    cities,
    regions,
    citiesloading,
    citieserror,
    getRandomCities,
    handlePaginatedResponse,
  };
};

export default useCities;


// import { useEffect, useState } from "react";
// import apiServer from "../utils/apiServer";
// import API_ROUTES from "../apiRoutes";

// const useCities = ({ showLoader = true } = {}) => {
//   const [cities, setCities] = useState([]);
//   const [regions, setRegions] = useState(["all"]);
//   const [citiesloading, setcitiesLoading] = useState(false);
//   const [citieserror, setcitiesError] = useState(null);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchCitiesAndRegions = async () => {
//       if (showLoader) setcitiesLoading(true);

//       try {
//         // ✅ Fetch ALL cities in one request (no pagination for cities)
//         const citiesRes = await apiServer("get", API_ROUTES.CITIES, {
//           all: 'true', // Backend flag to disable pagination (string not boolean)
//         }, { showNotification: false });

//         // ✅ Fetch ALL regions in one request (no pagination for regions)
//         const regionsRes = await apiServer("get", API_ROUTES.REGIONS, {
//           all: 'true', // Backend flag to disable pagination
//         }, { showNotification: false });

//         if (!cancelled) {
//           console.log("🔍 Cities API Response:", citiesRes); // Debug log

//           // ✅ Safe handling of different response structures
//           let citiesData = [];
          
//           if (Array.isArray(citiesRes)) {
//             // Direct array response (no pagination wrapper)
//             citiesData = citiesRes;
//           } else if (citiesRes?.data && Array.isArray(citiesRes.data)) {
//             // Wrapped in data property
//             citiesData = citiesRes.data;
//           } else if (citiesRes?.results && Array.isArray(citiesRes.results)) {
//             // Paginated response structure (but with all results)
//             citiesData = citiesRes.results;
//           } else if (citiesRes?.cities && Array.isArray(citiesRes.cities)) {
//             // Cities property
//             citiesData = citiesRes.cities;
//           } else if (citiesRes?.items && Array.isArray(citiesRes.items)) {
//             // Items property
//             citiesData = citiesRes.items;
//           } else {
//             console.warn("⚠️ Unexpected cities response structure:", citiesRes);
//           }

//           // ✅ Safe handling for regions (with pagination support)
//           let regionsData = [];
          
//           if (Array.isArray(regionsRes)) {
//             regionsData = regionsRes;
//           } else if (regionsRes?.data && Array.isArray(regionsRes.data)) {
//             regionsData = regionsRes.data;
//           } else if (regionsRes?.results && Array.isArray(regionsRes.results)) {
//             regionsData = regionsRes.results;
//           } else if (regionsRes?.regions && Array.isArray(regionsRes.regions)) {
//             regionsData = regionsRes.regions;
//           }

//           console.log("🏙️ Total cities loaded:", citiesData.length);
//           console.log("🗺️ Total regions loaded:", regionsData.length);
          
//           setCities(citiesData);
//           setRegions(["all", ...regionsData.map((region) => region.name)]);
//         }
//       } catch (err) {
//         if (!cancelled) {
//           console.error("❌ useCities error:", err);
//           setcitiesError("Failed to fetch cities or regions.");
//         }
//       } finally {
//         if (showLoader && !cancelled) setcitiesLoading(false);
//       }
//     };

//     fetchCitiesAndRegions();

//     return () => {
//       cancelled = true;
//     };
//   }, [showLoader]);

//   // ✅ Safe pagination handler utility (for other hooks/components)
//   const handlePaginatedResponse = (response, dataKey = 'results') => {
//     if (Array.isArray(response)) {
//       return {
//         data: response,
//         hasMore: false,
//         totalPages: 1,
//         currentPage: 1,
//         total: response.length
//       };
//     }
    
//     return {
//       data: response?.[dataKey] || response?.data || response?.items || [],
//       hasMore: response?.has_next || response?.hasMore || false,
//       totalPages: response?.total_pages || response?.totalPages || 1,
//       currentPage: response?.current_page || response?.page || 1,
//       total: response?.total || response?.count || 0
//     };
//   };

//   const getRandomCities = (count) => {
//     const shuffled = [...cities].sort(() => 0.5 - Math.random());
//     return shuffled.slice(0, count);
//   };

//   return {
//     cities,
//     regions,
//     citiesloading,
//     citieserror,
//     getRandomCities,
//     handlePaginatedResponse, // ✅ Export for use with other paginated endpoints
//   };
// };

// // export default useCities;