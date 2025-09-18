import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [error, setError] = useState('');

    // This function centralizes the logic for updating the wallet state
    const updateWallet = useCallback(async (accounts) => {
        if (accounts.length > 0) {
            const currentAccount = accounts[0];
            setAccount(currentAccount);
            
            const ethersProvider = new BrowserProvider(window.ethereum);
            const currentSigner = await ethersProvider.getSigner();
            setProvider(ethersProvider);
            setSigner(currentSigner);
            setError('');
        } else {
            setAccount(null);
            setProvider(null);
            setSigner(null);
            setUserRole(null);
        }
    }, []);


    useEffect(() => {
        if (typeof window.ethereum === 'undefined') {
            setError('MetaMask is not installed.');
            return;
        }

        // Listen for account changes
        const handleAccountsChanged = (accounts) => updateWallet(accounts);
        window.ethereum.on('accountsChanged', handleAccountsChanged);

        // Check for existing connected accounts on page load
        const checkExistingConnection = async () => {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            await updateWallet(accounts);
        };
        checkExistingConnection();

        // Cleanup listener on component unmount
        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, [updateWallet]);

    const connectWallet = async (role) => {
        if (typeof window.ethereum === 'undefined') {
            setError('MetaMask is not installed.');
            return null;
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            await updateWallet(accounts);
            setUserRole(role); // Set role based on which button was clicked
            return accounts[0]; // Return the connected account
        } catch (err) {
            console.error("Connection request failed:", err);
            setError('User denied account access.');
            return null;
        }
    };

    const value = { account, connectWallet, provider, signer, userRole, error };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);