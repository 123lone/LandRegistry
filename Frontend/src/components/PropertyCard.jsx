import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Ruler, CircleUser } from 'lucide-react';

const PropertyCard = ({ property }) => {
    // Guard clause to prevent crashes if property is null or undefined
    if (!property) {
        return null;
    }

    // Use optional chaining for safely accessing nested properties
    const ownerName = property?.owner?.name || 'N/A';
    const ownerEmail = property?.owner?.email || 'N/A';
    
    // Combine address details for a cleaner display
    const displayAddress = `${property.propertyAddress}${property.district ? `, ${property.district}` : ''}`;
    
    // Fallback image if property.image is missing
    const fallbackImage = 'https://via.placeholder.com/800x400?text=No+Image+Available';

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            {/* Property Image */}
            <div className="h-48 w-full">
                <img
                    src={property.image || fallbackImage}
                    alt={displayAddress || 'Property Image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = fallbackImage; // Fallback if image fails to load
                    }}
                />
            </div>

            <div className="p-6 flex flex-col flex-grow">
                {/* Property Address */}
                <h3 className="text-2xl font-bold text-gray-900 truncate mb-2" title={displayAddress}>
                    {displayAddress}
                </h3>

                {/* Price and Area */}
                <div className="flex items-center justify-between mb-4 text-gray-700">
                    <p className="flex items-center text-xl font-semibold text-green-600">
                        <DollarSign className="w-5 h-5 mr-1.5" />
                        {property.price} ETH
                    </p>
                    <p className="flex items-center text-md">
                        <Ruler className="w-5 h-5 mr-1.5" />
                        {property.area} {property.areaUnit ? property.areaUnit.replace('_', ' ') : 'sq m'}
                    </p>
                </div>
                
                <hr className="my-4" />

                {/* Owner Information */}
                <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">OWNED BY</h4>
                    <div className="flex items-center space-x-3">
                        <CircleUser className="w-10 h-10 text-gray-400" />
                        <div>
                            <p className="font-bold text-gray-800">{ownerName}</p>
                            <p className="text-sm text-gray-500">{ownerEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Action Button - Pushes to the bottom */}
                <div className="mt-auto">
                    <Link
                        to={`/buyer-dashboard/property/${property._id}`}
                        className="w-full mt-4 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors block text-center"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;