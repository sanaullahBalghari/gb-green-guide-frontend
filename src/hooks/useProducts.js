// hooks/useProducts.js
import { useState, useEffect } from "react";
import apiServer from "../utils/apiServer";
import API_ROUTES from "../apiRoutes";

export default function useProducts({ 
    categoryId, 
    cityId, 
    productId, 
    fetchCategories = false,
    mode = "public", // ✅ "public" | "my" 
    showLoader = false,
    limit = null // ✅ NEW: Add limit parameter for home page
} = {}) {
    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(showLoader);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const extractResults = (data) => {
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.results)) return data.results;
            return [];
        };

        // ✅ helper to always move "Others" last
        const sortCategories = (cats) => {
            if (!Array.isArray(cats)) return [];
            return [
                ...cats.filter(cat => cat.name !== "Others"),
                ...cats.filter(cat => cat.name === "Others"),
            ];
        };

        const fetchData = async () => {
            if (showLoader) setLoading(true);
            setError(null);

            try {
                // ✅ Fetch categories if requested (always public)
                if (fetchCategories) {
                    console.log("🏷️ Fetching categories...");
                    const catResponse = await apiServer(
                        "get",
                        API_ROUTES.PRODUCT_CATEGORIES,
                        {},
                        {
                            tokenRequired: false,
                            showNotification: false,
                            showErrorNotification: true
                        }
                    );
                    if (isMounted && !catResponse?.error) {
                        const cats = extractResults(catResponse?.data || catResponse);
                        setCategories(sortCategories(cats));
                        console.log("✅ Categories loaded:", cats.length);
                    }
                }

                let endpoint = "";
                let tokenRequired = false;
                let queryParams = {}; // ✅ NEW: Add query params object

                // ✅ Determine endpoint and token requirement based on mode
                if (mode === "my") {
                    // My products endpoint - requires token
                    endpoint = API_ROUTES.MY_PRODUCTS;
                    tokenRequired = true;
                } else {
                    // Public endpoints - no token required
                    if (productId) {
                        endpoint = `${API_ROUTES.PRODUCTS.replace(/\/$/, "")}/${productId}/`;
                    } else if (categoryId) {
                        endpoint = `${API_ROUTES.PRODUCT_CATEGORIES.replace(/\/$/, "")}/${categoryId}/products/`;
                    } else if (cityId) {
                        endpoint = `${API_ROUTES.CITIES.replace(/\/$/, "")}/${cityId}/products/`;
                    } else {
                        endpoint = API_ROUTES.PRODUCTS;
                    }
                }

                // ✅ NEW: Add limit to query params if specified
                if (limit) {
                    queryParams.page_size = limit;
                }

                console.log("🛒 Fetching products:", {
                    endpoint,
                    mode,
                    tokenRequired,
                    productId,
                    categoryId,
                    cityId,
                    limit,
                    queryParams
                });

                // ✅ API call with query params
                const response = await apiServer(
                    "get",
                    endpoint,
                    queryParams, // ✅ Pass query params here
                    {
                        tokenRequired,
                        showNotification: false,
                        showErrorNotification: true
                    }
                );

                console.log("✅ Products API Response:", response);

                if (isMounted && !response?.error) {
                    if (productId) {
                        // Single product detail
                        setProduct(response?.data || response);
                    } else {
                        // Products list
                        let productsData = [];
                        if (Array.isArray(response)) {
                            productsData = response;
                        } else if (response.data && Array.isArray(response.data)) {
                            productsData = response.data;
                        } else if (response.results && Array.isArray(response.results)) {
                            productsData = response.results;
                        } else if (response.data?.results && Array.isArray(response.data.results)) {
                            productsData = response.data.results;
                        }

                        setProducts(productsData);
                        console.log("📊 Products loaded:", productsData.length);
                    }
                }
            } catch (err) {
                console.error("❌ useProducts Error:", err);
                const errorMessage = err.response?.data?.message || 
                                   err.response?.data?.detail || 
                                   err.message || 
                                   "Something went wrong while fetching products.";
                if (isMounted) setError(errorMessage);
            } finally {
                if (isMounted && showLoader) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [categoryId, cityId, productId, fetchCategories, mode, showLoader, limit]); // ✅ Add limit to dependencies

    // ✅ Random products picker (same as restaurants)
    const getRandomProducts = (count) => {
        if (!products || products.length === 0) return [];
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    return { 
        products, 
        product, 
        categories, 
        loading, 
        error,
        getRandomProducts // ✅ Added for consistency
    };
}


// // hooks/useProducts.js
// import { useState, useEffect } from "react";
// import apiServer from "../utils/apiServer";
// import API_ROUTES from "../apiRoutes";

// export default function useProducts({ 
//     categoryId, 
//     cityId, 
//     productId, 
//     fetchCategories = false,
//     mode = "public", // ✅ New: "public" | "my" 
//     showLoader = false
// } = {}) {
//     const [products, setProducts] = useState([]);
//     const [product, setProduct] = useState(null);
//     const [categories, setCategories] = useState([]);
//     const [loading, setLoading] = useState(showLoader);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         let isMounted = true;

//         const extractResults = (data) => {
//             if (Array.isArray(data)) return data;
//             if (Array.isArray(data?.results)) return data.results;
//             return [];
//         };

//         // ✅ helper to always move "Others" last
//         const sortCategories = (cats) => {
//             if (!Array.isArray(cats)) return [];
//             return [
//                 ...cats.filter(cat => cat.name !== "Others"),
//                 ...cats.filter(cat => cat.name === "Others"),
//             ];
//         };

//         const fetchData = async () => {
//             if (showLoader) setLoading(true);
//             setError(null);

//             try {
//                 // ✅ Fetch categories if requested (always public)
//                 if (fetchCategories) {
//                     console.log("🏷️ Fetching categories...");
//                     const catResponse = await apiServer(
//                         "get",
//                         API_ROUTES.PRODUCT_CATEGORIES,
//                         {},
//                         {
//                             tokenRequired: false,
//                             showNotification: false,
//                             showErrorNotification: true
//                         }
//                     );
//                     if (isMounted && !catResponse?.error) {
//                         const cats = extractResults(catResponse?.data || catResponse);
//                         setCategories(sortCategories(cats));
//                         console.log("✅ Categories loaded:", cats.length);
//                     }
//                 }

//                 let endpoint = "";
//                 let tokenRequired = false;

//                 // ✅ Determine endpoint and token requirement based on mode
//                 if (mode === "my") {
//                     // My products endpoint - requires token
//                     endpoint = API_ROUTES.MY_PRODUCTS;
//                     tokenRequired = true;
//                 } else {
//                     // Public endpoints - no token required
//                     if (productId) {
//                         endpoint = `${API_ROUTES.PRODUCTS.replace(/\/$/, "")}/${productId}/`;
//                     } else if (categoryId) {
//                         endpoint = `${API_ROUTES.PRODUCT_CATEGORIES.replace(/\/$/, "")}/${categoryId}/products/`;
//                     } else if (cityId) {
//                         endpoint = `${API_ROUTES.CITIES.replace(/\/$/, "")}/${cityId}/products/`;
//                     } else {
//                         endpoint = API_ROUTES.PRODUCTS;
//                     }
//                 }

//                 console.log("🛒 Fetching products:", {
//                     endpoint,
//                     mode,
//                     tokenRequired,
//                     productId,
//                     categoryId,
//                     cityId
//                 });

//                 // ✅ API call with correct parameter structure
//                 const response = await apiServer(
//                     "get",
//                     endpoint,
//                     {},
//                     {
//                         tokenRequired,
//                         showNotification: false,
//                         showErrorNotification: true
//                     }
//                 );

//                 console.log("✅ Products API Response:", response);

//                 if (isMounted && !response?.error) {
//                     if (productId) {
//                         // Single product detail
//                         setProduct(response?.data || response);
//                     } else {
//                         // Products list
//                         let productsData = [];
//                         if (Array.isArray(response)) {
//                             productsData = response;
//                         } else if (response.data && Array.isArray(response.data)) {
//                             productsData = response.data;
//                         } else if (response.results && Array.isArray(response.results)) {
//                             productsData = response.results;
//                         } else if (response.data?.results && Array.isArray(response.data.results)) {
//                             productsData = response.data.results;
//                         }

//                         setProducts(productsData);
//                         console.log("📊 Products loaded:", productsData.length);
//                     }
//                 }
//             } catch (err) {
//                 console.error("❌ useProducts Error:", err);
//                 const errorMessage = err.response?.data?.message || 
//                                    err.response?.data?.detail || 
//                                    err.message || 
//                                    "Something went wrong while fetching products.";
//                 if (isMounted) setError(errorMessage);
//             } finally {
//                 if (isMounted && showLoader) setLoading(false);
//             }
//         };

//         fetchData();

//         return () => {
//             isMounted = false;
//         };
//     }, [categoryId, cityId, productId, fetchCategories, mode, showLoader]);

//     // ✅ Random products picker (same as restaurants)
//     const getRandomProducts = (count) => {
//         if (!products || products.length === 0) return [];
//         const shuffled = [...products].sort(() => 0.5 - Math.random());
//         return shuffled.slice(0, count);
//     };

//     return { 
//         products, 
//         product, 
//         categories, 
//         loading, 
//         error,
//         getRandomProducts // ✅ Added for consistency
//     };
// }