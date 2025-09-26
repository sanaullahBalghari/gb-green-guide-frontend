// src/components/Gallery.jsx
import React, { useState, useMemo } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import Loader from './common/Loader';
import ErrorMessage from './common/ErrorMessage';
import ImageGalleryModal from './ImageGalleryModal';
import useGallery from '../hooks/useGallery';

const Gallery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [galleryModal, setGalleryModal] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
    placeName: '',
    cityName: ''
  });

  const { galleryImages, loading, error } = useGallery();

  // Create individual images from gallery data for Pinterest layout
  const individualImages = useMemo(() => {
    const images = [];
    galleryImages.forEach(place => {
      if (place.allImages && place.allImages.length > 0) {
        place.allImages.forEach((image, index) => {
          images.push({
            id: `${place.placeId}-${index}`,
            src: image,
            placeName: place.placeName,
            cityName: place.cityName,
            location: place.location,
            placeId: place.placeId,
            allPlaceImages: place.allImages,
            imageIndex: index
          });
        });
      }
    });
    return images;
  }, [galleryImages]);

  // Filter images based on search query
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return individualImages;
    
    return individualImages.filter((item) =>
      item.placeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cityName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [individualImages, searchQuery]);

  // Function to open gallery modal
  const openGallery = (imageItem) => {
    setGalleryModal({
      isOpen: true,
      images: imageItem.allPlaceImages,
      initialIndex: imageItem.imageIndex,
      placeName: imageItem.placeName,
      cityName: imageItem.cityName
    });
  };

  // Function to close gallery modal
  const closeGallery = () => {
    setGalleryModal({
      isOpen: false,
      images: [],
      initialIndex: 0,
      placeName: '',
      cityName: ''
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Explore Gallery
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore stunning photography from beautiful destinations
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search places or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base transition-colors"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Results Counter */}
          <p className="text-sm text-gray-600 text-center">
            {searchQuery ? (
              <>
                {filteredImages.length} of {individualImages.length} photos found
              </>
            ) : (
              <>
                {individualImages.length} photos from {galleryImages.length} places
              </>
            )}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader />
          </div>
        ) : error ? (
          <ErrorMessage message="Unable to load gallery images. Please try again." />
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? 'No photos found' : 'No photos available'}
            </h3>
            <p className="text-gray-500 px-4">
              {searchQuery 
                ? 'Try a different search term'
                : 'Check back later for new photos'
              }
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Show All Photos
              </button>
            )}
          </div>
        ) : (
          // Pinterest-style Masonry Grid
          <div className="columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="break-inside-avoid mb-4 group cursor-pointer"
                onClick={() => openGallery(image)}
              >
                <div className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={image.src}
                      alt={`${image.placeName} - Photo ${image.imageIndex + 1}`}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      style={{
                        // Add some randomness to heights for better masonry effect
                        aspectRatio: 'auto'
                      }}
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300">
                      <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="bg-gradient-to-t from-black/70 to-transparent p-4">
                          <h3 className="text-white font-semibold text-sm mb-1 truncate">
                            {image.placeName}
                          </h3>
                          {image.cityName && (
                            <div className="flex items-center text-white/90 text-xs">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{image.cityName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Optional: Small info bar at bottom */}
                  {/* <div className="p-3 bg-white">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {image.placeName}
                    </h4>
                    {image.cityName && (
                      <p className="text-gray-500 text-xs truncate mt-1">
                        {image.cityName}
                      </p>
                    )}
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Gallery Modal */}
        <ImageGalleryModal
          images={galleryModal.images}
          isOpen={galleryModal.isOpen}
          onClose={closeGallery}
          initialIndex={galleryModal.initialIndex}
          placeName={galleryModal.placeName}
          cityName={galleryModal.cityName}
        />
      </div>
    </div>
  );
};

export default Gallery;