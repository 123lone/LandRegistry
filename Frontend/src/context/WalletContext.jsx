import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ethers } from "ethers";

// Import your contract ABIs
import PropertyTitleABI from "../abis/PropertyTitle.json";
import MarketplaceABI from "../abis/Marketplace.json";

// Read the contract addresses from the .env file
const propertyTitleAddress = import.meta.env.VITE_PROPERTY_TITLE_ADDRESS;
const marketplaceAddress = import.meta.env.VITE_MARKETPLACE_ADDRESS;

// Create the context
const WalletContext = createContext();

// Custom hook for easier access
export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState("");

  const [isConnected, setIsConnected] = useState(false);

  // Contract states
  const [propertyTitleContract, setPropertyTitleContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);

  // Update wallet and load contracts
  const updateWalletState = useCallback(async (accounts, fromExplicit = false) => {
    if (accounts.length > 0) {
      const currentAccount = accounts[0];
      setAccount(currentAccount);

      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const currentSigner = await ethersProvider.getSigner();
      setProvider(ethersProvider);
      setSigner(currentSigner);

      // Load contracts
      const ptContract = new ethers.Contract(
        propertyTitleAddress,
        PropertyTitleABI.abi,
        currentSigner
      );
      const mpContract = new ethers.Contract(
        marketplaceAddress,
        MarketplaceABI.abi,
        currentSigner
      );
      setPropertyTitleContract(ptContract);
      setMarketplaceContract(mpContract);

      // ✅ Only mark connected if user explicitly clicked connect
      if (fromExplicit) {
        setIsConnected(true);
      }

      setError("");
    } else {
      // No wallet connected → clear everything
      setAccount(null);
      setProvider(null);
      setSigner(null);
      setUserRole(null);
      setPropertyTitleContract(null);
      setMarketplaceContract(null);
      setIsConnected(false);
    }
  }, []);

  // Handle wallet events on page load
  useEffect(() => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed.");
      return;
    }

    const handleAccountsChanged = (accounts) => updateWalletState(accounts);
    window.ethereum.on("accountsChanged", handleAccountsChanged);

    // Only check if wallet is unlocked, but don't auto-mark as connected
    const checkExistingConnection = async () => {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      await updateWalletState(accounts, false); // ❌ not explicit, so isConnected=false
    };
    checkExistingConnection();

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [updateWalletState]);

  // Connect Wallet (explicit call from button)
  const connectWallet = async (role) => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed.");
      return null;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      await updateWalletState(accounts, true); // ✅ explicit connection
      setUserRole(role);
      return accounts[0];
    } catch (err) {
      console.error("Connection request failed:", err);
      setError("User denied account access.");
      return null;
    }
  };

  // Provide values to app
  const value = {
    account,
    provider,
    signer,
    userRole,
    error,
    propertyTitleContract,
    marketplaceContract,
    connectWallet,
    isConnected, // expose explicit connection state
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
