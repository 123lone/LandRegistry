import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext.jsx'; // Import the WalletProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    
      <WalletProvider> {/* Wrap your app with the WalletProvider */}
        <App />
      </WalletProvider>
    </BrowserRouter>
  </React.StrictMode>,
);