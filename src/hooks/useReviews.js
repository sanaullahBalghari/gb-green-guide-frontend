// src/hooks/useReviews.js
import { useState, useEffect, useCallback } from 'react';
import apiServer from '../utils/apiServer';
import API_ROUTES from '../apiRoutes';
import toast from 'react-hot-toast';

export const useReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews for a product
  const fetchReviews = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiServer(
        'get',
        `/ecommerce/products/${productId}/reviews/`,
        {},
        {
          tokenRequired: false,
          showNotification: false,
          showErrorNotification: false,
        }
      );

      console.log('📝 Fetched reviews:', response);
      
      // Handle different response formats
      const reviewsData = response?.results || response || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      
    } catch (err) {
      console.error('❌ Failed to fetch reviews:', err);
      setError('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Add a new review
  const addReview = useCallback(async (reviewData) => {
    if (!productId) {
      toast.error('Invalid product');
      return { success: false, error: 'Invalid product' };
    }

    try {
      setSubmitting(true);
      
      const response = await apiServer(
        'post',
        `/ecommerce/products/${productId}/reviews/`,
        {
          rating: reviewData.rating,
          comment: reviewData.comment.trim()
        },
        {
          tokenRequired: true,
          showNotification: true,
          showErrorNotification: true,
        }
      );

      console.log('✅ Review added:', response);
      
      // Add the new review to the list
      setReviews(prev => [response, ...prev]);
      
      return { success: true, data: response };
      
    } catch (err) {
      console.error('❌ Failed to add review:', err);
      return { 
        success: false, 
        error: err.response?.data?.detail || err.message || 'Failed to add review'
      };
    } finally {
      setSubmitting(false);
    }
  }, [productId]);

  // Update an existing review
  const updateReview = useCallback(async (reviewId, reviewData) => {
    if (!productId || !reviewId) {
      toast.error('Invalid review data');
      return { success: false, error: 'Invalid review data' };
    }

    try {
      setSubmitting(true);
      
      const response = await apiServer(
        'put',
        `/ecommerce/products/${productId}/reviews/${reviewId}/`,
        {
          rating: reviewData.rating,
          comment: reviewData.comment.trim()
        },
        {
          tokenRequired: true,
          showNotification: true,
          showErrorNotification: true,
        }
      );

      console.log('✅ Review updated:', response);
      
      // Update the review in the list
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? { ...review, ...response } : review
        )
      );
      
      return { success: true, data: response };
      
    } catch (err) {
      console.error('❌ Failed to update review:', err);
      return { 
        success: false, 
        error: err.response?.data?.detail || err.message || 'Failed to update review'
      };
    } finally {
      setSubmitting(false);
    }
  }, [productId]);

  // Delete a review
  const deleteReview = useCallback(async (reviewId) => {
    if (!productId || !reviewId) {
      toast.error('Invalid review data');
      return { success: false, error: 'Invalid review data' };
    }

    if (!window.confirm('Are you sure you want to delete this review?')) {
      return { success: false, error: 'Cancelled' };
    }

    try {
      setSubmitting(true);
      
      await apiServer(
        'delete',
        `/ecommerce/products/${productId}/reviews/${reviewId}/`,
        {},
        {
          tokenRequired: true,
          showNotification: true,
          showErrorNotification: true,
        }
      );

      console.log('✅ Review deleted:', reviewId);
      
      // Remove the review from the list
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      
      return { success: true };
      
    } catch (err) {
      console.error('❌ Failed to delete review:', err);
      return { 
        success: false, 
        error: err.response?.data?.detail || err.message || 'Failed to delete review'
      };
    } finally {
      setSubmitting(false);
    }
  }, [productId]);

  // Get average rating
  const averageRating = useCallback(() => {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  // Get rating distribution
  const ratingDistribution = useCallback(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    
    return distribution;
  }, [reviews]);

  // Check if user has already reviewed this product
  const hasUserReviewed = useCallback((userId) => {
    if (!userId) return false;
    return reviews.some(review => review.user === userId || review.user?.id === userId);
  }, [reviews]);

  // Get user's review if exists
  const getUserReview = useCallback((userId) => {
    if (!userId) return null;
    return reviews.find(review => review.user === userId || review.user?.id === userId) || null;
  }, [reviews]);

  // Initialize reviews when productId changes
  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, fetchReviews]);

  return {
    // State
    reviews,
    loading,
    error,
    submitting,
    
    // Computed values
    reviewsCount: reviews.length,
    averageRating: averageRating(),
    ratingDistribution: ratingDistribution(),
    
    // Actions
    fetchReviews,
    addReview,
    updateReview,
    deleteReview,
    
    // Utils
    hasUserReviewed,
    getUserReview,
    
    // Reset functions
    clearError: () => setError(null),
    setReviews
  };
};