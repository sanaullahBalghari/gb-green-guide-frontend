import React from 'react';
import {
    MapPin,
    Package,
    Edit,
    Trash2,
    DollarSign,
    Tag
} from 'lucide-react';

const ProductCard = ({ product, showActions = false, onEdit, onDelete, onViewDetails }) => {
    if (!product) return null; // prevent crash if product is null/undefined

    const imageSrc = product.image || "https://via.placeholder.com/400x250?text=No+Image";

    // Calculate discount percentage if both prices exist
    const discountPercentage = product.discount_price && product.price
        ? Math.round(((product.price - product.discount_price) / product.price) * 100)
        : 0;

    // Determine stock status
    const getStockStatus = () => {
        if (!product.is_available) return { text: 'Unavailable', color: 'bg-gray-100/90 text-gray-700' };
        if (product.stock === 0) return { text: 'Out of Stock', color: 'bg-red-100/90 text-red-700' };
        if (product.stock < 10) return { text: 'Low Stock', color: 'bg-yellow-100/90 text-yellow-700' };
        return { text: 'In Stock', color: 'bg-green-100/90 text-green-700' };
    };

    const stockStatus = getStockStatus();

    return (
        <div className="bg-white rounded-2xl cursor-pointer  shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="relative h-56">
                <img
                    src={imageSrc}
                    alt={product.name || "Product"}
                    className="w-full h-52 object-cover"
                />
                {/* badges same as before */}
            </div>

            {/* reduced padding */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1 hover:text-emerald-600 transition-colors cursor-pointer">
                            {product.name}
                        </h3>

                        {/* location & category */}
                        <div className="flex items-center gap-3 text-slate-600 mb-1">
                            {product.city && (
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1 text-emerald-600" />
                                    <span className="text-sm">{product.city.name || product.city}</span>
                                </div>
                            )}
                            {product.category && (
                                <div className="flex items-center">
                                    <Tag className="w-4 h-4 mr-1 text-blue-600" />
                                    <span className="text-sm">{product.category.name || product.category}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* price */}
                <div className="flex items-center gap-2 mb-2">
                    {product.discount_price ? (
                        <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-emerald-600">
                                Rs. {product.discount_price}
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                                Rs. {product.price}
                            </span>
                        </div>
                    ) : (
                        <span className="text-base font-bold text-emerald-600">
                            Rs. {product.price || 'N/A'}
                        </span>
                    )}
                </div>

                <p className="text-slate-600 text-sm mb-2 line-clamp-2">
                    {product.description || 'No description available'}
                </p>

                <div className="flex gap-2">
                    {!showActions ? (
                        <button

                            onClick={() =>

                                onViewDetails(product)}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 px-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
                        >
                            View Details
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => onEdit(product)}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 hover:scale-105 transition-all duration-200 font-semibold"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(product.id)}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 px-4 rounded-xl hover:bg-red-700 hover:scale-105 transition-all duration-200 font-semibold"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>

    );
};

export default ProductCard;