// src/components/common/HomeGalleryPreview.jsx
import React, { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageGalleryModal from './ImageGalleryModal';
import useGallery from '../hooks/useGallery';
import Loader from './common/Loader';

const GalleryPreview = ({ maxImages = 12 }) => {
  const navigate = useNavigate();
  const { galleryImages, loading } = useGallery();
  const [galleryModal, setGalleryModal] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
    placeName: '',
    cityName: ''
  });

  // Create individual images for Pinterest layout
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
    return images.slice(0, maxImages); // Limit to maxImages
  }, [galleryImages, maxImages]);

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

  if (loading) {
    return (
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        </div>
      </section>
    );
  }

  if (individualImages.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-3 lg:px-8">
        {/* Pinterest-style Masonry Grid */}
        <div className="columns-2 lg:columns-3 gap-3 space-y-3">
          {individualImages.map((image, index) => (
            <div
              key={image.id}
              className="break-inside-avoid mb-3 group cursor-pointer"
              onClick={() => openGallery(image)}
            >
              <div className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={image.src}
                    alt={`${image.placeName} - Photo ${image.imageIndex + 1}`}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Subtle Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="bg-gradient-to-t from-black/60 to-transparent p-3">
                        <h4 className="text-white font-medium text-sm truncate">
                          {image.placeName}
                        </h4>
                        {image.cityName && (
                          <div className="flex items-center text-white/90 text-xs mt-1">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{image.cityName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        {/* {galleryImages.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/gallery')}
              className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              View More Photos
            </button>
          </div>
        )} */}

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
    </section>
  );
};

export default GalleryPreview;