import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  MapPin,
  Package
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import useProducts from '../hooks/useProducts';
import apiServer from '../utils/apiServer';
import API_ROUTES from '../apiRoutes';

const ProductListPage = ({ isOwnerProfile = false }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ PAGINATION FIX: Match backend PAGE_SIZE
  const ITEMS_PER_PAGE = 5; // Must match backend settings.py PAGE_SIZE

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_discount: searchParams.get('min_discount') || '',
    is_available: searchParams.get('is_available') || '',
    ordering: searchParams.get('ordering') || '-created_at'
  });

  // UI state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [searchInput, setSearchInput] = useState(filters.search);
  const [priceRange, setPriceRange] = useState({
    min: parseInt(filters.min_price) || 0,
    max: parseInt(filters.max_price) || 10000
  });

  // Advanced filtering state (for custom API calls)
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const [advancedError, setAdvancedError] = useState(null);
  const [cities, setCities] = useState([]);

  // Use the hook for basic data and categories
  const { 
    categories, 
    loading: hookLoading, 
    error: hookError 
  } = useProducts({ fetchCategories: true });

  // Check if we need advanced filtering
  const hasActiveFilters = () => {
    return filters.search || filters.category || filters.city || 
           filters.min_price || filters.max_price || filters.min_discount || 
           filters.is_available || filters.ordering !== '-created_at';
  };

  // Debounced search
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      setCurrentPage(1);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchInput);
  }, [searchInput, debouncedSearch]);

  // Fetch cities
  useEffect(() => {
    fetchCities();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    if (hasActiveFilters()) {
      fetchFilteredProducts();
    } else {
      fetchDefaultProducts();
    }
    updateUrlParams();
  }, [filters, currentPage, isOwnerProfile]);

  const fetchCities = async () => {
    try {
      const response = await apiServer(
        'get',
        API_ROUTES.CITIES,
        {},
        {
          tokenRequired: false,
          showNotification: false,
          showErrorNotification: false
        }
      );
      
      if (!response.error) {
        const citiesData = response.data?.results || response.data || response || [];
        setCities(Array.isArray(citiesData) ? citiesData : []);
        console.log("✅ Cities loaded:", citiesData.length);
      }
    } catch (err) {
      console.error("❌ Error fetching cities:", err);
    }
  };

  const fetchDefaultProducts = async () => {
    try {
      setAdvancedLoading(true);
      setAdvancedError(null);

      let endpoint = API_ROUTES.PRODUCTS;
      if (isOwnerProfile) {
        endpoint = API_ROUTES.MY_PRODUCTS;
      }

      // ✅ PAGINATION FIX: Remove page_size to use backend default (5)
      const queryParams = {
        page: currentPage
      };

      console.log("🛒 Fetching default products:", { endpoint, queryParams, isOwnerProfile });

      const response = await apiServer(
        'get',
        endpoint,
        queryParams,
        {
          tokenRequired: isOwnerProfile,
          showNotification: false,
          showErrorNotification: true
        }
      );

      console.log("✅ Default products response:", response);

      if (!response.error) {
        const productsData = response.results || response.data?.results || response.data || [];
        const count = response.count || response.data?.count || 0;
        
        // ✅ PAGINATION FIX: Debug logging
        console.log("📊 Pagination Debug:", {
          productsCount: productsData.length,
          totalCount: count,
          currentPage,
          itemsPerPage: ITEMS_PER_PAGE,
          calculatedPages: Math.ceil(count / ITEMS_PER_PAGE)
        });
        
        setFilteredProducts(Array.isArray(productsData) ? productsData : []);
        setTotalResults(count);
        // ✅ PAGINATION FIX: Calculate pages based on backend page size
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      } else {
        setAdvancedError(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error("❌ Error fetching default products:", err);
      setAdvancedError(err.response?.data?.message || err.message || 'Failed to fetch products');
    } finally {
      setAdvancedLoading(false);
    }
  };

  const fetchFilteredProducts = async () => {
    try {
      setAdvancedLoading(true);
      setAdvancedError(null);

      let endpoint = API_ROUTES.PRODUCTS;
      if (isOwnerProfile) {
        endpoint = API_ROUTES.MY_PRODUCTS;
      }

      // ✅ PAGINATION FIX: Remove page_size to use backend default (5)
      const queryParams = {
        page: currentPage
      };

      // Add filters to params
      if (filters.search) queryParams.search = filters.search;
      if (filters.category) queryParams.category = filters.category;
      if (filters.city) queryParams.city = filters.city;
      if (filters.min_price) queryParams.min_price = filters.min_price;
      if (filters.max_price) queryParams.max_price = filters.max_price;
      if (filters.min_discount) queryParams.min_discount = filters.min_discount;
      if (filters.is_available) queryParams.is_available = filters.is_available;
      if (filters.ordering) queryParams.ordering = filters.ordering;

      console.log("🔍 Fetching filtered products:", { endpoint, queryParams, isOwnerProfile });

      const response = await apiServer(
        'get',
        endpoint,
        queryParams,
        {
          tokenRequired: isOwnerProfile,
          showNotification: false,
          showErrorNotification: true
        }
      );

      console.log("✅ Filtered products response:", response);

      if (!response.error) {
        const productsData = response.results || response.data?.results || response.data || [];
        const count = response.count || response.data?.count || 0;
        
        // ✅ PAGINATION FIX: Debug logging
        console.log("📊 Pagination Debug:", {
          productsCount: productsData.length,
          totalCount: count,
          currentPage,
          itemsPerPage: ITEMS_PER_PAGE,
          calculatedPages: Math.ceil(count / ITEMS_PER_PAGE)
        });
        
        setFilteredProducts(Array.isArray(productsData) ? productsData : []);
        setTotalResults(count);
        // ✅ PAGINATION FIX: Calculate pages based on backend page size
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      } else {
        setAdvancedError(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error("❌ Error fetching filtered products:", err);
      setAdvancedError(err.response?.data?.message || err.message || 'Failed to fetch products');
    } finally {
      setAdvancedLoading(false);
    }
  };

  const updateUrlParams = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (currentPage > 1) params.set('page', currentPage);
    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      min_price: '',
      max_price: '',
      min_discount: '',
      is_available: '',
      ordering: '-created_at'
    });
    setSearchInput('');
    setPriceRange({ min: 0, max: 10000 });
    setCurrentPage(1);
  };

  const removeFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: '' }));
    if (key === 'search') setSearchInput('');
  };

  const handleProductClick = (product) => {
    console.log('handleProductClick called with:', product);
    console.log('Navigating to:', `/products/${product.id}`);
    navigate(`/products/${product.id}`);
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) =>
      value && key !== 'ordering'
    ).length;
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center  space-x-1 mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded-lg font-medium ${currentPage === page
              ? 'bg-emerald-600 text-white'
              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value=""
              checked={!filters.category}
              onChange={() => handleFilterChange('category', '')}
              className="mr-2 text-emerald-600"
            />
            All Categories
          </label>
          {categories.map(category => (
            <label key={category.id} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category.id}
                checked={filters.category === category.id.toString()}
                onChange={() => handleFilterChange('category', category.id.toString())}
                className="mr-2 text-emerald-600"
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 10000 }))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={() => {
                handleFilterChange('min_price', priceRange.min.toString());
                handleFilterChange('max_price', priceRange.max.toString());
              }}
              className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Availability Filter */}
      <div>
        <h3 className="font-semibold  text-gray-900 mb-3">Availability</h3>
        <div className="space-y-2 cursor-pointer ">
          <label className="flex items-center ">
            <input
              type="radio"
              name="availability"
              value=""
              checked={!filters.is_available}
              onChange={() => handleFilterChange('is_available', '')}
              className="mr-2 text-emerald-600 "
            />
            All Products
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="availability"
              value="true"
              checked={filters.is_available === 'true'}
              onChange={() => handleFilterChange('is_available', 'true')}
              className="mr-2 text-emerald-600"
            />
            In Stock
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="availability"
              value="false"
              checked={filters.is_available === 'false'}
              onChange={() => handleFilterChange('is_available', 'false')}
              className="mr-2 text-emerald-600"
            />
            Out of Stock
          </label>
        </div>
      </div>

      {/* Discount Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Minimum Discount</h3>
        <div className="space-y-2">
          {[10, 30, 50].map(discount => (
            <label key={discount} className="flex items-center">
              <input
                type="radio"
                name="discount"
                value={discount}
                checked={filters.min_discount === discount.toString()}
                onChange={() => handleFilterChange('min_discount', discount.toString())}
                className="mr-2 text-emerald-600"
              />
              {discount}%+ Off
            </label>
          ))}
        </div>
      </div>

      {/* City Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
        <select
          value={filters.city}
          onChange={(e) => handleFilterChange('city', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">All Cities</option>
          {Array.isArray(cities) && cities.map(city => (
            <option key={city.id} value={city.id}>{city.name}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // Determine which loading/error state to show
  const isLoading = hookLoading || advancedLoading;
  const currentError = hookError || advancedError;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="relative h-96 bg-gradient-to-r from-emerald-800 to-teal-800 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop')"
          }}
        ></div>
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {isOwnerProfile ? "My" : "Explore"} <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">Products</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
              {isOwnerProfile 
                ? "Manage your product listings and inventory with ease."
                : "Discover authentic products from the heart of Gilgit-Baltistan. From premium dry fruits to traditional handicrafts."
              }
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {renderFilters()}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Sort Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, category or city..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={filters.ordering}
                    onChange={(e) => handleFilterChange('ordering', e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="-created_at">Latest</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-discount_price">Discounted First</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-white text-emerald-600 rounded-full px-2 py-1 text-xs font-semibold">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {getActiveFiltersCount() > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || key === 'ordering') return null;

                  let displayValue = value;
                  if (key === 'category') {
                    const cat = categories.find(c => c.id.toString() === value);
                    displayValue = cat ? cat.name : value;
                  } else if (key === 'city') {
                    const city = cities.find(c => c.id.toString() === value);
                    displayValue = city ? city.name : value;
                  } else if (key === 'min_discount') {
                    displayValue = `${value}%+ Off`;
                  } else if (key === 'is_available') {
                    displayValue = value === 'true' ? 'In Stock' : 'Out of Stock';
                  }

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                    >
                      {displayValue}
                      <button
                        onClick={() => removeFilter(key)}
                        className="hover:text-emerald-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {totalResults} results
                {filters.search && ` for "${filters.search}"`}
              </p>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader />
              </div>
            ) : currentError ? (
              <ErrorMessage message={currentError} />
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {isOwnerProfile ? "No products found" : "No products found"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isOwnerProfile 
                    ? "You haven't added any products yet."
                    : "Try adjusting your filters or search terms"
                  }
                </p>
                {!isOwnerProfile && (
                  <button
                    onClick={clearAllFilters}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showActions={isOwnerProfile}
                      onViewDetails={handleProductClick}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto h-full pb-20">
              {renderFilters()}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
              <div className="flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListPage;

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Search,
//   Filter,
//   X,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   Grid,
//   List,
//   MapPin,
//   Package
// } from 'lucide-react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import ProductCard from '../components/ProductCard';
// import Loader from '../components/common/Loader';
// import ErrorMessage from '../components/common/ErrorMessage';
// import useProducts from '../hooks/useProducts';
// import apiServer from '../utils/apiServer';
// import API_ROUTES from '../apiRoutes';

// const ProductListPage = ({ isOwnerProfile = false }) => { // ✅ Added prop for owner profile
//   const navigate = useNavigate();
//   const [searchParams, setSearchParams] = useSearchParams();

//   // Filter states
//   const [filters, setFilters] = useState({
//     search: searchParams.get('search') || '',
//     category: searchParams.get('category') || '',
//     city: searchParams.get('city') || '',
//     min_price: searchParams.get('min_price') || '',
//     max_price: searchParams.get('max_price') || '',
//     min_discount: searchParams.get('min_discount') || '',
//     is_available: searchParams.get('is_available') || '',
//     ordering: searchParams.get('ordering') || '-created_at'
//   });

//   // UI state
//   const [showMobileFilters, setShowMobileFilters] = useState(false);
//   const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
//   const [searchInput, setSearchInput] = useState(filters.search);
//   const [priceRange, setPriceRange] = useState({
//     min: parseInt(filters.min_price) || 0,
//     max: parseInt(filters.max_price) || 10000
//   });

//   // Advanced filtering state (for custom API calls)
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [totalResults, setTotalResults] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const [advancedLoading, setAdvancedLoading] = useState(false);
//   const [advancedError, setAdvancedError] = useState(null);
//   const [cities, setCities] = useState([]);

//   // Use the hook for basic data and categories
//   const { 
//     categories, 
//     loading: hookLoading, 
//     error: hookError 
//   } = useProducts({ fetchCategories: true });

//   // Check if we need advanced filtering
//   const hasActiveFilters = () => {
//     return filters.search || filters.category || filters.city || 
//            filters.min_price || filters.max_price || filters.min_discount || 
//            filters.is_available || filters.ordering !== '-created_at';
//   };

//   // Debounced search
//   const debounce = (func, wait) => {
//     let timeout;
//     return function executedFunction(...args) {
//       const later = () => {
//         clearTimeout(timeout);
//         func(...args);
//       };
//       clearTimeout(timeout);
//       timeout = setTimeout(later, wait);
//     };
//   };

//   const debouncedSearch = useCallback(
//     debounce((searchTerm) => {
//       setFilters(prev => ({ ...prev, search: searchTerm }));
//       setCurrentPage(1);
//     }, 300),
//     []
//   );

//   useEffect(() => {
//     debouncedSearch(searchInput);
//   }, [searchInput, debouncedSearch]);

//   // Fetch cities
//   useEffect(() => {
//     fetchCities();
//   }, []);

//   // Fetch products when filters change
//   useEffect(() => {
//     if (hasActiveFilters()) {
//       fetchFilteredProducts();
//     } else {
//       fetchDefaultProducts();
//     }
//     updateUrlParams();
//   }, [filters, currentPage, isOwnerProfile]); // ✅ Added isOwnerProfile dependency

//   const fetchCities = async () => {
//     try {
//       // ✅ Fixed: Use correct apiServer signature
//       const response = await apiServer(
//         'get',
//         API_ROUTES.CITIES,
//         {},
//         {
//           tokenRequired: false,
//           showNotification: false,
//           showErrorNotification: false
//         }
//       );
      
//       if (!response.error) {
//         const citiesData = response.data?.results || response.data || response || [];
//         setCities(Array.isArray(citiesData) ? citiesData : []);
//         console.log("✅ Cities loaded:", citiesData.length);
//       }
//     } catch (err) {
//       console.error("❌ Error fetching cities:", err);
//     }
//   };

//   const fetchDefaultProducts = async () => {
//     try {
//       setAdvancedLoading(true);
//       setAdvancedError(null);

//       // ✅ Choose endpoint based on owner profile
//       let endpoint = API_ROUTES.PRODUCTS;
//       if (isOwnerProfile) {
//         endpoint = API_ROUTES.MY_PRODUCTS;
//       }

//       // ✅ Build query parameters
//       const queryParams = {
//         page: currentPage,
//         page_size: 9 // 3x3 grid
//       };

//       console.log("🛒 Fetching default products:", { endpoint, queryParams, isOwnerProfile });

//       // ✅ Fixed: Use correct apiServer signature
//       const response = await apiServer(
//         'get',
//         endpoint,
//         queryParams,
//         {
//           tokenRequired: isOwnerProfile, // ✅ Token required only for owner profile
//           showNotification: false,
//           showErrorNotification: true
//         }
//       );

//       console.log("✅ Default products response:", response);

//       if (!response.error) {
//         // ✅ Fixed: Handle response structure correctly
//         const productsData = response.results || response.data?.results || response.data || [];
//         setFilteredProducts(Array.isArray(productsData) ? productsData : []);
//         setTotalResults(response.count || response.data?.count || productsData.length || 0);
//         setTotalPages(Math.ceil((response.count || response.data?.count || productsData.length || 0) / 9));
//       } else {
//         setAdvancedError(response.message || 'Failed to fetch products');
//       }
//     } catch (err) {
//       console.error("❌ Error fetching default products:", err);
//       setAdvancedError(err.response?.data?.message || err.message || 'Failed to fetch products');
//     } finally {
//       setAdvancedLoading(false);
//     }
//   };

//   const fetchFilteredProducts = async () => {
//     try {
//       setAdvancedLoading(true);
//       setAdvancedError(null);

//       // ✅ Choose endpoint based on owner profile
//       let endpoint = API_ROUTES.PRODUCTS;
//       if (isOwnerProfile) {
//         endpoint = API_ROUTES.MY_PRODUCTS;
//       }

//       // ✅ Build query parameters object
//       const queryParams = {
//         page: currentPage,
//         page_size: 9
//       };

//       // Add filters to params
//       if (filters.search) queryParams.search = filters.search;
//       if (filters.category) queryParams.category = filters.category;
//       if (filters.city) queryParams.city = filters.city;
//       if (filters.min_price) queryParams.min_price = filters.min_price;
//       if (filters.max_price) queryParams.max_price = filters.max_price;
//       if (filters.min_discount) queryParams.min_discount = filters.min_discount;
//       if (filters.is_available) queryParams.is_available = filters.is_available;
//       if (filters.ordering) queryParams.ordering = filters.ordering;

//       console.log("🔍 Fetching filtered products:", { endpoint, queryParams, isOwnerProfile });

//       // ✅ Fixed: Use correct apiServer signature
//       const response = await apiServer(
//         'get',
//         endpoint,
//         queryParams,
//         {
//           tokenRequired: isOwnerProfile, // ✅ Token required only for owner profile
//           showNotification: false,
//           showErrorNotification: true
//         }
//       );

//       console.log("✅ Filtered products response:", response);

//       if (!response.error) {
//         // ✅ Fixed: Handle response structure correctly
//         const productsData = response.results || response.data?.results || response.data || [];
//         setFilteredProducts(Array.isArray(productsData) ? productsData : []);
//         setTotalResults(response.count || response.data?.count || productsData.length || 0);
//         setTotalPages(Math.ceil((response.count || response.data?.count || productsData.length || 0) / 9));
//       } else {
//         setAdvancedError(response.message || 'Failed to fetch products');
//       }
//     } catch (err) {
//       console.error("❌ Error fetching filtered products:", err);
//       setAdvancedError(err.response?.data?.message || err.message || 'Failed to fetch products');
//     } finally {
//       setAdvancedLoading(false);
//     }
//   };

//   const updateUrlParams = () => {
//     const params = new URLSearchParams();
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value) params.set(key, value);
//     });
//     if (currentPage > 1) params.set('page', currentPage);
//     setSearchParams(params);
//   };

//   const handleFilterChange = (key, value) => {
//     setFilters(prev => ({ ...prev, [key]: value }));
//     setCurrentPage(1);
//   };

//   const clearAllFilters = () => {
//     setFilters({
//       search: '',
//       category: '',
//       city: '',
//       min_price: '',
//       max_price: '',
//       min_discount: '',
//       is_available: '',
//       ordering: '-created_at'
//     });
//     setSearchInput('');
//     setPriceRange({ min: 0, max: 10000 });
//     setCurrentPage(1);
//   };

//   const removeFilter = (key) => {
//     setFilters(prev => ({ ...prev, [key]: '' }));
//     if (key === 'search') setSearchInput('');
//   };

//   const handleProductClick = (product) => {
//     console.log('handleProductClick called with:', product);
//     console.log('Navigating to:', `/products/${product.id}`);
//     navigate(`/products/${product.id}`);
//   };

//   const getActiveFiltersCount = () => {
//     return Object.entries(filters).filter(([key, value]) =>
//       value && key !== 'ordering'
//     ).length;
//   };

//   const renderPagination = () => {
//     const pages = [];
//     const maxVisiblePages = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

//     if (endPage - startPage < maxVisiblePages - 1) {
//       startPage = Math.max(1, endPage - maxVisiblePages + 1);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }

//     return (
//       <div className="flex items-center justify-center space-x-1 mt-8">
//         <button
//           onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//           disabled={currentPage === 1}
//           className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <ChevronLeft className="w-4 h-4" />
//         </button>

//         {pages.map(page => (
//           <button
//             key={page}
//             onClick={() => setCurrentPage(page)}
//             className={`px-4 py-2 rounded-lg font-medium ${currentPage === page
//               ? 'bg-emerald-600 text-white'
//               : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
//               }`}
//           >
//             {page}
//           </button>
//         ))}

//         <button
//           onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
//           disabled={currentPage === totalPages}
//           className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <ChevronRight className="w-4 h-4" />
//         </button>
//       </div>
//     );
//   };

//   const renderFilters = () => (
//     <div className="space-y-6">
//       {/* Category Filter */}
//       <div>
//         <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
//         <div className="space-y-2">
//           <label className="flex items-center">
//             <input
//               type="radio"
//               name="category"
//               value=""
//               checked={!filters.category}
//               onChange={() => handleFilterChange('category', '')}
//               className="mr-2 text-emerald-600"
//             />
//             All Categories
//           </label>
//           {categories.map(category => (
//             <label key={category.id} className="flex items-center">
//               <input
//                 type="radio"
//                 name="category"
//                 value={category.id}
//                 checked={filters.category === category.id.toString()}
//                 onChange={() => handleFilterChange('category', category.id.toString())}
//                 className="mr-2 text-emerald-600"
//               />
//               {category.name}
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* Price Range */}
//       <div>
//         <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
//         <div className="space-y-3">
//           <div className="flex items-center space-x-2">
//             <input
//               type="number"
//               placeholder="Min"
//               value={priceRange.min}
//               onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
//               className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
//             />
//             <span>-</span>
//             <input
//               type="number"
//               placeholder="Max"
//               value={priceRange.max}
//               onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 10000 }))}
//               className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
//             />
//             <button
//               onClick={() => {
//                 handleFilterChange('min_price', priceRange.min.toString());
//                 handleFilterChange('max_price', priceRange.max.toString());
//               }}
//               className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
//             >
//               Apply
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Availability Filter */}
//       <div>
//         <h3 className="font-semibold text-gray-900 mb-3">Availability</h3>
//         <div className="space-y-2">
//           <label className="flex items-center">
//             <input
//               type="radio"
//               name="availability"
//               value=""
//               checked={!filters.is_available}
//               onChange={() => handleFilterChange('is_available', '')}
//               className="mr-2 text-emerald-600"
//             />
//             All Products
//           </label>
//           <label className="flex items-center">
//             <input
//               type="radio"
//               name="availability"
//               value="true"
//               checked={filters.is_available === 'true'}
//               onChange={() => handleFilterChange('is_available', 'true')}
//               className="mr-2 text-emerald-600"
//             />
//             In Stock
//           </label>
//           <label className="flex items-center">
//             <input
//               type="radio"
//               name="availability"
//               value="false"
//               checked={filters.is_available === 'false'}
//               onChange={() => handleFilterChange('is_available', 'false')}
//               className="mr-2 text-emerald-600"
//             />
//             Out of Stock
//           </label>
//         </div>
//       </div>

