import React, { createContext, useState, useContext } from 'react';

// Create the context
const BuyerContext = createContext();

// Create a provider component
export const BuyerProvider = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);

  // You can also add functions here to handle the verification process
  const simulateVerification = () => {
    // In a real app, this would be an API call after inspector approval
    setTimeout(() => {
      setIsVerified(true);
      alert('Verification successful! You can now browse and buy lands.');
    }, 3000); // Simulate a 3-second approval process
  };

  return (
    <BuyerContext.Provider value={{ isVerified, setIsVerified, simulateVerification }}>
      {children}
    </BuyerContext.Provider>
  );
};

// Custom hook to use the context
export const useBuyer = () => useContext(BuyerContext);