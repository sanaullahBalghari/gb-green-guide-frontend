
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import apiServer from "../../utils/apiServer";
import API_ROUTES from "../../apiRoutes";

const AddEditForm = ({ editingItem, setShowAddForm, restaurants, setRestaurants, products, setProducts }) => {
  const [formData, setFormData] = useState(() => {
    if (editingItem?.item) {
      // Pre-populate form for editing
      const item = editingItem.item;
      if (editingItem.type === 'restaurant') {
        return {
          name: item.name || '',
          restaurant_type: item.restaurant_type || '',
          city: item.city || '',
          location_inside_city: item.location_inside_city || '',
          description: item.description || '',
          room_available: item.room_available || false,
          is_active: item.is_active || false,
          contacts_and_hours: Array.isArray(item.contacts_and_hours)
            ? item.contacts_and_hours.join(', ')
            : item.contacts_and_hours || '',
          amenities: Array.isArray(item.amenities)
            ? item.amenities.join(', ')
            : item.amenities || '',
          get_direction: item.get_direction || '',
          whatsapp_number: item.whatsapp_number || '',
          image: null // For file upload
        };
      } else {
        // Product editing
        return {
          name: item.name || '',
          category: item.category?.id || item.category || '',
          city: item.city?.id || item.city || '',
          price: item.price || '',
          discount_price: item.discount_price || '',
          stock: item.stock || '',
          is_available: item.is_available !== undefined ? item.is_available : true,
          description: item.description || '',
          image: null // For file upload
        };
      }
    }

    // Default empty form
    return editingItem?.type === 'restaurant'
      ? {
        name: '',
        restaurant_type: '',
        city: '',
        location_inside_city: '',
        description: '',
        room_available: false,
        is_active: false,
        contacts_and_hours: '',
        amenities: '',
        get_direction: '',
        whatsapp_number: '',
        image: null
      }
      : {
        name: '',
        category: '',
        city: '',
        price: '',
        discount_price: '',
        stock: '',
        is_available: true,
        description: '',
        image: null
      };
  });

  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!editingItem?.item;
  const isRestaurant = editingItem?.type === 'restaurant';

  // Fetch cities and categories
  useEffect(() => {
    if (isRestaurant) {
      fetchCities();
    } else {
      fetchCities();
      fetchCategories();
    }
  }, [isRestaurant]);

  const fetchCities = async () => {
    try {
      const response = await apiServer(
        'get',
        API_ROUTES.CITIES,
        {},
        {
          tokenRequired: false,
          showNotification: false,
          showErrorNotification: true,
        }
      );

      const citiesData = Array.isArray(response)
        ? response
        : response?.results || [];
      setCities(citiesData);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiServer(
        'get',
        API_ROUTES.PRODUCT_CATEGORIES,
        {},
        {
          tokenRequired: false,
          showNotification: false,
          showErrorNotification: true,
        }
      );

      const categoriesData = Array.isArray(response)
        ? response
        : response?.results || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (isRestaurant) {
      await handleRestaurantSubmit();
    } else {
      await handleProductSubmit();
    }

    setLoading(false);
  };

  const handleRestaurantSubmit = async () => {
    try {
      // Prepare form data for API
      const submitData = new FormData();

      // Basic fields
      submitData.append('name', formData.name);
      submitData.append('restaurant_type', formData.restaurant_type);
      submitData.append('city', formData.city);
      submitData.append('location_inside_city', formData.location_inside_city);
      submitData.append('description', formData.description);
      submitData.append('room_available', formData.room_available);
      submitData.append('is_active', formData.is_active);
      submitData.append('get_direction', formData.get_direction);
      submitData.append('whatsapp_number', formData.whatsapp_number);

      // Convert comma-separated strings to arrays for JSON fields
      if (formData.contacts_and_hours) {
        const contactsArray = formData.contacts_and_hours.split(',').map(item => item.trim()).filter(item => item);
        submitData.append('contacts_and_hours', JSON.stringify(contactsArray));
      }

      if (formData.amenities) {
        const amenitiesArray = formData.amenities.split(',').map(item => item.trim()).filter(item => item);
        submitData.append('amenities', JSON.stringify(amenitiesArray));
      }

      // Handle image upload
      if (formData.image instanceof File) {
        submitData.append('image', formData.image);
      }

      let response;
      if (isEditing) {
        // Update restaurant
        response = await apiServer(
          'patch',
          `${API_ROUTES.RESTAURANTS}${editingItem.item.id}/`,
          submitData,
          {
            tokenRequired: true,
            showNotification: true,
            showErrorNotification: false, // Handle errors manually
          }
        );
      } else {
        // Create restaurant
        response = await apiServer(
          'post',
          API_ROUTES.RESTAURANTS,
          submitData,
          {
            tokenRequired: true,
            showNotification: true,
            showErrorNotification: false, // Handle errors manually
          }
        );
      }

      // Success - update local state
      if (isEditing) {
        setRestaurants(restaurants.map(r =>
          r.id === editingItem.item.id
            ? { ...r, ...response }
            : r
        ));
      } else {
        setRestaurants([response, ...restaurants]);
      }
      setShowAddForm(false);

    } catch (error) {
      console.error('Error submitting restaurant:', error);
      
      // Handle validation errors
      if (error.response?.status === 400 && error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: error.message || 'An unexpected error occurred' });
      }
    }
  };

  const handleProductSubmit = async () => {
    try {
      // Prepare form data for API
      const submitData = new FormData();

      // Basic fields
      submitData.append('name', formData.name);
      submitData.append('category_id', formData.category);
      submitData.append('city_id', formData.city);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock);
      submitData.append('is_available', formData.is_available);
      submitData.append('description', formData.description);

      // Optional discount price
      if (formData.discount_price) {
        submitData.append('discount_price', formData.discount_price);
      }

      // Handle image upload
      if (formData.image instanceof File) {
        submitData.append('image', formData.image);
      }

      let response;
      if (isEditing) {
        // Update product
        response = await apiServer(
          'patch',
          `${API_ROUTES.PRODUCTS}${editingItem.item.id}/`,
          submitData,
          {
            tokenRequired: true,
            showNotification: true,
            showErrorNotification: false, // Handle errors manually
          }
        );
      } else {
        // Create product
        response = await apiServer(
          'post',
          API_ROUTES.PRODUCTS,
          submitData,
          {
            tokenRequired: true,
            showNotification: true,
            showErrorNotification: false, // Handle errors manually
          }
        );
      }

      // Success - update local state
      if (isEditing) {
        setProducts(products.map(p =>
          p.id === editingItem.item.id
            ? { ...p, ...response }
            : p
        ));
      } else {
        setProducts([response, ...products]);
      }
      setShowAddForm(false);

    } catch (error) {
      console.error('Error submitting product:', error);
      
      // Handle validation errors
      if (error.response?.status === 400 && error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: error.message || 'An unexpected error occurred' });
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit' : 'Add'} {isRestaurant ? 'Restaurant' : 'Product'}
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRestaurant ? 'Restaurant Name' : 'Product Name'} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder={`Enter ${isRestaurant ? 'restaurant' : 'product'} name`}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
            )}
          </div>

          {/* Restaurant specific fields */}
          {isRestaurant && (
            <>
              {/* Restaurant Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Type *</label>
                <select
                  value={formData.restaurant_type}
                  onChange={(e) => setFormData({ ...formData, restaurant_type: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.restaurant_type ? 'border-red-300' : 'border-gray-300'
                    }`}
                  required
                >
                  <option value="">Select restaurant type</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="hotel">Hotel & Guest House</option>
                  <option value="local_traditional">Local & Traditional</option>
                  <option value="cafe">Cafe</option>
                </select>
                {errors.restaurant_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.restaurant_type[0]}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select city</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city[0]}</p>
                )}
              </div>

              {/* Location Inside City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location Inside City</label>
                <input
                  type="text"
                  value={formData.location_inside_city}
                  onChange={(e) => setFormData({ ...formData, location_inside_city: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.location_inside_city ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="e.g., Near Main Bazaar, City Center"
                />
                {errors.location_inside_city && (
                  <p className="mt-1 text-sm text-red-600">{errors.location_inside_city[0]}</p>
                )}
              </div>

              {/* Room Available */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="room_available"
                  checked={formData.room_available}
                  onChange={(e) => setFormData({ ...formData, room_available: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="room_available" className="ml-2 block text-sm text-gray-900">
                  Room Available
                </label>
              </div>

              {/* is_active */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Is Active
                </label>
              </div>

              {/* Contacts and Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contacts & Hours
                </label>
                <textarea
                  value={formData.contacts_and_hours}
                  onChange={(e) => setFormData({ ...formData, contacts_and_hours: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.contacts_and_hours ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Enter contact details and opening hours separated by commas (e.g., +92 300 1234567, Open 9 AM - 11 PM, info@restaurant.com)"
                />
                {errors.contacts_and_hours && (
                  <p className="mt-1 text-sm text-red-600">{errors.contacts_and_hours[0]}</p>
                )}
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <textarea
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.amenities ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Enter amenities separated by commas (e.g., WiFi, Parking, AC, Garden Seating)"
                />
                {errors.amenities && (
                  <p className="mt-1 text-sm text-red-600">{errors.amenities[0]}</p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                <input
                  type="text"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.whatsapp_number ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="923001234567 (without + sign)"
                />
                {errors.whatsapp_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.whatsapp_number[0]}</p>
                )}
              </div>

              {/* Get Direction URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Direction URL</label>
                <input
                  type="url"
                  value={formData.get_direction}
                  onChange={(e) => setFormData({ ...formData, get_direction: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.get_direction ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="https://maps.google.com/..."
                />
                {errors.get_direction && (
                  <p className="mt-1 text-sm text-red-600">{errors.get_direction[0]}</p>
                )}
              </div>

              {/* Restaurant Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.image ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image[0]}</p>
                )}
              </div>
            </>

          )}

          {/* Product specific fields */}
          {!isRestaurant && (
            <>
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category[0]}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: Number(e.target.value) })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select city</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city[0]}</p>
                )}
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="0.00"
                    required
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price[0]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.discount_price ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="0.00 (optional)"
                  />
                  {errors.discount_price && (
                    <p className="mt-1 text-sm text-red-600">{errors.discount_price[0]}</p>
                  )}
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.stock ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="0"
                  required
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock[0]}</p>
                )}
              </div>

              {/* Is Available */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                  Available for Sale
                </label>
              </div>

              {/* Product Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.image ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image[0]}</p>
                )}
              </div>
            </>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder={`Describe your ${isRestaurant ? 'restaurant' : 'product'}...`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : `${isEditing ? 'Update' : 'Add'} ${isRestaurant ? 'Restaurant' : 'Product'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditForm;
// import React, { useState, useEffect } from "react";
// import { X } from "lucide-react";
// import apiServer from "../../utils/apiServer"; // Adjust path as needed
// import API_ROUTES from "../../apiRoutes"; // Adjust path as needed

// const AddEditForm = ({ editingItem, setShowAddForm, restaurants, setRestaurants, products, setProducts }) => {
//   const [formData, setFormData] = useState(() => {
//     if (editingItem?.item) {
//       // Pre-populate form for editing
//       const item = editingItem.item;
//       if (editingItem.type === 'restaurant') {
//         return {
//           name: item.name || '',
//           restaurant_type: item.restaurant_type || '',
//           city: item.city || '',
//           location_inside_city: item.location_inside_city || '',
//           description: item.description || '',
//           room_available: item.room_available || false,
//           is_active: item.is_active || false,
//           contacts_and_hours: Array.isArray(item.contacts_and_hours)
//             ? item.contacts_and_hours.join(', ')
//             : item.contacts_and_hours || '',
//           amenities: Array.isArray(item.amenities)
//             ? item.amenities.join(', ')
//             : item.amenities || '',
//           get_direction: item.get_direction || '',
//           whatsapp_number: item.whatsapp_number || '',
//           image: null // For file upload
//         };
//       } else {
//         // Product editing
//         return {
//           name: item.name || '',
//           category: item.category?.id || item.category || '',
//           city: item.city?.id || item.city || '',
//           price: item.price || '',
//           discount_price: item.discount_price || '',
//           stock: item.stock || '',
//           is_available: item.is_available !== undefined ? item.is_available : true,
//           description: item.description || '',
//           image: null // For file upload
//         };
//       }
//     }

//     // Default empty form
//     return editingItem?.type === 'restaurant'
//       ? {
//         name: '',
//         restaurant_type: '',
//         city: '',
//         location_inside_city: '',
//         description: '',
//         room_available: false,
//         is_active: false,
//         contacts_and_hours: '',
//         amenities: '',
//         get_direction: '',
//         whatsapp_number: '',
//         image: null
//       }
//       : {
//         name: '',
//         category: '',
//         city: '',
//         price: '',
//         discount_price: '',
//         stock: '',
//         is_available: true,
//         description: '',
//         image: null
//       };
//   });

//   const [cities, setCities] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   const isEditing = !!editingItem?.item;
//   const isRestaurant = editingItem?.type === 'restaurant';

//   // Fetch cities and categories
//   useEffect(() => {
//     if (isRestaurant) {
//       fetchCities();
//     } else {
//       fetchCities();
//       fetchCategories();
//     }
//   }, [isRestaurant]);

//   const fetchCities = async () => {
//     try {
//       const response = await apiServer(API_ROUTES.CITIES, 'GET');
//       if (!response.error) {
//         const citiesData = Array.isArray(response.data)
//           ? response.data
//           : response.data?.results || [];
//         setCities(citiesData);
//       }
//     } catch (error) {
//       console.error('Error fetching cities:', error);
//     }
//   };


//   const fetchCategories = async () => {
//     try {
//       const response = await apiServer(API_ROUTES.PRODUCT_CATEGORIES, 'GET');
//       if (!response.error) {
//         const categoriesData = Array.isArray(response.data)
//           ? response.data
//           : response.data?.results || [];
//         setCategories(categoriesData);
//       }
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//     }
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrors({});

//     if (isRestaurant) {
//       await handleRestaurantSubmit();
//     } else {
//       await handleProductSubmit();
//     }

//     setLoading(false);
//   };

//   const handleRestaurantSubmit = async () => {
//     try {
//       // Prepare form data for API
//       const submitData = new FormData();

//       // Basic fields
//       submitData.append('name', formData.name);
//       submitData.append('restaurant_type', formData.restaurant_type);
//       submitData.append('city', formData.city);
//       submitData.append('location_inside_city', formData.location_inside_city);
//       submitData.append('description', formData.description);
//       submitData.append('room_available', formData.room_available);
//       submitData.append('is_active', formData.is_active);
//       submitData.append('get_direction', formData.get_direction);
//       submitData.append('whatsapp_number', formData.whatsapp_number);

//       // Convert comma-separated strings to arrays for JSON fields
//       if (formData.contacts_and_hours) {
//         const contactsArray = formData.contacts_and_hours.split(',').map(item => item.trim()).filter(item => item);
//         submitData.append('contacts_and_hours', JSON.stringify(contactsArray));
//       }

//       if (formData.amenities) {
//         const amenitiesArray = formData.amenities.split(',').map(item => item.trim()).filter(item => item);
//         submitData.append('amenities', JSON.stringify(amenitiesArray));
//       }

//       // Handle image upload
//       if (formData.image instanceof File) {
//         submitData.append('image', formData.image);
//       }

//       let response;
//       if (isEditing) {
//         // Update restaurant
//         response = await apiServer(
//           `${API_ROUTES.RESTAURANTS}${editingItem.item.id}/`,
//           'PATCH',
//           submitData
//         );
//       } else {
//         // Create restaurant
//         response = await apiServer(
//           API_ROUTES.RESTAURANTS,
//           'POST',
//           submitData
//         );
//       }

//       if (!response.error) {
//         if (isEditing) {
//           // Update local state
//           setRestaurants(restaurants.map(r =>
//             r.id === editingItem.item.id
//               ? { ...r, ...response.data }
//               : r
//           ));
//         } else {
//           // Add to local state
//           setRestaurants([response.data, ...restaurants]);
//         }
//         setShowAddForm(false);
//       } else {
//         // Handle API errors
//         if (response.status === 400 && typeof response.message === 'object') {
//           setErrors(response.message);
//         } else {
//           setErrors({ general: response.message });
//         }
//       }
//     } catch (error) {
//       console.error('Error submitting restaurant:', error);
//       setErrors({ general: 'An unexpected error occurred' });
//     }
//   };

//   const handleProductSubmit = async () => {
//     try {
//       // Prepare form data for API
//       const submitData = new FormData();

//       // Basic fields
//       submitData.append('name', formData.name);
//       submitData.append('category_id', formData.category);

//       submitData.append('city_id', formData.city);

//       submitData.append('price', formData.price);
//       submitData.append('stock', formData.stock);
//       submitData.append('is_available', formData.is_available);
//       submitData.append('description', formData.description);

//       // Optional discount price
//       if (formData.discount_price) {
//         submitData.append('discount_price', formData.discount_price);
//       }

//       // Handle image upload
//       if (formData.image instanceof File) {
//         submitData.append('image', formData.image);
//       }

//       let response;
//       if (isEditing) {
//         // Update product
//         response = await apiServer(
//           `${API_ROUTES.PRODUCTS}${editingItem.item.id}/`,
//           'PATCH',
//           submitData
//         );
//       } else {
//         // Create product
//         response = await apiServer(
//           API_ROUTES.PRODUCTS,
//           'POST',
//           submitData
//         );
//       }

//       if (!response.error) {
//         if (isEditing) {
//           // Update local state
//           setProducts(products.map(p =>
//             p.id === editingItem.item.id
//               ? { ...p, ...response.data }
//               : p
//           ));
//         } else {
//           // Add to local state
//           setProducts([response.data, ...products]);
//         }
//         setShowAddForm(false);
//       } else {
//         // Handle API errors
//         if (response.status === 400 && typeof response.message === 'object') {
//           setErrors(response.message);
//         } else {
//           setErrors({ general: response.message });
//         }
//       }
//     } catch (error) {
//       console.error('Error submitting product:', error);
//       setErrors({ general: 'An unexpected error occurred' });
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData({ ...formData, image: file });
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-bold text-gray-900">
//               {isEditing ? 'Edit' : 'Add'} {isRestaurant ? 'Restaurant' : 'Product'}
//             </h2>
//             <button
//               onClick={() => setShowAddForm(false)}
//               className="text-gray-400 hover:text-gray-600 p-2"
//             >
//               <X className="h-6 w-6" />
//             </button>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           {/* General Error */}
//           {errors.general && (
//             <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
//               {errors.general}
//             </div>
//           )}

//           {/* Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               {isRestaurant ? 'Restaurant Name' : 'Product Name'} *
//             </label>
//             <input
//               type="text"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.name ? 'border-red-300' : 'border-gray-300'
//                 }`}
//               placeholder={`Enter ${isRestaurant ? 'restaurant' : 'product'} name`}
//               required
//             />
//             {errors.name && (
//               <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
//             )}
//           </div>

//           {/* Restaurant specific fields */}
//           {isRestaurant && (
//             <>
//               {/* Restaurant Type */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Type *</label>
//                 <select
//                   value={formData.restaurant_type}
//                   onChange={(e) => setFormData({ ...formData, restaurant_type: e.target.value })}
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.restaurant_type ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                   required
//                 >
//                   <option value="">Select restaurant type</option>
//                   <option value="restaurant">Restaurant</option>
//                   <option value="hotel">Hotel & Guest House</option>
//                   <option value="local_traditional">Local & Traditional</option>
//                   <option value="cafe">Cafe</option>
//                 </select>
//                 {errors.restaurant_type && (
//                   <p className="mt-1 text-sm text-red-600">{errors.restaurant_type[0]}</p>
//                 )}
//               </div>

//               {/* City */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
//                 <select
//                   value={formData.city}
//                   // onChange={(e) => setFormData({ ...formData, city: Number(e.target.value) })}

//                   onChange={(e) => setFormData({ ...formData, city: e.target.value })}
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.city ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                 >
//                   <option value="">Select city</option>
//                   {cities.map(city => (
//                     <option key={city.id} value={city.id}>{city.name}</option>
//                   ))}
//                 </select>
//                 {errors.city && (
//                   <p className="mt-1 text-sm text-red-600">{errors.city[0]}</p>
//                 )}
//               </div>

//               {/* Location Inside City */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Location Inside City</label>
//                 <input
//                   type="text"
//                   value={formData.location_inside_city}
//                   onChange={(e) => setFormData({ ...formData, location_inside_city: e.target.value })}
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.location_inside_city ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                   placeholder="e.g., Near Main Bazaar, City Center"
//                 />
//                 {errors.location_inside_city && (
//                   <p className="mt-1 text-sm text-red-600">{errors.location_inside_city[0]}</p>
//                 )}
//               </div>

//               {/* Room Available */}
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="room_available"
//                   checked={formData.room_available}
//                   onChange={(e) => setFormData({ ...formData, room_available: e.target.checked })}
//                   className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="room_available" className="ml-2 block text-sm text-gray-900">
//                   Room Available
//                 </label>
//               </div>

//               {/* is_active */}
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="is_active"
//                   checked={formData.is_active}
//                   onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
//                   className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
//                   Is Active
//                 </label>
//               </div>

//               {/* Contacts and Hours */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Contacts & Hours
//                 </label>
//                 <textarea
//                   value={formData.contacts_and_hours}
//                   onChange={(e) => setFormData({ ...formData, contacts_and_hours: e.target.value })}
//                   rows={3}
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.contacts_and_hours ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                   placeholder="Enter contact details and opening hours separated by commas (e.g., +92 300 1234567, Open 9 AM - 11 PM, info@restaurant.com)"
//                 />
//                 {errors.contacts_and_hours && (
//                   <p className="mt-1 text-sm text-red-600">{errors.contacts_and_hours[0]}</p>
//                 )}
//               </div>

//               {/* Amenities */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Amenities
//                 </label>
//                 <textarea
//                   value={formData.amenities}
//                   onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
//                   rows={2}
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.amenities ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                   placeholder="Enter amenities separated by commas (e.g., WiFi, Parking, AC, Garden Seating)"
//                 />
//                 {errors.amenities && (
//                   <p className="mt-1 text-sm text-red-600">{errors.amenities[0]}</p>
//                 )}
//               </div>

//               {/* WhatsApp Number */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
//                 <input
//                   type="text"
//                   value={formData.whatsapp_number}
//                   onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.whatsapp_number ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                   placeholder="923001234567 (without + sign)"
//                 />
//                 {errors.whatsapp_number && (
//                   <p className="mt-1 text-sm text-red-600">{errors.whatsapp_number[0]}</p>
//                 )}
//               </div>

//               {/* Get Direction URL */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Direction URL</label>
//                 <input
//                   type="url"
//                   value={formData.get_direction}
//                   onChange={(e) => setFormData({ ...formData, get_direction: e.target.value })}
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.get_direction ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                   placeholder="https://maps.google.com/..."
//                 />
//                 {errors.get_direction && (
//                   <p className="mt-1 text-sm text-red-600">{errors.get_direction[0]}</p>
//                 )}
//               </div>

//               {/* Restaurant Image Upload */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Image</label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.image ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                 />
//                 {errors.image && (
//                   <p className="mt-1 text-sm text-red-600">{errors.image[0]}</p>
//                 )}
//               </div>
//             </>

//           )}

//           {/* Product specific fields */}
//           {!isRestaurant && (
//             <>
//               {/* Category */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
//                 <select
//                   value={formData.category}
//                   onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.category ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                   required
//                 >
//                   <option value="">Select category</option>
//                   {categories.map(category => (
//                     <option key={category.id} value={category.id}>{category.name}</option>
//                   ))}
//                 </select>
//                 {errors.category && (
//                   <p className="mt-1 text-sm text-red-600">{errors.category[0]}</p>
//                 )}
//               </div>

//               {/* City */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
//                 <select
//                   value={formData.city}
//                  onChange={(e) => setFormData({ ...formData, city: Number(e.target.value) })}

//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.city ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                 >
//                   <option value="">Select city</option>
//                   {cities.map(city => (
//                     <option key={city.id} value={city.id}>{city.name}</option>
//                   ))}
//                 </select>
//                 {errors.city && (
//                   <p className="mt-1 text-sm text-red-600">{errors.city[0]}</p>
//                 )}
//               </div>

//               {/* Price Fields */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.) *</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={formData.price}
//                     onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                     className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.price ? 'border-red-300' : 'border-gray-300'
//                       }`}
//                     placeholder="0.00"
//                     required
//                   />
//                   {errors.price && (
//                     <p className="mt-1 text-sm text-red-600">{errors.price[0]}</p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price (Rs.)</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={formData.discount_price}
//                     onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
//                     className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.discount_price ? 'border-red-300' : 'border-gray-300'
//                       }`}
//                     placeholder="0.00 (optional)"
//                   />
//                   {errors.discount_price && (
//                     <p className="mt-1 text-sm text-red-600">{errors.discount_price[0]}</p>
//                   )}
//                 </div>
//               </div>

//               {/* Stock Quantity */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
//                 <input
//                   type="number"
//                   min="0"
//                   value={formData.stock}
//                   onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.stock ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                   placeholder="0"
//                   required
//                 />
//                 {errors.stock && (
//                   <p className="mt-1 text-sm text-red-600">{errors.stock[0]}</p>
//                 )}
//               </div>

//               {/* Is Available */}
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="is_available"
//                   checked={formData.is_available}
//                   onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
//                   className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
//                   Available for Sale
//                 </label>
//               </div>

//               {/* Product Image Upload */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.image ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                 />
//                 {errors.image && (
//                   <p className="mt-1 text-sm text-red-600">{errors.image[0]}</p>
//                 )}
//               </div>
//             </>
//           )}

//           {/* Description */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               rows={4}
//               className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${errors.description ? 'border-red-300' : 'border-gray-300'
//                 }`}
//               placeholder={`Describe your ${isRestaurant ? 'restaurant' : 'product'}...`}
//             />
//             {errors.description && (
//               <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
//             )}
//           </div>

//           {/* Form Actions */}
//           <div className="flex space-x-4 pt-4">
//             <button
//               type="button"
//               onClick={() => setShowAddForm(false)}
//               className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
//               disabled={loading}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
//               disabled={loading}
//             >
//               {loading ? 'Saving...' : `${isEditing ? 'Update' : 'Add'} ${isRestaurant ? 'Restaurant' : 'Product'}`}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddEditForm;