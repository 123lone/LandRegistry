import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const BuyerContext = createContext(null);

export const BuyerProvider = ({ children }) => {
  // Get the full auth state, including the token
  const { user, isAuthenticated, token } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserId = (userObj) => {
    if (!userObj) return null;
    return userObj.id || userObj._id;
  };

  const getLocalKycStatus = (userObj) => {
    return userObj?.kycStatus === "verified";
  };

  const fetchKycStatus = useCallback(async () => {
    // --- THE FIX IS HERE: We now check for the token as well ---
    const userId = getUserId(user);
    if (!isAuthenticated || !userId || !token) {
      console.log(
        "Skipping KYC fetch: Not authenticated, missing user ID, or no token."
      );

      if (getLocalKycStatus(user)) {
        setIsVerified(true);
      } else {
        setIsVerified(false);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Fetching KYC status for user:", userId);
      // --- THE FIX IS HERE: Add the Authorization header ---
      const response = await fetch("http://localhost:5000/api/kyc/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // This proves to the backend who is making the request
        },
      });

      console.log("KYC Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.json();
        console.error("Full KYC error:", errorText.message);
        throw new Error(errorText.message || `Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched KYC data:", data);
      setIsVerified(data.kycStatus === "verified");
    } catch (err) {
      console.error("Network error fetching KYC status:", err);
      setError(
        "Could not fetch verification status. Using local data as fallback."
      );

      // Fallback on any error
      if (getLocalKycStatus(user)) {
        setIsVerified(true);
      } else {
        setIsVerified(false);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, token]); // Add token to dependency array

  useEffect(() => {
    fetchKycStatus();
  }, [fetchKycStatus]); // useEffect now depends on the useCallback function

  const refreshKycStatus = () => fetchKycStatus();

  return (
    <BuyerContext.Provider
      value={{ isVerified, loading, error, refreshKycStatus }}
    >
      {children}
    </BuyerContext.Provider>
  );
};

export const useBuyer = () => {
  const context = useContext(BuyerContext);
  if (!context) {
    throw new Error("useBuyer must be used within BuyerProvider");
  }
  return context;
};
