import { useEffect, useState } from "react";
import apiServer from "../utils/apiServer.js";
import API_ROUTES from "../apiRoutes.js";

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

const useEvents = ({
  cityId = null,
  upcomingOnly = false,
  limit = null,
  showLoader = true,
} = {}) => {
  const [events, setEvents] = useState([]);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      if (showLoader) setEventLoading(true);
      setEventsError(null);

      try {
        // ✅ build cache key dynamically (unique for each city/filter combo)
        const cacheKey = `cachedEvents_${cityId || "all"}_${upcomingOnly}_${limit || "all"}`;
        const cacheTimeKey = `${cacheKey}_time`;

        // 🧠 check local cache
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTime = localStorage.getItem(cacheTimeKey);
        const isCacheValid = cachedData && cachedTime && Date.now() - cachedTime < CACHE_EXPIRY;

        if (isCacheValid) {
          console.log(`⚡ Loaded events from cache [${cacheKey}]`);
          setEvents(JSON.parse(cachedData));
          setEventLoading(false);
          return;
        }

        // ✅ build endpoint URL
        let url = API_ROUTES.EVENTS;
        const params = [];

        if (cityId) params.push(`city=${cityId}`);
        if (upcomingOnly) params.push("upcoming=true");
        if (limit) params.push(`limit=${limit}`);

        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }

        // ✅ fetch from API
        const res = await apiServer(
          "get",
          url,
          {},
          { tokenRequired: false, showNotification: false, showErrorNotification: true }
        );

        if (!cancelled) {
          const data = Array.isArray(res)
            ? res
            : res?.results || []; // handles paginated or flat array

          setEvents(data);

          // 💾 store in cache
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(cacheTimeKey, Date.now());
          console.log(`🗃️ Cached events saved [${cacheKey}]`);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching events:", error);
          setEventsError(error.message || "Error fetching events.");
        }
      } finally {
        if (showLoader && !cancelled) setEventLoading(false);
      }
    };

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [cityId, upcomingOnly, limit, showLoader]);

  // ✅ Utility for random subset of events
  const getRandomEvents = (count) => {
    const shuffled = [...events].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  return { events, eventLoading, eventsError, getRandomEvents };
};

export default useEvents;



// // src/hooks/useEvents.js
// import { useEffect, useState } from "react";
// import apiServer from "../utils/apiServer.js";
// import API_ROUTES from "../apiRoutes.js";

// const useEvents = ({
//   cityId = null,
//   upcomingOnly = false,
//   limit = null,
//   showLoader = true,
// } = {}) => {
//   const [events, setEvents] = useState([]);
//   const [eventLoading, setEventLoading] = useState(false);
//   const [eventsError, setEventsError] = useState(null);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchEvents = async () => {
//       if (showLoader) setEventLoading(true);
//       setEventsError(null);

//       try {
//         // ✅ build endpoint URL
//         let url = API_ROUTES.EVENTS;
//         const params = [];

//         if (cityId) params.push(`city=${cityId}`);
//         if (upcomingOnly) params.push("upcoming=true");
//         if (limit) params.push(`limit=${limit}`);

//         if (params.length > 0) {
//           url += `?${params.join("&")}`;
//         }

//         // ✅ Correct apiServer usage
//         const res = await apiServer(
//           "get", // method
//           url,   // endpoint
//           {},    // no payload for GET
//           { tokenRequired: false ,
//                showNotification: false,
//                             showErrorNotification: true
//           } // public API
//         );

//         if (!cancelled) {
//           const data = Array.isArray(res)
//             ? res
//             : res?.results || []; // handles paginated or flat array
//           setEvents(data);
//         }
//       } catch (error) {
//         if (!cancelled) {
//           console.error("Error fetching events:", error);
//           setEventsError(error.message || "Error fetching events.");
//         }
//       } finally {
//         if (showLoader && !cancelled) setEventLoading(false);
//       }
//     };

//     fetchEvents();

//     return () => {
//       cancelled = true;
//     };
//   }, [cityId, upcomingOnly, limit, showLoader]);

//   // ✅ Utility for random subset of events
//   const getRandomEvents = (count) => {
//     const shuffled = [...events].sort(() => 0.5 - Math.random());
//     return shuffled.slice(0, count);
//   };

//   return { events, eventLoading, eventsError, getRandomEvents };
// };

// export default useEvents;
