import React from 'react';

import ListingCard from '../common/ListingCard'; // Import the new component

// Mock data for land listings. In a real application, this would be fetched from your system.
const mockListings = [
  {
    id: 'land-1',
    propertyAddress: '123 Blockchain Ave',
    description: 'A beautiful piece of land with great views, perfect for building a family home.',
    area: 5000,
    price: 25,
  },
  {
    id: 'land-2',
    propertyAddress: '456 Crypto Lane',
    description: 'Spacious plot in a developing area, close to public transport.',
    area: 8000,
    price: 40,
  },
  {
    id: 'land-3',
    propertyAddress: '789 Smart Contract Blvd',
    description: 'Prime commercial land suitable for a business or office building.',
    area: 3500,
    price: 30,
  },
  {
    id: 'land-4',
    propertyAddress: '101 Ethereum Drive',
    description: 'Rural property with easy access to main roads, ideal for farming.',
    area: 12000,
    price: 15,
  },
];

const MarketplacePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Available Land Listings
        </h1>

        {/* Grid of Listings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockListings.length > 0 ? (
            mockListings.map(listing => (
              // Here we will use React Router's Link to go to a details page
              // For now, let's just render the card.
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 p-8 border border-dashed rounded-lg">
              No land listings are currently available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;