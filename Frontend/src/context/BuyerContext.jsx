// src/context/BuyerContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BuyerContext = createContext(null);

export const BuyerProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local helper: Normalize user ID without changing AuthContext
  const getUserId = (userObj) => {
    if (!userObj) return null;
    return userObj.id || userObj._id; // Fallback to _id if id missing
  };

  // Fallback: Check local user.kycStatus if available (from login response)
  const getLocalKycStatus = (userObj) => {
    return userObj?.kycStatus === 'verified';
  };

  const fetchKycStatus = async () => {
    const userId = getUserId(user);
    // Stronger guard: Skip if not authenticated or no user ID
    if (!isAuthenticated || !userId) {
      console.log('Skipping KYC fetch: Not authenticated or missing user ID', { 
        isAuthenticated, 
        userId,
        hasLocalKyc: !!user?.kycStatus 
      });
      
      // Fallback: Use local kycStatus if stored in user object
      if (getLocalKycStatus(user)) {
        console.log('Using local kycStatus: verified');
        setIsVerified(true);
      } else {
        setIsVerified(false);
        setError('User not fully loaded. Please refresh or log in again.');
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Fetching KYC status for user:', userId);
      const response = await fetch('http://localhost:5000/api/kyc/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      console.log('KYC Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Full KYC error:', errorText);
        if (response.status === 401) {
          setError('Authentication issue. Please log in again.');
        } else if (response.status === 404) {
          setError('KYC check unavailable—using local status.');
        } else {
          setError(`Server error: ${errorText}`);
        }
        
        // Fallback on error: Use local kycStatus if available
        if (getLocalKycStatus(user)) {
          console.log('Fallback to local verified status');
          setIsVerified(true);
        } else {
          setIsVerified(false);
        }
        return;
      }

      const data = await response.json();
      console.log('Fetched KYC data:', data);
      setIsVerified(data.kycStatus === 'verified');
    } catch (err) {
      console.error('Network error fetching KYC status:', err);
      setError('Network error. Check connection.');
      
      // Fallback on network error
      if (getLocalKycStatus(user)) {
        setIsVerified(true);
      } else {
        setIsVerified(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, [isAuthenticated, user]); // Depend on user changes

  const refreshKycStatus = () => fetchKycStatus();

  return (
    <BuyerContext.Provider value={{ isVerified, loading, error, refreshKycStatus }}>
      {children}
    </BuyerContext.Provider>
  );
};

export const useBuyer = () => {
  const context = useContext(BuyerContext);
  if (!context) {
    throw new Error('useBuyer must be used within BuyerProvider');
  }
  return context;
};