// src/hooks/useGallery.js
import { useState, useEffect, useRef, useCallback } from "react";
import apiServer from "../utils/apiServer.js";
import API_ROUTES from "../apiRoutes.js";

const useGallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Avoid state updates on unmounted component
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchGalleryImages = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);

    try {
      // Fetch all tourist places with their images
      const response = await apiServer("get", API_ROUTES.TOURIST_PLACES, {}, {
        showNotification: false,
        showErrorNotification: false
      });

      // Normalize response data
      let touristPlaces = [];
      if (Array.isArray(response)) {
        touristPlaces = response;
      } else if (Array.isArray(response?.results)) {
        touristPlaces = response.results;
      }

      // Transform data for gallery display
      const galleryData = touristPlaces
        .filter(place => place.image || (place.images && place.images.length > 0)) // Only places with images
        .map(place => {
          // Collect all images (main + extra)
          const allImages = [];
          
          // Add main image first
          if (place.image) {
            allImages.push(place.image);
          }
          
          // Add extra images using correct field name
          if (place.extra_images && Array.isArray(place.extra_images)) {
            place.extra_images.forEach(imageObj => {
              if (imageObj.image) {
                allImages.push(imageObj.image);
              }
            });
          }

          // Also check if backend provides all_images field
          if (place.all_images && Array.isArray(place.all_images)) {
            return {
              placeId: place.id,
              placeName: place.name || 'Unnamed Place',
              cityName: place.city_name || 'Unknown City',
              location: place.location_inside_city || null,
              mainImage: place.image,
              allImages: place.all_images,
              imageCount: place.all_images.length
            };
          }

          return {
            placeId: place.id,
            placeName: place.name || 'Unnamed Place',
            cityName: place.city_name || 'Unknown City',
            location: place.location_inside_city || null,
            mainImage: place.image,
            allImages: allImages,
            imageCount: allImages.length
          };
        })
        .filter(item => item.allImages.length > 0); // Ensure we have images

      if (!isMountedRef.current) return;
      setGalleryImages(galleryData);
      setError(null);
      
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error("Gallery fetch error:", err);
      setGalleryImages([]);
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load gallery images"
      );
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    isMountedRef.current = true;
    fetchGalleryImages();
  }, [fetchGalleryImages]);

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchGalleryImages();
  }, [fetchGalleryImages]);

  return {
    galleryImages,
    loading,
    error,
    refetch,
  };
};

export default useGallery;