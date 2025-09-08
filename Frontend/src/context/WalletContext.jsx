import React, { createContext, useContext, useState } from 'react';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  // Use a static address for a Land Inspector for demonstration
  const [accounts, setAccounts] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // New state to track connection

  // Mock provider and signer objects
  const [provider] = useState({ /* Mock provider object */ });
  const [signer] = useState({ /* Mock signer object */ });

  // This mock function now simulates the connection action
  const connectWallet = (role) => {
    console.log("Simulating wallet connection for role:", role);
    // Simulate a successful connection by updating state
    setIsConnected(true);
    setAccounts(['0x74aC51622329A384D02f54a8b79b8a3F51D61D23']);
    setUserRole(role);
  };

  return (
    <WalletContext.Provider value={{ accounts, connectWallet, provider, signer, userRole, isConnected }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);