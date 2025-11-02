import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

const ProductSliderSection = ({ onProductClick }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Fetch products and categories
  const {
    products,
    categories,
    loading: productsLoading,
    error: productsError
  } = useProducts({ 
    fetchCategories: true,
    limit: 20 // Fetch up to 50 products for filtering
  });

  // Debug: Log categories when they change
  useEffect(() => {
    console.log('📦 Categories loaded in ProductSliderSection:', categories);
    console.log('📦 Total categories:', categories?.length);
    categories?.forEach(cat => console.log(`  - ${cat.name} (ID: ${cat.id})`));
  }, [categories]);

  // Debug: Log products and their categories
  useEffect(() => {
    if (products.length > 0) {
      console.log('🛒 Products loaded:', products.length);
      console.log('🛒 Product categories:', products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category?.name || p.category,
        categoryId: p.category?.id || p.category
      })));
    }
  }, [products]);

  // Filter products when category or products change
  useEffect(() => {
    const filterProducts = async () => {
      if (activeCategory === 'all') {
        setFilteredProducts(products.slice(0, 8)); // Show 8 latest products
      } else {
        setCategoryLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        const filtered = products.filter((product) => {
          const categoryId = product.category?.id || product.category;
          return String(categoryId) === String(activeCategory);
        });
        console.log('🔍 Filtered products for category', activeCategory, ':', filtered.length);
        setFilteredProducts(filtered.slice(0, 8));
        setCategoryLoading(false);
      }
      setCurrentSlide(0); // Reset slider position
    };

    if (products.length > 0) {
      filterProducts();
    }
  }, [activeCategory, products]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const nextSlide = () => {
    const maxSlide = Math.max(0, Math.ceil(filteredProducts.length / getItemsPerSlide()) - 1);
    setCurrentSlide(prev => (prev >= maxSlide ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const maxSlide = Math.max(0, Math.ceil(filteredProducts.length / getItemsPerSlide()) - 1);
    setCurrentSlide(prev => (prev <= 0 ? maxSlide : prev - 1));
  };

  const getItemsPerSlide = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3; // lg screens
      if (window.innerWidth >= 768) return 2;  // md screens
      return 1; // sm screens
    }
    return 4;
  };

  const getTranslateX = () => {
    const itemsPerSlide = getItemsPerSlide();
    return -(currentSlide * 100);
  };

  if (productsLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Latest <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Products</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover authentic products from the heart of Gilgit-Baltistan
            </p>
          </div>
          <div className="flex justify-center items-center py-16">
            <Loader />
          </div>
        </div>
      </section>
    );
  }

  if (productsError) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Latest <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Products</span>
            </h2>
          </div>
          <ErrorMessage message="Unable to load products. Please try again." />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Latest <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Products</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover authentic products from the heart of Gilgit-Baltistan. From premium dry fruits to traditional handicrafts.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex space-x-1 bg-white p-2 rounded-2xl shadow-lg overflow-x-auto scrollbar-hide max-w-full">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeCategory === 'all'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
              >
                All Products
              </button>
              {(categories || []).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeCategory === category.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md transform scale-105'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Slider */}
        <div className="relative">
          {categoryLoading ? (
            <div className="text-center ">
              <div className="mx-auto flex  ">
                <Loader />
              </div>
              <p className="text-slate-500 ">Loading Products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2" />
                </svg>
              </div>
              <p className="text-lg text-gray-600">No products found in this category</p>
            </div>
          ) : (
            <>
              {/* Slider Container with Hover Areas for Navigation */}
              <div className="relative overflow-hidden rounded-2xl group">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(${getTranslateX()}%)` }}
                >
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="w-full lg:w-1/4 md:w-1/2 flex-shrink-0 px-3"
                    >
                      <div className="transform transition-all duration-300 hover:scale-105">
                        <ProductCard
                          product={product}
                          showActions={false}
                          onViewDetails={onProductClick}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows - Hidden by default, show on hover */}
                {filteredProducts.length > getItemsPerSlide() && (
                  <>
                    {/* Left Navigation Area */}
                    <div
                      className="absolute left-0 top-0 w-16 h-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                      onClick={prevSlide}
                    >
                      <div className="bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200">
                        <ChevronLeft className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Right Navigation Area */}
                    <div
                      className="absolute right-0 top-0 w-16 h-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                      onClick={nextSlide}
                    >
                      <div className="bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Dot Indicators */}
              {filteredProducts.length > getItemsPerSlide() && (
                <div className="flex justify-center mt-8 space-x-2">
                  {Array.from({ length: Math.ceil(filteredProducts.length / getItemsPerSlide()) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index
                          ? 'bg-emerald-600 w-8'
                          : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => window.location.href = '/products'}
            className="bg-gradient-to-r cursor-pointer from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
          >
            View All Products
          </button>
        </div>
      </div>

      {/* Custom CSS for scrollbar hide */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default ProductSliderSection;


// import React, { useState, useEffect } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import ProductCard from '../components/ProductCard';
// import useProducts from '../hooks/useProducts';
// import Loader from '../components/common/Loader';
// import ErrorMessage from '../components/common/ErrorMessage';

// const ProductSliderSection = ({ onProductClick }) => {
//   const [activeCategory, setActiveCategory] = useState('all');
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [categoryLoading, setCategoryLoading] = useState(false);

//   // Fetch products and categories
//  const {
//   products,
//   categories,
//   loading: productsLoading,
//   error: productsError
// } = useProducts({ 
//   fetchCategories: true,
//   limit: 50 // Fetch up to 50 products for filtering
// });

//   // Add these useEffect hooks after your existing useProducts hook

// // Debug: Log categories when they change
// useEffect(() => {
//   console.log('📦 Categories loaded in ProductSliderSection:', categories);
//   console.log('📦 Total categories:', categories?.length);
//   categories?.forEach(cat => console.log(`  - ${cat.name} (ID: ${cat.id})`));
// }, [categories]);

// // Debug: Log products and their categories
// useEffect(() => {
//   if (products.length > 0) {
//     console.log('🛒 Products loaded:', products.length);
//     console.log('🛒 Product categories:', products.map(p => ({
//       id: p.id,
//       name: p.name,
//       category: p.category?.name || p.category,
//       categoryId: p.category?.id || p.category
//     })));
//   }
// }, [products]);

// // Filter products when category or products change (UPDATE YOUR EXISTING ONE)
// useEffect(() => {
//   const filterProducts = async () => {
//     if (activeCategory === 'all') {
//       setFilteredProducts(products.slice(0, 8)); // Show 8 latest products
//     } else {
//       setCategoryLoading(true);
//       await new Promise(resolve => setTimeout(resolve, 300));
//       const filtered = products.filter((product) => {
//         const categoryId = product.category?.id || product.category;
//         return String(categoryId) === String(activeCategory);
//       });
//       console.log('🔍 Filtered products for category', activeCategory, ':', filtered.length); // ADD THIS LINE
//       setFilteredProducts(filtered.slice(0, 8));
//       setCategoryLoading(false);
//     }
//     setCurrentSlide(0); // Reset slider position
//   };

//   if (products.length > 0) {
//     filterProducts();
//   }
// }, [activeCategory, products]);

  



//   const handleCategoryChange = (categoryId) => {
//     setActiveCategory(categoryId);
//   };

//   const nextSlide = () => {
//     const maxSlide = Math.max(0, Math.ceil(filteredProducts.length / getItemsPerSlide()) - 1);
//     setCurrentSlide(prev => (prev >= maxSlide ? 0 : prev + 1));
//   };

//   const prevSlide = () => {
//     const maxSlide = Math.max(0, Math.ceil(filteredProducts.length / getItemsPerSlide()) - 1);
//     setCurrentSlide(prev => (prev <= 0 ? maxSlide : prev - 1));
//   };

//   const getItemsPerSlide = () => {
//     if (typeof window !== 'undefined') {
//       if (window.innerWidth >= 1024) return 3; // lg screens
//       if (window.innerWidth >= 768) return 2;  // md screens
//       return 1; // sm screens
//     }
//     return 4;
//   };

//   const getTranslateX = () => {
//     const itemsPerSlide = getItemsPerSlide();
//     return -(currentSlide * 100);
//   };

//   if (productsLoading) {
//     return (
//       <section className="py-20 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//               Latest <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Products</span>
//             </h2>
//             <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//               Discover authentic products from the heart of Gilgit-Baltistan
//             </p>
//           </div>
//           <div className="flex justify-center items-center py-16">
//             <Loader />
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (productsError) {
//     return (
//       <section className="py-20 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//               Latest <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Products</span>
//             </h2>
//           </div>
//           <ErrorMessage message="Unable to load products. Please try again." />
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="py-20 bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Section Header */}
//         <div className="text-center mb-12">
//           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//             Latest <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Products</span>
//           </h2>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
//             Discover authentic products from the heart of Gilgit-Baltistan. From premium dry fruits to traditional handicrafts.
//           </p>
//         </div>

//         {/* Category Tabs */}
//         <div className="mb-8">
//           <div className="flex items-center justify-center">
//             <div className="flex space-x-1 bg-white p-2 rounded-2xl shadow-lg overflow-x-auto scrollbar-hide max-w-full">
//               <button
//                 onClick={() => handleCategoryChange('all')}
//                 className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeCategory === 'all'
//                     ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md transform scale-105'
//                     : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
//                   }`}
//               >
//                 All Products
//               </button>
//               {(categories || []).map((category) => (
//                 <button
//                   key={category.id}
//                   onClick={() => handleCategoryChange(category.id)}
//                   className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeCategory === category.id
//                       ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md transform scale-105'
//                       : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
//                     }`}
//                 >
//                   {category.name}
//                 </button>
//               ))}

//             </div>
//           </div>
//         </div>

//         {/* Product Slider */}
//         <div className="relative">
//           {categoryLoading ? (
//             <div className="text-center ">
//               <div className="mx-auto flex  ">
//                 <Loader />
//               </div>
//               <p className="text-slate-500 ">Loading Products...</p>
//             </div>
//           ) : filteredProducts.length === 0 ? (
//             <div className="text-center py-16">
//               <div className="text-gray-400 mb-4">
//                 <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2" />
//                 </svg>
//               </div>
//               <p className="text-lg text-gray-600">No products found in this category</p>
//             </div>
//           ) : (
//             <>
//               {/* Slider Container with Hover Areas for Navigation */}
//               <div className="relative overflow-hidden rounded-2xl group">
//                 <div
//                   className="flex transition-transform duration-500 ease-in-out"
//                   style={{ transform: `translateX(${getTranslateX()}%)` }}
//                 >
//                   {filteredProducts.map((product, index) => (
//                     <div
//                       key={product.id}
//                       className="w-full lg:w-1/4 md:w-1/2 flex-shrink-0 px-3"
//                     >
//                       <div className="transform transition-all duration-300 hover:scale-105">
//                         <ProductCard
//                           product={product}
//                           showActions={false}
//                           onViewDetails={onProductClick}
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Navigation Arrows - Hidden by default, show on hover */}
//                 {filteredProducts.length > getItemsPerSlide() && (
//                   <>
//                     {/* Left Navigation Area */}
//                     <div
//                       className="absolute left-0 top-0 w-16 h-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
//                       onClick={prevSlide}
//                     >
//                       <div className="bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200">
//                         <ChevronLeft className="w-6 h-6" />
//                       </div>
//                     </div>

//                     {/* Right Navigation Area */}
//                     <div
//                       className="absolute right-0 top-0 w-16 h-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
//                       onClick={nextSlide}
//                     >
//                       <div className="bg-white/90 backdrop-blur-sm text-gray-700 p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200">
//                         <ChevronRight className="w-6 h-6" />
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>

//               {/* Dot Indicators */}
//               {filteredProducts.length > getItemsPerSlide() && (
//                 <div className="flex justify-center mt-8 space-x-2">
//                   {Array.from({ length: Math.ceil(filteredProducts.length / getItemsPerSlide()) }).map((_, index) => (
//                     <button
//                       key={index}
//                       onClick={() => setCurrentSlide(index)}
//                       className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index
//                           ? 'bg-emerald-600 w-8'
//                           : 'bg-gray-300 hover:bg-gray-400'
//                         }`}
//                     />
//                   ))}
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {/* View All Button */}
//         <div className="text-center mt-12">
//           <button
//             onClick={() => window.location.href = '/products'}
//             className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
//           >
//             View All Products
//           </button>
//         </div>
//       </div>

//       {/* Custom CSS for scrollbar hide */}
//       <style jsx>{`
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </section>
//   );
// };

// export default ProductSliderSection;