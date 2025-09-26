// src/components/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { Star, Send, Edit, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReviewForm = ({ 
  onSubmit, 
  onCancel,
  isSubmitting = false,
  editingReview = null,
  productName = ''
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(editingReview?.rating || 0);
  const [comment, setComment] = useState(editingReview?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [errors, setErrors] = useState({});

  const isEditing = !!editingReview;

  // Reset form when editingReview changes
  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating || 0);
      setComment(editingReview.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
    setErrors({});
  }, [editingReview]);

  // Handle star click
  const handleStarClick = (value) => {
    setRating(value);
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    if (!comment.trim()) {
      newErrors.comment = 'Please write a comment';
    }
    if (comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters long';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const success = await onSubmit({ 
        rating, 
        comment: comment.trim() 
      });
      
      // Reset form only if submission was successful and not editing
      if (success && !isEditing) {
        setRating(0);
        setComment('');
        setHoveredRating(0);
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isEditing) {
      setRating(editingReview?.rating || 0);
      setComment(editingReview?.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
    setErrors({});
    setHoveredRating(0);
    if (onCancel) {
      onCancel();
    }
  };

  // Render stars
  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`p-1 transition-colors ${
            isActive 
              ? 'text-yellow-400' 
              : 'text-gray-300 hover:text-yellow-300'
          }`}
          disabled={isSubmitting}
        >
          <Star 
            className={`w-6 h-6 sm:w-8 sm:h-8 ${
              isActive ? 'fill-current' : ''
            }`}
          />
        </button>
      );
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
          {productName && (
            <span className="block text-sm font-normal text-gray-600 mt-1">
              for {productName}
            </span>
          )}
        </h3>
        
        {isEditing && (
          <button
            onClick={handleCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex items-center gap-1">
            {renderStars()}
            {rating > 0 && (
              <span className="ml-3 text-sm text-gray-600">
                {rating} out of 5 stars
              </span>
            )}
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        {/* Comment Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (errors.comment) {
                setErrors(prev => ({ ...prev, comment: '' }));
              }
            }}
            placeholder="Share your experience with this product..."
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
              errors.comment 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-emerald-500'
            }`}
            disabled={isSubmitting}
            maxLength={1000}
          />
          
          <div className="flex justify-between items-center mt-2">
            {errors.comment ? (
              <p className="text-red-500 text-sm">{errors.comment}</p>
            ) : (
              <p className="text-gray-500 text-sm">
                Minimum 10 characters required
              </p>
            )}
            <p className="text-gray-400 text-sm">
              {comment.length}/1000
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || !comment.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isEditing ? (
              <Edit className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {isSubmitting 
              ? 'Submitting...' 
              : isEditing 
                ? 'Update Review' 
                : 'Submit Review'
            }
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-600 text-xs font-medium">
              {user?.username?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            Reviewing as {user?.username}
          </span>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;


// import React, { useState } from 'react';

// const ReviewForm = ({ onClose }) => {
//   const [reviewData, setReviewData] = useState({
//     rating: 5,
//     comment: ''
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert('Review submitted! Thank you for your feedback.');
//     onClose();
//     setReviewData({ rating: 5, comment: '' });
//   };

//   return (
//     <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-xl p-6 border border-emerald-100 mb-6">
//       <h4 className="text-lg font-semibold text-slate-900 mb-4">Write a Review</h4>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
//           <div className="flex gap-1">
//             {[1,2,3,4,5].map(star => (
//               <button
//                 key={star}
//                 type="button"
//                 onClick={() => setReviewData({...reviewData, rating: star})}
//                 className={`text-3xl hover:scale-110 transition-transform ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
//               >
//                 ★
//               </button>
//             ))}
//           </div>
//         </div>
//         <div>
//           <label className="block text-sm font-semibold text-slate-700 mb-2">Your Review</label>
//           <textarea
//             required
//             value={reviewData.comment}
//             onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
//             rows="4"
//             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all"
//             placeholder="Share your experience..."
//           ></textarea>
//         </div>
//         <div className="flex gap-3">
//           <button
//             type="submit"
//             className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 hover:scale-105 transition-all font-semibold"
//           >
//             Submit Review
//           </button>
//           <button
//             type="button"
//             onClick={onClose}
//             className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-300 transition-colors font-semibold"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ReviewForm;