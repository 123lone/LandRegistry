import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Mock data for a single listing. In a real app, you would fetch this based on the ID.
const mockListingDetails = {
  id: 'land-1',
  propertyAddress: '123 Blockchain Ave',
  description: 'A beautiful piece of land with great views, perfect for building a family home. The plot is located in a rapidly developing neighborhood with excellent infrastructure.',
  area: 5000,
  price: 25,
  currentOwner: '0xAbcDeF1234567890aBcDeF1234567890aBcDeF12',
  ownershipHistory: [
    { owner: '0x1234...Abcd', date: '2019-05-10', transactionHash: '0xefgh...7890' },
    { owner: '0x5678...Efgh', date: '2022-03-21', transactionHash: '0xijkl...2345' },
  ],
  documents: [
    { name: 'Property Deed.pdf', url: 'https://example.com/deed.pdf' },
    { name: 'Tax Records.pdf', url: 'https://example.com/tax.pdf' },
  ]
};

const ListingDetailsPage = () => {
  // Get the listing ID from the URL
  const { listingId } = useParams();
  const navigate = useNavigate();

  // For this mock, we'll just use the mockListingDetails
  // In a real app: const listing = fetchListing(listingId);
  const listing = mockListingDetails; 

  const handleBuyClick = () => {
    alert(`Initiating transaction for ${listing.price} ETH...`);
    // This is where you would trigger the smart contract and Metamask transaction.
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 md:px-8">
      <button
        onClick={() => navigate(-1)} // Navigate back to the previous page
        className="text-blue-600 hover:text-blue-800 font-semibold mb-6"
      >
        &larr; Back to Marketplace
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 sm:p-12">
        {/* Header and main details */}
        <div className="border-b pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.propertyAddress}</h1>
          <p className="text-xl text-blue-600 font-semibold mb-4">
            {listing.price} ETH
          </p>
          <p className="text-gray-600 mb-4">{listing.description}</p>
          <div className="flex items-center space-x-6 text-gray-700">
            <p><strong>Area:</strong> {listing.area} sq ft</p>
            <p><strong>Current Owner:</strong> <span className="font-mono">{listing.currentOwner.slice(0, 8)}...</span></p>
          </div>
        </div>

        {/* Ownership History and Documents Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
          {/* Ownership History */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ownership History</h2>
            <ul className="space-y-4">
              {listing.ownershipHistory.map((entry, index) => (
                <li key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <p className="font-medium text-gray-900">
                    Owner: <span className="font-mono text-blue-700">{entry.owner.slice(0, 10)}...</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {entry.date}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    Transaction Hash: {entry.transactionHash}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Documents */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Documents</h2>
            <ul className="space-y-4">
              {listing.documents.map((doc, index) => (
                <li key={index} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-2 2h10a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 012-2h10z" />
                  </svg>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-blue-600 hover:underline">
                    {doc.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={handleBuyClick}
            className="inline-block px-12 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-lg"
          >
            Buy Land
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsPage;