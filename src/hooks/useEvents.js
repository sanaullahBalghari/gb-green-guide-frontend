// src/hooks/useEvents.js
import { useEffect, useState } from "react";
import apiServer from "../utils/apiServer.js";
import API_ROUTES from "../apiRoutes.js";

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
        // ✅ build endpoint URL
        let url = API_ROUTES.EVENTS;
        const params = [];

        if (cityId) params.push(`city=${cityId}`);
        if (upcomingOnly) params.push("upcoming=true");
        if (limit) params.push(`limit=${limit}`);

        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }

        // ✅ Correct apiServer usage
        const res = await apiServer(
          "get", // method
          url,   // endpoint
          {},    // no payload for GET
          { tokenRequired: false ,
               showNotification: false,
                            showErrorNotification: true
          } // public API
        );

        if (!cancelled) {
          const data = Array.isArray(res)
            ? res
            : res?.results || []; // handles paginated or flat array
          setEvents(data);
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
