import React from 'react';

const OwnerProfile = () => {
  const profile = {
    name: "Sahil Patil",
    address: "0x74aC...1D23",
    email: "sahil.patil@example.com",
    propertiesOwned: 5,
    totalValue: "120 ETH"
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {profile.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Profile</h2>
          <div className="space-y-2">
            <p><strong>Wallet Address:</strong> {profile.address}</p>
            <p><strong>Email:</strong> {profile.email}</p>
          </div>
        </div>
        <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Properties</h2>
          <div className="space-y-2">
            <p><strong>Properties Owned:</strong> {profile.propertiesOwned}</p>
            <p><strong>Total Value:</strong> {profile.totalValue}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfile;