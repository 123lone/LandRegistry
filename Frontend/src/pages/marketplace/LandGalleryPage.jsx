import React from 'react';
import { Link } from 'react-router-dom';

const mockLands = [
  { id: 1, pid: 'LND-101', location: 'Pune', price: '20 ETH', image: 'https://via.placeholder.com/150' },
  { id: 2, pid: 'LND-102', location: 'Mumbai', price: '35 ETH', image: 'https://via.placeholder.com/150' },
];

const LandGalleryPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Land Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockLands.map(land => (
          <div key={land.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={land.image} alt={land.location} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900">{land.pid}</h3>
              <p className="text-sm text-gray-500">{land.location}</p>
              <p className="text-xl font-bold text-blue-600 mt-2">{land.price}</p>
              <Link to={`/land/${land.id}`} className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandGalleryPage;