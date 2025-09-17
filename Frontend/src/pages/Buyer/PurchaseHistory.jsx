import React from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, DollarSign, Ruler, FileText, CheckCircle, Upload, LinkIcon } from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams();

  // Mock property data for a specific ID
  const mockProperty = {
    id: 1,
    title: 'Spacious Urban Plot in New Delhi',
    location: 'Sainik Farm, New Delhi, India',
    price: '₹5,000,000',
    size: '2000 sq. ft',
    description: 'A prime urban plot located in a quiet, upscale neighborhood. Ideal for building a dream home or a profitable commercial venture. The area is well-connected to major city hubs and has access to all essential amenities.',
    documents: [
      { name: 'Sale Deed', ipfsHash: 'QmY8T...45c1', status: 'verified' },
      { name: 'Land Survey Report', ipfsHash: 'QmeP9...7b23', status: 'verified' },
      { name: 'No-Objection Certificate', ipfsHash: 'QmW1J...8f3a', status: 'verified' },
      { name: 'Additional Documents', ipfsHash: 'Qm2kL...9g4b', status: 'pending' },
    ],
    images: [
      'https://via.placeholder.com/800x600.png?text=Property+Image+1',
      'https://via.placeholder.com/800x600.png?text=Property+Image+2',
      'https://via.placeholder.com/800x600.png?text=Property+Image+3',
    ],
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500 mr-2" />;
      case 'pending':
        return <Upload className="w-5 h-5 text-yellow-500 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
      {/* Property Main Image and Title */}
      <div className="relative">
        <img src={mockProperty.images[0]} alt={mockProperty.title} className="w-full h-96 object-cover rounded-xl" />
        <div className="absolute bottom-4 left-4 p-4 bg-black bg-opacity-50 text-white rounded-lg">
          <h1 className="text-3xl font-bold">{mockProperty.title}</h1>
          <p className="flex items-center text-lg mt-1">
            <MapPin className="w-5 h-5 mr-2" />
            {mockProperty.location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center text-2xl font-bold text-green-600">
                <DollarSign className="w-6 h-6 mr-2" /> {mockProperty.price}
              </span>
              <span className="flex items-center text-lg text-gray-600">
                <Ruler className="w-5 h-5 mr-2" /> {mockProperty.size}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">{mockProperty.description}</p>
          </div>

          {/* Document Section */}
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Verifiable Documents
            </h2>
            <ul className="space-y-4">
              {mockProperty.documents.map((doc, index) => (
                <li key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700 flex items-center">
                    {getStatusIcon(doc.status)} {doc.name}
                  </span>
                  <a href={`https://ipfs.io/ipfs/${doc.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                    View on IPFS <LinkIcon className="w-4 h-4 ml-1" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-6 flex flex-col justify-between h-full">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Actions</h2>
            <p className="text-gray-600 mb-4">
              Once verified, you can proceed with the purchase via a secure smart contract.
            </p>
            <div className="flex flex-col space-y-4">
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Initiate Purchase
              </button>
              <button className="w-full py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                Add to Watchlist
              </button>
            </div>
          </div>
          <div className="border-t pt-4 mt-auto">
            <p className="text-sm text-gray-500">
              For security, all transactions are executed via a smart contract and require a wallet connection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;