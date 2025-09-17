import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers, BrowserProvider } from 'ethers';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userRole, setUserRole] = useState(null); // New state for user role

  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum) {
        try {
          const ethersProvider = new BrowserProvider(window.ethereum);
          setProvider(ethersProvider);
          const currentSigner = await ethersProvider.getSigner();
          setSigner(currentSigner);

          window.ethereum.on('accountsChanged', (newAccounts) => {
            if (newAccounts.length === 0) {
              setAccounts([]);
              setUserRole(null); // Reset role on disconnect
            } else {
              setAccounts(newAccounts);
            }
          });

          const initialAccounts = await ethersProvider.listAccounts();
          if (initialAccounts.length > 0) {
            setAccounts(initialAccounts);
            // In a real app, you'd fetch the role from your backend here
            // For now, let's assume they are a Land Owner by default for the demo
            setUserRole('landOwner');
          }
        } catch (error) {
          console.error("Error initializing wallet provider:", error);
        }
      }
    };
    initializeProvider();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  const connectWallet = async (role) => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to continue.");
      return;
    }
    try {
      const newAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccounts(newAccounts);
      setUserRole(role); // Set the role based on which button was clicked
    } catch (error) {
      console.error("User denied account access:", error);
    }
  };

  return (
    <WalletContext.Provider value={{ accounts, connectWallet, provider, signer, userRole }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);