//       {/* Discount Filter */}
//       <div>
//         <h3 className="font-semibold text-gray-900 mb-3">Minimum Discount</h3>
//         <div className="space-y-2">
//           {[10, 30, 50].map(discount => (
//             <label key={discount} className="flex items-center">
//               <input
//                 type="radio"
//                 name="discount"
//                 value={discount}
//                 checked={filters.min_discount === discount.toString()}
//                 onChange={() => handleFilterChange('min_discount', discount.toString())}
//                 className="mr-2 text-emerald-600"
//               />
//               {discount}%+ Off
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* City Filter */}
//       <div>
//         <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
//         <select
//           value={filters.city}
//           onChange={(e) => handleFilterChange('city', e.target.value)}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//         >
//           <option value="">All Cities</option>
//           {Array.isArray(cities) && cities.map(city => (
//             <option key={city.id} value={city.id}>{city.name}</option>
//           ))}
//         </select>
//       </div>
//     </div>
//   );

//   // Determine which loading/error state to show
//   const isLoading = hookLoading || advancedLoading;
//   const currentError = hookError || advancedError;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <section className="relative h-96 bg-gradient-to-r from-emerald-800 to-teal-800 overflow-hidden">
//         <div
//           className="absolute inset-0 bg-cover bg-center opacity-30"
//           style={{
//             backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop')"
//           }}
//         ></div>
//         <div className="absolute inset-0 bg-black/20"></div>

