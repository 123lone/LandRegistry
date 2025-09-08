import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Key, LandPlot } from 'lucide-react';

// Mock data for properties the user owns
const mockOwnedProperties = [
  { 
    id: 101, 
    title: 'Urban Plot in New Delhi', 
    location: 'Sainik Farm, New Delhi', 
    uniqueId: 'TX-8a3b5c7d', 
    image: 'https://via.placeholder.com/400x250.png?text=Owned+Property+1' 
  },
  { 
    id: 102, 
    title: 'Lakeside Land in Pune', 
    location: 'Lonavala, Pune', 
    uniqueId: 'TX-b9d1e2f3', 
    image: 'https://via.placeholder.com/400x250.png?text=Owned+Property+2' 
  },
  { 
    id: 103, 
    title: 'Commercial Space in Mumbai', 
    location: 'Bandra, Mumbai', 
    uniqueId: 'TX-c4a5b6d7', 
    image: 'https://via.placeholder.com/400x250.png?text=Owned+Property+3' 
  },
];

const PropertyCard = ({ property }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
    <img src={property.image} alt={property.title} className="w-full h-48 object-cover" />
    <div className="p-5 space-y-3">
      <h3 className="text-xl font-bold text-gray-900">{property.title}</h3>
      <div className="flex items-center text-sm text-gray-600">
        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
        <span>{property.location}</span>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <Key className="w-4 h-4 mr-2 text-green-500" />
        <span className="font-mono">{property.uniqueId}</span>
      </div>
    </div>
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <Link 
        to={`/buyer-dashboard/property/${property.id}`} 
        className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        View Details
      </Link>
    </div>
  </div>
);

const BuyerProperties = () => {
  const hasProperties = mockOwnedProperties.length > 0;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Properties</h1>
        <p className="text-lg text-gray-600">A record of all the properties you own on the blockchain.</p>
      </div>

      {!hasProperties ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <LandPlot className="w-20 h-20 text-blue-500 mb-6" />
          <h2 className="text-2xl font-semibold mb-2">You don't own any properties yet.</h2>
          <p className="text-gray-600 mb-4">
            Start your journey by browsing the marketplace and making your first purchase.
          </p>
          <Link
            to="/buyer-dashboard/browse"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockOwnedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerProperties;