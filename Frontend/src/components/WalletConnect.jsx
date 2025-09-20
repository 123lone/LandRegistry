import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ethers, BrowserProvider } from "ethers";

// Import your contract ABIs from your '/abis' folder
import PropertyTitleABI from "../abis/PropertyTitle.json";
import MarketplaceABI from "../abis/Marketplace.json";

// --- Read the contract addresses from the .env file ---
// Make sure you have a .env file in your /frontend folder
// with VITE_PROPERTY_TITLE_ADDRESS="0x..." and VITE_MARKETPLACE_ADDRESS="0x..."
const propertyTitleAddress = import.meta.env.VITE_PROPERTY_TITLE_ADDRESS;
const marketplaceAddress = import.meta.env.VITE_MARKETPLACE_ADDRESS;

// Create the context
const WalletContext = createContext();

// Create a custom hook to easily use the context in other components
export const useWallet = () => useContext(WalletContext);

// Create the provider component that will wrap your entire app
export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState("");

  // State for your smart contract instances
  const [propertyTitleContract, setPropertyTitleContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);

  // This function centralizes the logic for updating the wallet and loading contracts
  const updateWallet = useCallback(async (accounts) => {
    if (accounts.length > 0) {
      const currentAccount = accounts[0];
      setAccount(currentAccount);

      const ethersProvider = new BrowserProvider(window.ethereum);
      const currentSigner = await ethersProvider.getSigner();
      setProvider(ethersProvider);
      setSigner(currentSigner);

      // --- LOAD CONTRACTS ---
      // Create instances of your contracts with the user's signer
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

      // --- ADDED TESTING LINES ---
      // These will print to your browser's developer console (F12)
      console.log("✅ Wallet connected successfully:", currentAccount);
      console.log("✅ Contracts loaded:", { ptContract, mpContract });
      // -------------------------

      setError("");
    } else {
      // No account is connected, so clear everything
      setAccount(null);
      setProvider(null);
      setSigner(null);
      setUserRole(null);
      setPropertyTitleContract(null);
      setMarketplaceContract(null);
    }
  }, []);

  // This effect runs on page load to handle wallet events
  useEffect(() => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed.");
      return;
    }

    // Listen for when the user changes their account in MetaMask
    const handleAccountsChanged = (accounts) => updateWallet(accounts);
    window.ethereum.on("accountsChanged", handleAccountsChanged);

    // Check for any accounts that are already connected when the page loads
    const checkExistingConnection = async () => {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      await updateWallet(accounts);
    };
    checkExistingConnection();

    // Cleanup the event listener when the component unmounts
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [updateWallet]);

  // This function is called by your "Connect Wallet" button
  const connectWallet = async (role) => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed.");
      return null;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      await updateWallet(accounts);
      setUserRole(role); // Set role based on which button was clicked
      return accounts[0];
    } catch (err) {
      console.error("Connection request failed:", err);
      setError("User denied account access.");
      return null;
    }
  };

  // The value object provides all the necessary data to the rest of your app
  const value = {
    account,
    provider,
    signer,
    userRole,
    error,
    propertyTitleContract,
    marketplaceContract,
    connectWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
