import React, { useState } from 'react';
import { User, FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useBuyer } from '../../context/BuyerContext';

const BuyerVerification = () => {
  const { isVerified, simulateVerification } = useBuyer();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulate file upload and submission to inspector
  const handleAadhaarUpload = () => {
    setIsSubmitting(true);
    // Simulate API call to send data to inspector
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(2); // Move to Awaiting Review step
      simulateVerification(); // Start the mock approval process
    }, 2000); // Wait 2 seconds for upload
  };

  const renderStatus = () => {
    if (isVerified) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center flex flex-col items-center justify-center">
          <CheckCircle className="w-20 h-20 text-green-500 mb-6 animate-pulse" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification Complete!</h1>
          <p className="text-gray-600">
            Congratulations! You are now a verified buyer. You can now access exclusive listings and participate in land purchases.
          </p>
        </div>
      );
    }

    // Unverified flow
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Buyer Verification</h1>
        <p className="text-gray-600 mb-8">
          To ensure a safe and secure marketplace, please upload your Aadhaar card for verification by a certified Land Inspector.
        </p>

        {/* Progress bar */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex flex-col items-center relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <User className="w-6 h-6" />
            </div>
            <span className="mt-2 text-sm font-medium text-center">Connected</span>
          </div>
          <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className="flex flex-col items-center relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <FileText className="w-6 h-6" />
            </div>
            <span className="mt-2 text-sm font-medium text-center">Aadhaar Upload</span>
          </div>
          <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className="flex flex-col items-center relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <Clock className="w-6 h-6" />
            </div>
            <span className="mt-2 text-sm font-medium text-center">Awaiting Approval</span>
          </div>
        </div>

        {/* Action based on step */}
        {currentStep === 1 && (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Upload Your Aadhaar Card</h2>
            <p className="text-gray-600 mb-6">
              Please click the button below to simulate uploading your Aadhaar card for review.
            </p>
            <button
              onClick={handleAadhaarUpload}
              disabled={isSubmitting}
              className={`px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isSubmitting && 'opacity-50 cursor-not-allowed'}`}
            >
              {isSubmitting ? 'Uploading...' : 'Upload Aadhaar Card'}
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Awaiting Land Inspector Approval</h2>
            <p className="text-gray-600">
              Your Aadhaar card has been submitted and is now being reviewed. This process is expected to take a few minutes.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              You will be notified once your verification is complete.
            </p>
          </div>
        )}
      </div>
    );
  };

  return <>{renderStatus()}</>;
};

export default BuyerVerification;