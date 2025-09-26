// src/components/TouristPlacesTab.jsx - With URL fixes
import React, { useState, useMemo } from 'react';
import { MapPin, Search, X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import Loader from './common/Loader';
import ErrorMessage from './common/ErrorMessage';
import ImageGalleryModal from './ImageGalleryModal';
import useTouristPlaces from '../hooks/useTouristPlaces';

// Base URL for images (should match your Django backend)
const BASE_URL = 'http://localhost:8000';

const TouristPlacesTab = ({ cityId, cityName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedMainImage, setSelectedMainImage] = useState({});
  const [galleryModal, setGalleryModal] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
    placeName: '',
    cityName: ''
  });

  const { touristPlaces, touristPlaceLoading, touristPlaceError } = useTouristPlaces(cityId, searchQuery);

  const toggleDescription = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Helper function to build full URL
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '/api/placeholder/400/300';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it starts with /, add base URL
    if (imagePath.startsWith('/')) {
      return `${BASE_URL}${imagePath}`;
    }
    
    // Otherwise, add base URL with /
    return `${BASE_URL}/${imagePath}`;
  };

  // Function to get all images for a tourist place - WITH URL FIXES
  const getAllImages = (place) => {
    console.log("Getting images for place:", place.name, place);
    
    const allImages = [];
    
    // Add main image first
    if (place.image) {
      console.log("Found main image:", place.image);
      allImages.push(buildImageUrl(place.image));
    }
    
    // Check extra_images field
    if (place.extra_images && Array.isArray(place.extra_images)) {
      console.log("Processing extra_images array:", place.extra_images);
      place.extra_images.forEach((imageObj, index) => {
        console.log(`Extra image ${index}:`, imageObj);
        if (imageObj && imageObj.image) {
          allImages.push(buildImageUrl(imageObj.image));
        }
      });
    }

    // Check all_images field (if backend provides it with full URLs)
    if (place.all_images && Array.isArray(place.all_images)) {
      console.log("Using all_images field:", place.all_images);
      return place.all_images.map(img => buildImageUrl(img));
    }
    
    console.log("Final allImages array:", allImages);
    return allImages;
  };

  // Function to get current main image for display
  const getCurrentMainImage = (place) => {
    const placeId = place.id;
    const selectedIndex = selectedMainImage[placeId] || 0;
    const allImages = getAllImages(place);
    const currentImage = allImages[selectedIndex] || buildImageUrl(place.image);
    console.log("Current main image:", currentImage, "for place:", place.name);
    return currentImage;
  };

  // Function to select image as main
  const selectMainImage = (placeId, imageIndex) => {
    console.log("Selecting image", imageIndex, "for place", placeId);
    setSelectedMainImage(prev => ({
      ...prev,
      [placeId]: imageIndex
    }));
  };

  // Function to open gallery modal
  const openGallery = (place, startIndex = 0) => {
    const allImages = getAllImages(place);
    console.log("Opening gallery with images:", allImages);
    if (allImages.length > 0) {
      setGalleryModal({
        isOpen: true,
        images: allImages,
        initialIndex: startIndex,
        placeName: place.name,
        cityName: cityName
      });
    }
  };

  const closeGallery = () => {
    setGalleryModal({
      isOpen: false,
      images: [],
      initialIndex: 0,
      placeName: '',
      cityName: ''
    });
  };

  // Image carousel component
  const ImageCarousel = ({ place, allImages }) => {
    const [startIndex, setStartIndex] = useState(0);
    const visibleCount = 4;
    const currentMainIndex = selectedMainImage[place.id] || 0;

    const scrollLeft = () => {
      setStartIndex(prev => Math.max(0, prev - 1));
    };

    const scrollRight = () => {
      setStartIndex(prev => Math.min(allImages.length - visibleCount, prev + 1));
    };

    const visibleImages = allImages.slice(startIndex, startIndex + visibleCount);
    const showLeftArrow = startIndex > 0;
    const showRightArrow = startIndex + visibleCount < allImages.length;

    return (
      <div className="relative flex items-center space-x-2 mt-3">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
        )}

        {/* Thumbnail Images */}
        <div className="flex space-x-2 overflow-hidden px-2">
          {visibleImages.map((image, index) => {
            const actualIndex = startIndex + index;
            const isSelected = actualIndex === currentMainIndex;
            
            return (
              <button
                key={actualIndex}
                onClick={() => selectMainImage(place.id, actualIndex)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-200'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <img
                  src={image}
                  alt={`${place.name} - Image ${actualIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>
    );
  };

  // Filter tourist places based on search query
  const filteredTouristPlaces = useMemo(() => {
    if (!searchQuery.trim()) return touristPlaces;
    
    return touristPlaces.filter((place) =>
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.location_inside_city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [touristPlaces, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-4">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 text-center sm:text-left">
          Tourist Places in {cityName}
        </h2>
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto sm:mx-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tourist places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base transition-colors"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>

        {/* Search Results Counter */}
        <p className="mt-3 text-sm text-gray-600 text-center sm:text-left">
          {searchQuery && !touristPlaceLoading ? (
            <>
              {filteredTouristPlaces.length} of {touristPlaces.length} places found
            </>
          ) : (
            <>
              {touristPlaces.length} places found
            </>
          )}
        </p>
      </div>

      {/* Loading State */}
      {touristPlaceLoading ? (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      ) : touristPlaceError ? (
        <ErrorMessage message="Unable to load Tourist places. Please try again." />
      ) : filteredTouristPlaces.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
            {searchQuery ? 'No places found for your search' : 'No Tourist Places found'}
          </h3>
          <p className="text-gray-500 text-sm sm:text-base px-4">
            {searchQuery 
              ? `Try searching for something else or clear your search to see all places.`
              : 'Try adjusting your search or check back later for updates.'
            }
          </p>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm sm:text-base"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        // Clean Data Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTouristPlaces.map((place, index) => {
            const allImages = getAllImages(place);
            const hasMultipleImages = allImages.length > 1;
            const currentMainImage = getCurrentMainImage(place);
            
            return (
              <div
                key={place.id || index}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Main Image */}
                <div className="relative h-48 overflow-hidden group">
                  <img
                    src={currentMainImage}
                    alt={place.name}
                    className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                    onClick={() => openGallery(place, selectedMainImage[place.id] || 0)}
                    loading="lazy"
                  />
                  
                  {/* Image Count Badge */}
                  {hasMultipleImages && (
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <Camera className="h-3 w-3" />
                      <span>{allImages.length}</span>
                    </div>
                  )}
                  
                  {/* Click to enlarge overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors cursor-pointer flex items-center justify-center" onClick={() => openGallery(place, selectedMainImage[place.id] || 0)}>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 rounded-full p-2">
                        <Camera className="h-5 w-5 text-gray-800" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Carousel - Only show if multiple images */}
                {hasMultipleImages && allImages.length > 1 && (
                  <div className="px-4 py-2 bg-gray-50">
                    <ImageCarousel place={place} allImages={allImages} />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {place.name}
                  </h3>

                  {/* Location inside city */}
                  {place.location_inside_city && (
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{place.location_inside_city}</span>
                    </div>
                  )}

                  {/* Distance from main city */}
                  {place.distance_from_main_city && (
                    <p className="text-gray-500 text-sm mb-3">
                      Distance from city: {place.distance_from_main_city}
                    </p>
                  )}

                  {/* Description */}
                  <p className={`${
                    expandedCards[place.id] ? '' : 'line-clamp-2'
                  } text-gray-600 mb-3 text-sm leading-relaxed`}>
                    {place.short_description}
                  </p>

                  <button 
                    onClick={() => toggleDescription(place.id)} 
                    className="text-emerald-600 text-sm font-semibold hover:underline mb-4 text-left transition-colors"
                  >
                    {expandedCards[place.id] ? 'Read Less ↑' : 'Read More ↓'}
                  </button>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {/* View Gallery Button - Only if multiple images */}
                    {hasMultipleImages && (
                      <button
                        onClick={() => openGallery(place, 0)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-1"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Gallery</span>
                      </button>
                    )}

                    {/* Get Directions Button */}
                    {place.map_url && (
                      <a
                        href={place.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${hasMultipleImages ? 'flex-1' : 'w-full'} bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center space-x-1`}
                      >
                        <MapPin className="h-4 w-4" />
                        <span>Directions</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
  );
};

export default TouristPlacesTab;

// // src/components/TouristPlacesTab.jsx
// import React, { useState, useMemo } from 'react';
// import { MapPin, Search, X } from 'lucide-react';
// import Loader from './common/Loader';
// import ErrorMessage from './common/ErrorMessage';
// import useTouristPlaces from '../hooks/useTouristPlaces';

// const TouristPlacesTab = ({ cityId, cityName }) => {
//   // const { touristPlaces, touristPlaceLoading, touristPlaceError } = useTouristPlaces(cityId);
//   // ✅ Declare first
//   const [searchQuery, setSearchQuery] = useState('');
//   const [expandedCards, setExpandedCards] = useState({});
//   const { touristPlaces, touristPlaceLoading, touristPlaceError } = useTouristPlaces(cityId, searchQuery);

// console.log("TouristPlacesTab received cityId:", cityId);

//   const toggleDescription = (id) => {
//     setExpandedCards((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   };

//   const clearSearch = () => {
//     setSearchQuery('');
//   };

//   // Filter tourist places based on search query
//   const filteredTouristPlaces = useMemo(() => {
//     if (!searchQuery.trim()) return touristPlaces;
    
//     return touristPlaces.filter((place) =>
//       place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       place.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       place.location_inside_city?.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [touristPlaces, searchQuery]);

//   return (
//     <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-4">
//       {/* Header */}
//       <div className="mb-6 sm:mb-8">
//         <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 text-center sm:text-left">
//           Tourist Places in {cityName}
//         </h2>
//         <p className="mt-3 text-sm text-gray-600 text-center sm:text-left">
//             {touristPlaces.length} places found
//           </p>
//         {/* Search Bar */}
//         <div className="relative max-w-md mx-auto sm:mx-0">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
//           </div>
//           <input
//             type="text"
//             placeholder="Search tourist places..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="block w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base transition-colors"
//           />
//           {searchQuery && (
//             <button
//               onClick={clearSearch}
//               className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="h-4 w-4 sm:h-5 sm:w-5" />
//             </button>
//           )}
//         </div>

//         {/* Search Results Counter */}
//         {searchQuery && !touristPlaceLoading && (
//           <p className="mt-3 text-sm text-gray-600 text-center sm:text-left">
//             {filteredTouristPlaces.length} of {touristPlaces.length} places found
//           </p>
//         )}
//       </div>

//       {/* Loading State */}
//       {touristPlaceLoading ? (
//         <div className="flex justify-center py-16">
//           <Loader />
//         </div>
//       ) : touristPlaceError ? (
//         // Error state
//         <ErrorMessage message="Unable to load Tourist places. Please try again." />
//       ) : filteredTouristPlaces.length === 0 ? (
//         // Empty State
//         <div className="text-center py-16">
//           <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
//             <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
//           </div>
//           <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
//             {searchQuery ? 'No places found for your search' : 'No Tourist Places found'}
//           </h3>
//           <p className="text-gray-500 text-sm sm:text-base px-4">
//             {searchQuery 
//               ? `Try searching for something else or clear your search to see all places.`
//               : 'Try adjusting your search or check back later for updates.'
//             }
//           </p>
//           {searchQuery && (
//             <button
//               onClick={clearSearch}
//               className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm sm:text-base"
//             >
//               Clear Search
//             </button>
//           )}
//         </div>
//       ) : (
//         // Data Grid - Responsive
//         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
//           {filteredTouristPlaces.map((place, index) => (
//             <div
//               key={place.id || index}
//               className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//             >
//               <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row">
//                 {/* Image */}
//                 <div className="sm:w-1/2 lg:w-full xl:w-1/2 flex-shrink-0">
//                   <img
//                     src={place.image}
//                     alt={place.name}
//                     className="w-full h-32 sm:h-full lg:h-32 xl:h-full object-cover"
//                     loading="lazy"
//                   />
//                 </div>

//                 {/* Content */}
//                 <div className="sm:w-1/2 lg:w-full xl:w-1/2 p-4 sm:p-2 flex flex-col justify-between">
//                   {/* Name */}
//                   <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 line-clamp-2">
//                     {place.name}
//                   </h3>

//                   {/* Location inside city */}
//                   {place.location_inside_city && (
//                     <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-2">
//                       <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-emerald-500 flex-shrink-0" />
//                       <span className="truncate">{place.location_inside_city}</span>
//                     </div>
//                   )}

             

//                   {/* Distance from main city */}
//                   {place.distance_from_main_city && (
//                     <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">
//                       Distance from city: {place.distance_from_main_city}
//                     </p>
//                   )}

//                   {/* Description */}
//                   <p className={`${
//                     expandedCards[place.id] ? '' : 'line-clamp-2 sm:line-clamp-2'
//                   } text-gray-600 mb-3 text-sm sm:text-base leading-relaxed`}>
//                     {place.short_description}
//                   </p>

//                   <button 
//                     onClick={() => toggleDescription(place.id)} 
//                     className="text-emerald-600 text-xs sm:text-sm font-semibold hover:underline mb-3 sm:mb-4 text-left transition-colors"
//                   >
//                     {expandedCards[place.id] ? 'Read Less ↑' : 'Read More ↓'}
//                   </button>

//                   {/* Get Directions Button */}
//                   {place.map_url && (
//                     <a
//                       href={place.map_url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all text-center block text-sm sm:text-base"
//                     >
//                       Get Directions
//                     </a>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TouristPlacesTab;