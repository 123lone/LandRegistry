import React from 'react';
import { useBuyer } from '../../context/BuyerContext';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Ruler, Lock } from 'lucide-react';

// Mock data for property listings
const mockProperties = [
  { id: 1, title: 'Spacious Urban Plot', location: 'New Delhi, India', price: '₹5,000,000', size: '2000 sq. ft', image: 'https://via.placeholder.com/400x300.png?text=Urban+Plot' },
  { id: 2, title: 'Scenic Farmland', location: 'Pune, India', price: '₹8,500,000', size: '5 acres', image: 'https://via.placeholder.com/400x300.png?text=Farmland' },
  { id: 3, title: 'Commercial Property', location: 'Mumbai, India', price: '₹12,000,000', size: '1500 sq. ft', image: 'https://via.placeholder.com/400x300.png?text=Commercial+Property' },
  { id: 4, title: 'Residential Villa Plot', location: 'Bengaluru, India', price: '₹7,200,000', size: '4000 sq. ft', image: 'https://via.placeholder.com/400x300.png?text=Villa+Plot' },
  { id: 5, title: 'Lakeside Acreage', location: 'Hyderabad, India', price: '₹9,800,000', size: '3 acres', image: 'https://via.placeholder.com/400x300.png?text=Lakeside+Plot' },
  { id: 6, title: 'Prime Retail Space', location: 'Chennai, India', price: '₹15,000,000', size: '1000 sq. ft', image: 'https://via.placeholder.com/400x300.png?text=Retail+Space' },
];

const PropertyCard = ({ property }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
    <img src={property.image} alt={property.title} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="text-xl font-bold text-gray-900 truncate mb-1">{property.title}</h3>
      <p className="flex items-center text-sm text-gray-500 mb-3">
        <MapPin className="w-4 h-4 mr-1 text-blue-500" />
        {property.location}
      </p>
      <div className="flex items-center justify-between mb-4">
        <p className="flex items-center text-lg font-bold text-green-600">
          <DollarSign className="w-5 h-5 mr-1" />
          {property.price}
        </p>
        <p className="flex items-center text-sm text-gray-600">
          <Ruler className="w-4 h-4 mr-1" />
          {property.size}
        </p>
      </div>
      <Link to={`/buyer-dashboard/property/${property.id}`} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors block text-center">
        View Details
      </Link>
    </div>
  </div>
);

const MarketplaceBrowse = () => {
  const { isVerified } = useBuyer();

  if (!isVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Lock className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-lg text-gray-600 max-w-xl">
          You must complete the verification process to browse properties on the marketplace. Please go to the{' '}
          <Link to="/buyer-dashboard/verification" className="text-blue-600 hover:underline font-semibold">Verification page</Link> to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-lg text-gray-600">Browse a wide selection of verified properties available for purchase.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockProperties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};

export default MarketplaceBrowse;