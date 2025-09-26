// src/components/ReviewCard.jsx
import React, { useState } from 'react';
import { Star, Edit, Trash2, User, MoreVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReviewCard = ({ 
  review, 
  onEdit, 
  onDelete, 
  isDeleting = false,
  showActions = true 
}) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  // Check if current user owns this review
  const isOwner = user && (
    (typeof review.user === 'string' && review.user === user.username) ||
    (typeof review.user === 'object' && review.user?.id === user.id) ||
    review.user === user.id
  );

  // Render star rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Get display name
  const getDisplayName = () => {
    if (typeof review.user === 'string') {
      return review.user;
    }
    if (typeof review.user === 'object' && review.user?.username) {
      return review.user.username;
    }
    return 'Anonymous';
  };

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) {
      onEdit(review);
    }
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (onDelete) {
      onDelete(review.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
          {/* <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-emerald-600" />
          </div> */}
          
          {/* User info and rating */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                {getDisplayName()}
              </h4>
              {isOwner && (
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                  You
                </span>
              )}
            </div>
            
            {/* Stars and date */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Action menu for review owner */}
        {showActions && isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              disabled={isDeleting}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={handleEdit}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg disabled:opacity-50"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            )}

            {/* Backdrop to close menu */}
            {showMenu && (
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowMenu(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* Review comment */}
      {review.comment && (
        <div className="mt-3">
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">
            {review.comment}
          </p>
        </div>
      )}

      {/* Loading state overlay */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Deleting...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;