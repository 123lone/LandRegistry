import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { User, CheckCircle, Search, Home, Star, List, ShoppingCart, History, Settings } from 'lucide-react';

const Header = () => {
  const { accounts, connectWallet, userRole } = useWallet();
  const isConnected = accounts.length > 0;
  const location = useLocation();

  const truncateAddress = (address) => {
    if (typeof address === 'string' && address.length > 10) {
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
    return address;
  };

  // Check different page types
  const isVerifierPage = location.pathname.startsWith('/verifier');
  const isOwnerDashboard = location.pathname.startsWith('/owner-dashboard');
  const isBuyerDashboard = location.pathname.startsWith('/buyer-dashboard');
  const isGovernmentRegistry = location.pathname.startsWith('/government-registry');

  // Do not show header only on Government Registry pages
  if (isGovernmentRegistry) {
    return null;
  }

  // Dynamic classes for styling
  const headerClasses = (isVerifierPage || isOwnerDashboard || isBuyerDashboard || isConnected) ? "bg-white text-gray-800 shadow-sm" : "bg-gray-900 text-white shadow-lg";
  const linkClasses = (isVerifierPage || isOwnerDashboard || isBuyerDashboard || isConnected) ? "text-gray-600 hover:text-blue-600" : "text-gray-400 hover:text-blue-400";
  const logoColor = (isVerifierPage || isOwnerDashboard || isBuyerDashboard || isConnected) ? "text-gray-900" : "text-white";
  const walletButtonColor = "bg-blue-600 text-white hover:bg-blue-700";

  // Navigation items for buyer dashboard
  const buyerNavItems = [
    { name: 'Profile', path: 'profile', icon: <User className="h-4 w-4" /> },
    { name: 'Verification', path: 'verification', icon: <CheckCircle className="h-4 w-4" /> },
    { name: 'Browse', path: 'browse', icon: <Search className="h-4 w-4" /> },
    { name: 'My Properties', path: 'properties', icon: <Home className="h-4 w-4" /> },
    { name: 'History', path: 'purchase-history', icon: <History className="h-4 w-4" /> },
  ];

  const getNavLinkClass = (path) => {
    const isActive = location.pathname === `/buyer-dashboard/${path}` || (location.pathname === '/buyer-dashboard' && path === 'profile');
    return `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;
  };

  return (
    <header className={`${headerClasses} sticky top-0 z-50`}>
      <div className="container mx-auto">
        {/* Main header row */}
        <div className="flex justify-between items-center p-4">
          <Link to="/" className={`text-xl md:text-2xl font-bold ${logoColor}`}>
            Land Registry
          </Link>
          
          {/* User Info (only show on owner dashboard) */}
          {isOwnerDashboard && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="hidden md:block">
                <h3 className="font-medium text-gray-800">Land Owner</h3>
                <p className="text-sm text-gray-500">Sahil Patil</p>
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <nav className="flex items-center space-x-6">
            {isVerifierPage ? (
              <>
                <Link to="/verifier-dashboard" className={`${linkClasses} transition-colors hidden md:inline-block font-medium`}>
                  Dashboard
                </Link>
                <Link to="/verifier/users" className={`${linkClasses} transition-colors hidden md:inline-block font-medium`}>
                  Verify User
                </Link>
                <Link to="/verifier/lands" className={`${linkClasses} transition-colors hidden md:inline-block font-medium`}>
                  Verify Land
                </Link>
                <Link to="/verifier/transfers" className={`${linkClasses} transition-colors hidden md:inline-block font-medium`}>
                  Transfer Ownership
                </Link>
              </>
            ) : !isOwnerDashboard && !isBuyerDashboard ? (
              <>
                <Link to="/" className={`${linkClasses} transition-colors hidden md:inline-block font-medium`}>
                  HOME
                </Link>
                <Link to="/about-us" className={`${linkClasses} transition-colors hidden md:inline-block font-medium`}>
                  ABOUT US
                </Link>
                <Link to="/faq" className={`${linkClasses} transition-colors hidden md:inline-block font-medium`}>
                  FAQ
                </Link>
                <Link to="/contact-us" className={`${linkClasses} transition-colors hidden md:inline-block font-medium`}>
                  CONTACT US
                </Link>
              </>
            ) : null}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="px-3 py-1 text-green-600 font-semibold rounded-md border border-green-300 text-sm">
                {truncateAddress(accounts[0])}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className={`px-4 py-2 ${walletButtonColor} font-semibold rounded-lg shadow-md transition-colors`}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Owner Dashboard Sub-Navigation */}
        {isOwnerDashboard && (
          <nav className="border-t border-gray-200 px-4 py-3">
            <div className="flex flex-wrap gap-2 md:gap-4">
              <Link 
                to="/owner-dashboard/profile"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/owner-dashboard/profile' || location.pathname === '/owner-dashboard'
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link 
                to="/owner-dashboard/add-land"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/owner-dashboard/add-land'
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Add Land</span>
              </Link>
              <Link 
                to="/owner-dashboard/my-lands"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/owner-dashboard/my-lands'
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">My Lands</span>
              </Link>
              <Link 
                to="/owner-dashboard/received-requests"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/owner-dashboard/received-requests'
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.83l-1.553 1.553A.809.809 0 016 16.484V14H4a2 2 0 00-2 2v2a2 2 0 002 2h14a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                </svg>
                <span className="hidden sm:inline">Received</span>
              </Link>
              <Link 
                to="/owner-dashboard/sent-requests"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/owner-dashboard/sent-requests'
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <span className="hidden sm:inline">Sent</span>
              </Link>
              <Link 
                to="/" 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </Link>
            </div>
          </nav>
        )}

        {/* Buyer Dashboard Sub-Navigation */}
        {isBuyerDashboard && (
          <nav className="border-t border-gray-200 px-4 py-3">
            <div className="flex flex-wrap gap-2 md:gap-4">
              {buyerNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={`/buyer-dashboard/${item.path}`}
                  className={getNavLinkClass(item.path)}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              ))}
              <Link 
                to="/" 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;