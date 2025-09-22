import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const BuyerContext = createContext(null);

export const BuyerProvider = ({ children }) => {
  const { user, isAuthenticated, token } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserId = (userObj) => userObj?.id || userObj?._id || null;
  const getLocalKycStatus = (userObj) => userObj?.kycStatus === "verified";

  const fetchKycStatus = useCallback(async () => {
    const userId = getUserId(user);
    if (!isAuthenticated || !userId || !token) {
      setIsVerified(getLocalKycStatus(user));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/kyc/status", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(errorText.message || `Status: ${response.status}`);
      }
      const data = await response.json();
      setIsVerified(data.kycStatus === "verified");
    } catch (err) {
      console.error("KYC fetch error:", err);
      setError("Could not fetch KYC status. Using local fallback.");
      setIsVerified(getLocalKycStatus(user));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, token]);

  useEffect(() => {
    fetchKycStatus();
  }, [fetchKycStatus]);

  return (
    <BuyerContext.Provider value={{ isVerified, loading, error, refreshKycStatus: fetchKycStatus }}>
      {children}
    </BuyerContext.Provider>
  );
};

export const useBuyer = () => {
  const context = useContext(BuyerContext);
  if (!context) throw new Error("useBuyer must be used within BuyerProvider");
  return context;
};
