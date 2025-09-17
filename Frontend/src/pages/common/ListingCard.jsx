import React from 'react';

const ListingCard = ({ listing }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <div className="h-48 w-full">
        <img
          src={listing.image || "/land-image-01.jpg"} // fallback if no image in data
          alt="Property"
          className="h-full w-full object-cover object-top"
        />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.propertyAddress}</h3>
        <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
        <div className="flex justify-between items-center mt-4">
          <div className="text-2xl font-semibold text-blue-600">
            {listing.price} ETH
          </div>
          <div className="text-sm text-gray-500">
            Area: {listing.area} sq ft
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