//         <div className="relative z-10 flex items-center justify-center h-full">
//           <div className="text-center text-white px-4 max-w-4xl">
//             <h1 className="text-5xl md:text-6xl font-bold mb-6">
//               {isOwnerProfile ? "My" : "Explore"} <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">Products</span>
//             </h1>
//             <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
//               {isOwnerProfile 
//                 ? "Manage your product listings and inventory with ease."
//                 : "Discover authentic products from the heart of Gilgit-Baltistan. From premium dry fruits to traditional handicrafts."
//               }
//             </p>
//           </div>
//         </div>
//       </section>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Sidebar Filters - Desktop */}
//           <div className="hidden lg:block w-80 flex-shrink-0">
//             <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
//                 {getActiveFiltersCount() > 0 && (
//                   <button
//                     onClick={clearAllFilters}
//                     className="text-emerald-600 hover:text-emerald-700 font-medium"
//                   >
//                     Clear All
//                   </button>
//                 )}
//               </div>
//               {renderFilters()}
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="flex-1">
//             {/* Search and Sort Bar */}
//             <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
//               <div className="flex flex-col sm:flex-row gap-4">
//                 {/* Search Bar */}
//                 <div className="flex-1 relative">
//                   <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search by name, category or city..."
//                     value={searchInput}
//                     onChange={(e) => setSearchInput(e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                   />
//                 </div>

