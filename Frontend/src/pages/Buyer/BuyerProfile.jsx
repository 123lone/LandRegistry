import React from 'react';
import { User, CreditCard, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BuyerProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex flex-col md:flex-row items-center justify-between border-b pb-6 mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center text-4xl font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="ml-6 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{user.name || 'User'}</h1>
            <p className="text-sm text-gray-500">Verified Buyer</p>
          </div>
        </div>
        {user.kycStatus === 'verified' && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-6 h-6 mr-2" />
            <span className="font-semibold">Verification Complete</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <CreditCard className="w-6 h-6 mr-2 text-blue-600" /> Wallet & Profile
        </h2>
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="flex items-center">
            <span className="font-medium text-gray-700">Wallet Address:</span>
            <span className="ml-auto font-mono text-sm bg-gray-200 rounded-full px-3 py-1 text-gray-800">
              {user.walletAddress || 'Not connected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;