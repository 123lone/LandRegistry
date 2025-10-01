import React from 'react';
import { useAuth } from '../../context/AuthContext';

const OwnerProfile = () => {
  const { user } = useAuth();

  // The component no longer manages loading or error states.
  // It assumes the AuthContext provides a complete user object.
  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  // The original UI is kept, but the data source is simplified.
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user.name || 'User'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Profile</h2>
          <div className="space-y-2">
            {/* This data still comes directly from the user object */}
            <p><strong>Wallet Address:</strong> {user.walletAddress || 'Not connected'}</p>
            <p><strong>Email:</strong> {user.email || 'N/A'}</p>
          </div>
        </div>
      
      </div>
    </div>
  );
};

export default OwnerProfile;