//                 {/* Sort Dropdown */}
//                 <div className="relative">
//                   <select
//                     value={filters.ordering}
//                     onChange={(e) => handleFilterChange('ordering', e.target.value)}
//                     className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                   >
//                     <option value="-created_at">Latest</option>
//                     <option value="price">Price: Low to High</option>
//                     <option value="-price">Price: High to Low</option>
//                     <option value="-discount_price">Discounted First</option>
//                   </select>
//                   <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
//                 </div>

//                 {/* Mobile Filter Button */}
//                 <button
//                   onClick={() => setShowMobileFilters(true)}
//                   className="lg:hidden flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
//                 >
//                   <Filter className="w-5 h-5" />
//                   Filters
//                   {getActiveFiltersCount() > 0 && (
//                     <span className="bg-white text-emerald-600 rounded-full px-2 py-1 text-xs font-semibold">
//                       {getActiveFiltersCount()}
//                     </span>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Active Filters */}
//             {getActiveFiltersCount() > 0 && (
//               <div className="flex flex-wrap gap-2 mb-6">
//                 {Object.entries(filters).map(([key, value]) => {
//                   if (!value || key === 'ordering') return null;

//                   let displayValue = value;
//                   if (key === 'category') {
//                     const cat = categories.find(c => c.id.toString() === value);
//                     displayValue = cat ? cat.name : value;
//                   } else if (key === 'city') {
//                     const city = cities.find(c => c.id.toString() === value);
//                     displayValue = city ? city.name : value;
//                   } else if (key === 'min_discount') {
//                     displayValue = `${value}%+ Off`;
//                   } else if (key === 'is_available') {
//                     displayValue = value === 'true' ? 'In Stock' : 'Out of Stock';
//                   }

