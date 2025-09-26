import { useEffect, useState } from "react";
import apiServer from "../utils/apiServer";
import API_ROUTES from "../apiRoutes";

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
        // ✅ method pehle, endpoint baad
        const citiesRes = await apiServer("get", API_ROUTES.CITIES, {}, { showNotification: false });
        const regionsRes = await apiServer("get", API_ROUTES.REGIONS, {}, { showNotification: false });

        // const citiesRes = await apiServer("get", API_ROUTES.CITIES);
        // const regionsRes = await apiServer("get", API_ROUTES.REGIONS);

        if (!cancelled) {
          // ✅ normalize to array (handle pagination or plain array)
          const citiesData = Array.isArray(citiesRes)
            ? citiesRes
            : citiesRes?.results || [];

          const regionsData = Array.isArray(regionsRes)
            ? regionsRes
            : regionsRes?.results || [];

          setCities(citiesData);
          setRegions(["all", ...regionsData.map((region) => region.name)]);
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
  };
};

export default useCities;
