import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// --- 1. IMPORT THE HOOKS FROM YOUR CONTEXTS ---
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../context/WalletContext"; // Import the useWallet hook

import {
  User,
  PlusCircle,
  Map,
  MessageSquare,
  Send,
  LogOut,
  CheckCircle,
  Search,
  Home,
  History,
} from "lucide-react";

// Helper to shorten wallet address
const truncateAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const Header = () => {
  const { logout, user, updateUser } = useAuth();

  // --- 2. GET WALLET STATE FROM THE CONTEXT ---
  const { account, connectWallet } = useWallet(); // Get the live account and connect function

  const navigate = useNavigate();
  const location = useLocation();

  // This function still saves the address to your backend database
  const saveWalletAddressToDB = async (address) => {
    try {
      if (user.walletAddress === address) {
        console.log("Wallet already saved to user profile.");
        return;
      }
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/wallet", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to save wallet address.");
      }
      if (updateUser) updateUser(data);
      alert("Wallet connected and saved to your profile successfully!");
    } catch (error) {
      console.error("API Error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // --- 3. CREATE A NEW HANDLER TO CONNECT AND SAVE ---
  // This new function uses the logic from both contexts
  const handleConnectAndSave = async () => {
    try {
      // First, connect the wallet using the logic from WalletContext
      const newAccount = await connectWallet("user"); // Or 'buyer', 'seller'

      // If the connection is successful, then save the address to the backend
      if (newAccount) {
        await saveWalletAddressToDB(newAccount);
      }
    } catch (error) {
      console.error(
        "Error during wallet connection and saving process:",
        error
      );
      alert("An error occurred during the connection process.");
    }
  };

  // ... (All your existing navigation and styling logic remains the same, as it's excellent) ...
  const isVerifierPage = location.pathname.startsWith("/verifier");
  const isOwnerDashboard = location.pathname.startsWith("/owner-dashboard");
  const isBuyerDashboard = location.pathname.startsWith("/buyer-dashboard");
  const isGovernmentRegistry = location.pathname.startsWith(
    "/government-registry"
  );

  if (isGovernmentRegistry) return null;

  const isDashboardOrVerifier =
    isVerifierPage || isOwnerDashboard || isBuyerDashboard;
  const headerClasses = isDashboardOrVerifier
    ? "bg-white text-gray-800 shadow-sm"
    : "bg-gray-900 text-white shadow-lg";
  const linkClasses = isDashboardOrVerifier
    ? "text-gray-600 hover:text-blue-600"
    : "text-gray-400 hover:text-blue-400";
  const logoColor = isDashboardOrVerifier ? "text-gray-900" : "text-white";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getSubNavLinkClass = (path) => {
    const isActive =
      location.pathname === path ||
      (location.pathname === "/owner-dashboard" &&
        path === "/owner-dashboard/profile");
    return `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
    }`;
  };

  const buyerNavItems = [
    {
      name: "Profile",
      path: "/buyer-dashboard/profile",
      icon: <User className="h-4 w-4" />,
    },
    {
      name: "Verification",
      path: "/buyer-dashboard/verification",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      name: "Browse",
      path: "/buyer-dashboard/browse",
      icon: <Search className="h-4 w-4" />,
    },
    {
      name: "My Properties",
      path: "/buyer-dashboard/properties",
      icon: <Home className="h-4 w-4" />,
    },
    {
      name: "History",
      path: "/buyer-dashboard/purchase-history",
      icon: <History className="h-4 w-4" />,
    },
  ];

  return (
    <header className={`${headerClasses} sticky top-0 z-50`}>
      <div className="container mx-auto">
        <div className="flex justify-between items-center p-4">
          <Link to="/" className={`text-xl md:text-2xl font-bold ${logoColor}`}>
            Land Registry
          </Link>

          {(isOwnerDashboard || isBuyerDashboard) && user && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
              <div className="hidden md:block">
                <h3 className="font-medium text-gray-800">
                  {isOwnerDashboard ? "Land Owner" : "Property Buyer"}
                </h3>
                <p className="text-sm text-gray-500">{user.name || "User"}</p>
              </div>
            </div>
          )}

          <nav className="hidden md:flex items-center space-x-6">
            {isVerifierPage ? (
              <>
                <Link
                  to="/verifier-dashboard"
                  className={`${linkClasses} font-medium`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/verifier/users"
                  className={`${linkClasses} font-medium`}
                >
                  Verify User
                </Link>
                <Link
                  to="/verifier/lands"
                  className={`${linkClasses} font-medium`}
                >
                  Verify Land
                </Link>
                <Link
                  to="/verifier/transfers"
                  className={`${linkClasses} font-medium`}
                >
                  Transfer Ownership
                </Link>
              </>
            ) : !isDashboardOrVerifier ? (
              <>
                <Link to="/" className={`${linkClasses} font-medium`}>
                  HOME
                </Link>
                <Link to="/about-us" className={`${linkClasses} font-medium`}>
                  ABOUT US
                </Link>
                <Link to="/faq" className={`${linkClasses} font-medium`}>
                  FAQ
                </Link>
                <Link to="/contact-us" className={`${linkClasses} font-medium`}>
                  CONTACT US
                </Link>
              </>
            ) : null}
          </nav>

          <div className="flex items-center">
            {/* --- 4. UPDATE THE UI TO USE THE NEW LOGIC --- */}
            {user &&
              user.kycStatus === "verified" &&
              // Use the 'account' from WalletContext for real-time status
              (account ? (
                <div className="bg-green-100 text-green-800 px-4 py-2 font-semibold rounded-lg text-sm">
                  {truncateAddress(account)}
                </div>
              ) : (
                <button
                  // The button now calls the new handler function
                  onClick={handleConnectAndSave}
                  className="bg-blue-600 text-white px-4 py-2 font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                  Connect Wallet
                </button>
              ))}
          </div>
        </div>

        {/* --- All your sub-navigation logic remains unchanged --- */}
        {isOwnerDashboard && (
          <nav className="border-t border-gray-200 px-4 py-3">
            <div className="flex flex-wrap gap-2 md:gap-4">
              <Link
                to="/owner-dashboard/profile"
                className={getSubNavLinkClass("/owner-dashboard/profile")}
              >
                <User className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                to="/owner-dashboard/add-land"
                className={getSubNavLinkClass("/owner-dashboard/add-land")}
              >
                <PlusCircle className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Add Land</span>
              </Link>
              <Link
                to="/owner-dashboard/my-lands"
                className={getSubNavLinkClass("/owner-dashboard/my-lands")}
              >
                <Map className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">My Lands</span>
              </Link>
              <Link
                to="/owner-dashboard/received-requests"
                className={getSubNavLinkClass(
                  "/owner-dashboard/received-requests"
                )}
              >
                <MessageSquare className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Requests</span>
              </Link>
              <Link
                to="/owner-dashboard/requests"
                className={getSubNavLinkClass("/owner-dashboard/requests")}
              >
                <Send className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Sent</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </nav>
        )}
        {isBuyerDashboard && (
          <nav className="border-t border-gray-200 px-4 py-3">
            <div className="flex flex-wrap gap-2 md:gap-4">
              {buyerNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={getSubNavLinkClass(item.path)}
                >
                  {item.icon}{" "}
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