//                   return (
//                     <span
//                       key={key}
//                       className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
//                     >
//                       {displayValue}
//                       <button
//                         onClick={() => removeFilter(key)}
//                         className="hover:text-emerald-900"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </span>
//                   );
//                 })}
//               </div>
//             )}

//             {/* Results Count */}
//             <div className="mb-6">
//               <p className="text-gray-600">
//                 Showing {filteredProducts.length} of {totalResults} results
//                 {filters.search && ` for "${filters.search}"`}
//               </p>
//             </div>

//             {/* Products Grid */}
//             {isLoading ? (
//               <div className="flex justify-center items-center py-16">
//                 <Loader />
//               </div>
//             ) : currentError ? (
//               <ErrorMessage message={currentError} />
//             ) : filteredProducts.length === 0 ? (
//               <div className="text-center py-16">
//                 <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-600 mb-2">
//                   {isOwnerProfile ? "No products found" : "No products found"}
//                 </h3>
//                 <p className="text-gray-500 mb-6">
//                   {isOwnerProfile 
//                     ? "You haven't added any products yet."
//                     : "Try adjusting your filters or search terms"
//                   }
//                 </p>
//                 {!isOwnerProfile && (
//                   <button
//                     onClick={clearAllFilters}
//                     className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700"
//                   >
//                     Clear Filters
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {filteredProducts.map(product => (
//                     <ProductCard
//                       key={product.id}
//                       product={product}
//                       showActions={isOwnerProfile}
//                       onViewDetails={handleProductClick}
//                     />
//                   ))}
//                 </div>

//                 {/* Pagination */}
//                 {totalPages > 1 && renderPagination()}
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Mobile Filter Drawer */}
//       {showMobileFilters && (
//         <div className="fixed inset-0 z-50 lg:hidden">
//           <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
//           <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform">
//             <div className="flex items-center justify-between p-6 border-b">
//               <h2 className="text-xl font-semibold">Filters</h2>
//               <button
//                 onClick={() => setShowMobileFilters(false)}
//                 className="p-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             <div className="p-6 overflow-y-auto h-full pb-20">
//               {renderFilters()}
//             </div>
//             <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
//               <div className="flex gap-3">
//                 <button
//                   onClick={clearAllFilters}
//                   className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
//                 >
//                   Clear All
//                 </button>
//                 <button
//                   onClick={() => setShowMobileFilters(false)}
//                   className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
//                 >
//                   Apply
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductListPage;