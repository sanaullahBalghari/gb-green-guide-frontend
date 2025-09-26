// src/hooks/useTouristPlaces.js
import { useState, useEffect, useRef, useCallback } from "react";
import apiServer from "../utils/apiServer.js";
import API_ROUTES from "../apiRoutes.js";

const useTouristPlaces = (cityId, searchTerm = "") => {
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [touristPlaceCount, setTouristPlaceCount] = useState(0);
  const [touristPlaceLoading, setTouristPlaceLoading] = useState(false);
  const [touristPlaceError, setTouristPlaceError] = useState(null);

  // avoid state updates on unmounted component
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchPlaces = useCallback(
    async (overrideCityId = cityId, overrideSearch = searchTerm) => {
      if (!overrideCityId) {
        if (!isMountedRef.current) return;
        setTouristPlaces([]);
        setTouristPlaceCount(0);
        setTouristPlaceError(null);
        setTouristPlaceLoading(false);
        return;
      }

      if (!isMountedRef.current) return;
      setTouristPlaceLoading(true);
      setTouristPlaceError(null);

      try {
        // ✅ build endpoint URL
        let url = API_ROUTES.TOURIST_PLACES;
        const params = [];

        if (overrideCityId)
          params.push(`city_id=${encodeURIComponent(overrideCityId)}`);
        if (overrideSearch)
          params.push(`search=${encodeURIComponent(overrideSearch)}`);

        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }

        // ✅ call apiServer with GET
        const res = await apiServer("get", url);

        // ✅ Normalize response: handle both paginated + non-paginated APIs
        let results = [];
        if (Array.isArray(res)) {
          results = res; // plain list
        } else if (Array.isArray(res?.results)) {
          results = res.results; // paginated
        } else {
          results = [];
        }

        if (!isMountedRef.current) return;
        setTouristPlaces(results);
        setTouristPlaceCount(
          typeof res?.count === "number" ? res.count : results.length
        );
        setTouristPlaceError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        setTouristPlaces([]);
        setTouristPlaceCount(0);
        setTouristPlaceError(
          err?.response?.data?.detail ||
            err?.message ||
            "Something went wrong while loading tourist places"
        );
      } finally {
        if (!isMountedRef.current) return;
        setTouristPlaceLoading(false);
      }
    },
    [cityId, searchTerm]
  );

  // auto-fetch when cityId or searchTerm changes
  useEffect(() => {
    isMountedRef.current = true;
    fetchPlaces();
  }, [fetchPlaces]);

  // manual refetch
  const refetch = useCallback(() => fetchPlaces(), [fetchPlaces]);

  return {
    touristPlaces,
    touristPlaceCount,
    touristPlaceLoading,
    touristPlaceError,
    refetch,
  };
};

export default useTouristPlaces;
