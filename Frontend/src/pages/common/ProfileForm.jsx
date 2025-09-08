import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext'; // Import the wallet hook

const ProfileForm = () => {
  const { accounts, connectWallet } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'seller', // Default role
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Step 1: Trigger the Metamask connection
    await connectWallet();

    // Step 2: Check if an account is connected after the prompt
    if (accounts.length === 0) {
      alert("Please connect your MetaMask wallet to register.");
      setIsSubmitting(false);
      return;
    }

    // Combine form data with the connected wallet address
    const registrationData = {
      ...formData,
      walletAddress: accounts[0], // Use the first connected account
    };

    // Step 3: Simulate sending data to your backend or blockchain
    console.log("Submitting registration data:", registrationData);
    alert("Profile submitted for verification! A verifier will review your details shortly.");

    setIsSubmitting(false);
    // Here, you would typically redirect the user to a dashboard
    // e.g., navigate('/seller-dashboard');
  };

  const inputClasses = "mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Register Your Profile
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Please fill out your details and link your Metamask wallet.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name Input */}
        <div>
          <label htmlFor="name" className={labelClasses}>
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className={inputClasses}
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className={labelClasses}>
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={inputClasses}
          />
        </div>

        {/* Role Selection */}
        <div>
          <label htmlFor="role" className={labelClasses}>
            I want to register as a:
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className={inputClasses}
          >
            <option value="seller">Seller</option>
            <option value="buyer">Buyer</option>
          </select>
        </div>

        {/* Wallet Status Display */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-gray-300">
          <span className="font-medium text-gray-700">
            Wallet Status:
          </span>
          {accounts.length > 0 ? (
            <span className="text-sm font-mono text-green-600 truncate">
              Connected: {accounts[0]}
            </span>
          ) : (
            <span className="text-sm text-red-600">
              Not Connected
            </span>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Connecting...' : 'Register & Connect Wallet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;