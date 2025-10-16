import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Heart,
    Share2,
    MapPin,
    Tag,
    Package,
    Shield,
    Truck,
    Star,
    Plus,
    Minus,
    ShoppingCart,
    MessageCircle,
    Users
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import ProductCard from '../components/ProductCard';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import useProducts from '../hooks/useProducts';
import { useReviews } from '../hooks/useReviews';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import apiServer from '../utils/apiServer';
import API_ROUTES from '../apiRoutes';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart, isInCart, getCartItemQuantity, cartLoading } = useCart();

    // Use the useProducts hook for fetching product details
    const { product, loading, error } = useProducts({
        productId: parseInt(id),
        fetchCategories: false
    });

    // Use the useReviews hook for review management
    const {
        reviews,
        loading: reviewsLoading,
        reviewsCount,
        averageRating,
        submitting: reviewSubmitting,
        addReview,
        updateReview,
        deleteReview,
        hasUserReviewed,
        getUserReview
    } = useReviews(parseInt(id));

    const [relatedProducts, setRelatedProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [addingToCart, setAddingToCart] = useState(false);
    
    // Review states
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [deletingReviewId, setDeletingReviewId] = useState(null);

    // Check if product is already in cart and get its quantity
    const cartQuantity = getCartItemQuantity(product?.id);
    const productInCart = isInCart(product?.id);

    // Check if user has already reviewed this product
    const userHasReviewed = user ? hasUserReviewed(user.username || user.id) : false;
    const userReview = user ? getUserReview(user.username || user.id) : null;

    // Fetch related products when product is loaded
    useEffect(() => {
        if (product?.category) {
            fetchRelatedProducts();
        }
    }, [product]);

    const fetchRelatedProducts = async () => {
        try {
            const queryParams = {
                category: product.category.id,
                page_size: 4
            };

            console.log("🔗 Fetching related products:", queryParams);

            const response = await apiServer(
                'get',
                API_ROUTES.PRODUCTS,
                queryParams,
                {
                    tokenRequired: false,
                    showNotification: false,
                    showErrorNotification: false
                }
            );

            console.log("✅ Related products response:", response);

            if (!response.error) {
                const productsData = response.results || response.data?.results || response.data || [];
                const filtered = productsData.filter(p => p.id !== product.id);
                setRelatedProducts(filtered.slice(0, 4));
                console.log("🎯 Related products set:", filtered.length);
            }
        } catch (err) {
            console.error('❌ Failed to fetch related products:', err);
        }
    };

    const handleQuantityChange = (type) => {
        if (type === 'increment' && quantity < (product?.stock || 1)) {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrement' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            toast.error('Login required to add items to your cart');
            navigate('/login');
            return;
        }

        if (!product.is_available || product.stock === 0) {
            toast.error('This product is currently out of stock');
            return;
        }

        setAddingToCart(true);
        const result = await addToCart(product.id, quantity);
        console.log("🔹 Backend response:", result);

        if (result.success) {
            setQuantity(1);
        }
        setAddingToCart(false);
    };

    const handleBuyNow = async () => {
        if (!user) {
            toast.error('Login required to purchase');
            navigate('/login');
            return;
        }

        setAddingToCart(true);
        const result = await addToCart(product.id, quantity);

        if (result.success) {
            navigate('/cart');
        } else {
            toast.error(result.error || 'Failed to add item to cart');
        }
        setAddingToCart(false);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Product link copied to clipboard!');
        }
    };

    // Review handlers
    const handleWriteReview = () => {
        if (!user) {
            toast.error('Login required to write a review');
            navigate('/login');
            return;
        }
        setShowReviewForm(true);
        setEditingReview(null);
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const handleDeleteReview = async (reviewId) => {
        setDeletingReviewId(reviewId);
        const result = await deleteReview(reviewId);
        setDeletingReviewId(null);
        
        if (result.success) {
            // If user deleted their own review, hide the form if it was open
            if (showReviewForm && editingReview?.id === reviewId) {
                setShowReviewForm(false);
                setEditingReview(null);
            }
        }
    };

    const handleSubmitReview = async (reviewData) => {
        let result;
        
        if (editingReview) {
            // Update existing review
            result = await updateReview(editingReview.id, reviewData);
        } else {
            // Add new review
            result = await addReview(reviewData);
        }

        if (result.success) {
            setShowReviewForm(false);
            setEditingReview(null);
            return true;
        }
        
        return false;
    };

    const handleCancelReview = () => {
        setShowReviewForm(false);
        setEditingReview(null);
    };

    // Render star rating for display
    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                className={`w-5 h-5 ${
                    index < rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    const getStockStatus = () => {
        if (!product?.is_available) return { text: 'Unavailable', color: 'text-red-600', bgColor: 'bg-red-100' };
        if (product.stock === 0) return { text: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-100' };
        if (product.stock < 10) return { text: 'Low Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        return { text: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100' };
    };

    const stockStatus = product ? getStockStatus() : null;
    const images = product?.image ? [product.image] : [];
    const isLoading = loading || addingToCart;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <ErrorMessage message={error} />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center mx-auto">
                <Loader />
                <p className="text-slate-500">Loading Products...</p>
              </div>
            
        
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleShare}
                                className="p-2 rounded-full border border-gray-300 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-[3/2] rounded-2xl overflow-hidden bg-gray-100">
                            <img
                                src={images.length > 0 ? images[selectedImage] : "https://via.placeholder.com/600x600?text=No+Image"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {images.length > 1 && (
                            <div className="flex space-x-4">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-emerald-500' : 'border-gray-200'
                                            }`}
                                    >
                                        <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Shield className="w-6 h-6 text-emerald-600" />
                                </div>
                                <p className="text-xs text-gray-600">Authentic Products</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Truck className="w-6 h-6 text-blue-600" />
                                </div>
                                <p className="text-xs text-gray-600">Fast Delivery</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Star className="w-6 h-6 text-purple-600" />
                                </div>
                                <p className="text-xs text-gray-600">Quality Assured</p>
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {product.category && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                        <Tag className="w-3 h-3 mr-1" />
                                        {product.category.name}
                                    </span>
                                )}
                                {stockStatus && (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                                        <Package className="w-3 h-3 mr-1" />
                                        {stockStatus.text}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

                            {product.city && (
                                <div className="flex items-center gap-1 text-gray-600 mt-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{product.city.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Rating Summary */}
                        {reviewsCount > 0 && (
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                        {renderStars(Math.round(averageRating))}
                                    </div>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {averageRating}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">{reviewsCount}</span> review{reviewsCount !== 1 ? 's' : ''}
                                </div>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-4">
                            {product.discount_price ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold text-emerald-600">
                                        Rs. {product.discount_price}
                                    </span>
                                    <span className="text-xl text-gray-500 line-through">
                                        Rs. {product.price}
                                    </span>
                                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                                        {product.discount_percentage}% OFF
                                    </span>
                                </div>
                            ) : (
                                <span className="text-3xl font-bold text-emerald-600">
                                    Rs. {product.price}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {product.description || 'No description available for this product.'}
                            </p>
                        </div>

                        {/* Stock Info */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Available Stock</span>
                                <span className="text-sm font-bold text-gray-900">{product.stock} units</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-emerald-600 h-2 rounded-full"
                                    style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Cart Status */}
                        {productInCart && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <p className="text-sm text-emerald-700 flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    This item is already in your cart ({cartQuantity} items)
                                </p>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        {product.is_available && product.stock > 0 && (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => handleQuantityChange('decrement')}
                                        disabled={quantity <= 1}
                                        className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-4 py-2 font-medium">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange('increment')}
                                        disabled={quantity >= product.stock}
                                        className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            {product.is_available && product.stock > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isLoading}
                                        className="flex items-center justify-center gap-2 py-3 px-6 border border-emerald-600 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent"></div>
                                        ) : (
                                            <ShoppingCart className="w-5 h-5" />
                                        )}
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={isLoading}
                                        className="flex items-center justify-center gap-2 py-3 px-6 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        )}
                                        Buy Now
                                    </button>
                                </div>
                            ) : (
                                <button
                                    disabled
                                    className="w-full py-3 px-6 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                                >
                                    {!product.is_available ? 'Product Unavailable' : 'Out of Stock'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16">
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                        {/* Reviews Header */}
                        <div className="space-y-6 sm:space-y-0 sm:flex sm:items-center sm:justify-between mb-8">
                            <div className="space-y-4">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    Customer Reviews
                                </h2>
                                {reviewsCount > 0 ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center">
                                                {renderStars(Math.round(averageRating))}
                                            </div>
                                            <span className="text-lg sm:text-xl font-semibold text-gray-900">
                                                {averageRating} out of 5
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span className="text-sm sm:text-base">{reviewsCount} review{reviewsCount !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-sm sm:text-base">No reviews yet. Be the first to review this product!</p>
                                )}
                            </div>

                            {/* Write Review Button */}
                            <div className="flex justify-start sm:justify-end">
                                {user && !userHasReviewed && !showReviewForm && (
                                    <button
                                        onClick={handleWriteReview}
                                        className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm sm:text-base"
                                    >
                                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline">Write Review</span>
                                        <span className="sm:hidden">Review</span>
                                    </button>
                                )}

                                {!user && !showReviewForm && (
                                    <button
                                        onClick={handleWriteReview}
                                        className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border border-emerald-600 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors text-sm sm:text-base"
                                    >
                                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline">Login to Review</span>
                                        <span className="sm:hidden">Login</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Review Form */}
                        {showReviewForm && (
                            <div className="mb-8">
                                <ReviewForm
                                    onSubmit={handleSubmitReview}
                                    onCancel={handleCancelReview}
                                    isSubmitting={reviewSubmitting}
                                    editingReview={editingReview}
                                    productName={product.name}
                                />
                            </div>
                        )}

                        {/* Reviews List */}
                        {reviewsLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader />
                            </div>
                        ) : reviews.length > 0 ? (
                            <div className={`${
                                reviews.length > 5 
                                    ? 'max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 pr-2' 
                                    : ''
                            }`}>
                                <div className="space-y-6">
                                    {reviews.map(review => (
                                        <ReviewCard
                                            key={review.id}
                                            review={review}
                                            onEdit={handleEditReview}
                                            onDelete={handleDeleteReview}
                                            isDeleting={deletingReviewId === review.id}
                                            showActions={user !== null}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h3>
                                <p className="text-gray-500 mb-6">
                                    Share your experience with this product to help other customers
                                </p>
                                {user && !userHasReviewed && (
                                    <button
                                        onClick={handleWriteReview}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        Write First Review
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Related Products
                            </h2>
                            <p className="text-gray-600">
                                You might also like these products from the same category
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    showActions={false}
                                    onViewDetails={(prod) => navigate(`/products/${prod.id}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPage;
