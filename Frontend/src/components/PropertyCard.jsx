import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Ruler } from 'lucide-react';

const PropertyCard = ({ property }) => {
    // A guard clause to prevent crashes if a property is undefined
    if (!property) {
        return null;
    }

    const formatAddress = (prop) => {
        if (prop.address && prop.address.city) {
            return `${prop.address.city}, ${prop.address.state}`;
        }
        return prop.propertyAddress;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 truncate mb-1">{property.propertyAddress}</h3>
                <p className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                    {formatAddress(property)}
                </p>
                <div className="flex items-center justify-between mb-4">
                    <p className="flex items-center text-lg font-bold text-green-600">
                        <DollarSign className="w-5 h-5 mr-1" />
                        {property.price} ETH
                    </p>
                    <p className="flex items-center text-sm text-gray-600">
                        <Ruler className="w-4 h-4 mr-1" />
                        {property.area} {property.areaUnit ? property.areaUnit.replace('_', ' ') : 'sq m'}
                    </p>
                </div>
                <div className="flex-grow"></div>
                <Link
                    to={`/buyer-dashboard/property/${property._id}`}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors block text-center"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default PropertyCard;