import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignUpPage from './pages/auth/SignUpPage';
// Import the new BuyerContext provider
import { BuyerProvider } from './context/BuyerContext';
import LoginPage from './pages/auth/LoginPage';
// General Layout Components
import Header from './components/Header';

// Main Dashboard & Public Pages
import MainDashboard from './pages/Dashboard/MainDashboard';
import LandGalleryPage from './pages/marketplace/LandGalleryPage';
import AboutUsPage from './pages/AboutUsPage';
import FAQPage from './pages/FAQPage';
import ContactUsPage from './pages/ContactUsPage';

// Government Registry Pages
import GovernmentRegistryPage from './pages/government/GovernmentRegistryPage';

// Buyer Pages (Corrected import paths)
import BuyerDashboard from './pages/Buyer/BuyerDashboard';
import BuyerVerification from './pages/Buyer/BuyerVerification';
import MarketplaceBrowse from './pages/Buyer/MarketplaceBrowse';
import PropertyDetails from './pages/Buyer/PropertyDetails';
import PurchaseHistory from './pages/Buyer/PurchaseHistory';
import BuyerProfile from './pages/Buyer/BuyerProfile';
import BuyerProperties from './pages/Buyer/BuyerProperties'; // Added this import

const LandDetailsPage = () => <div className="py-24 text-center">Land Details Page Coming Soon!</div>;

// Land Inspector (Verifier) Pages
import VerifierDashboardPage from './pages/verifier/VerifierDashboardPage';
import VerifyUsersPage from './pages/auth/VerifyUsersPage';
import VerifyLandsPage from './pages/verifier/VerifyLandsPage';
import TransferOwnershipPage from './pages/owner/TransferOwnershipPage';
import TaskDetailsPage from './pages/TaskDetailsPage';

// Land Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerProfile from './pages/owner/OwnerProfile';
import AddLandPage from './pages/owner/AddLandPage';
import MyLandsPage from './pages/owner/MyLandsPage';
import ReceivedRequestsPage from './pages/verifier/ReceivedRequestsPage';
import SentRequestsPage from './pages/verifier/SentRequestsPage';

function App() {
  return (
    <BuyerProvider>
      <div className="bg-gray-100 text-gray-800 min-h-screen flex flex-col">
        <Header /> 
        
        <div className="flex-grow">
          <Routes>

             // login and signup route
            <Route path="/register" element={<SignUpPage />} /> {/* Add this route */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<MainDashboard />} /> 
            
            {/* Public Routes from Header */}
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
           
            <Route path="/marketplace" element={<LandGalleryPage />} />
            <Route path="/land/:id" element={<LandDetailsPage />} />
           
            
            {/* Government Registry Route */}
            <Route path="/government-registry" element={<GovernmentRegistryPage />} />
            
            {/* Nested Routes for Buyer Dashboard */}
            <Route path="/buyer-dashboard" element={<BuyerDashboard />}>
              <Route index element={<BuyerProfile />} /> {/* Added index route for default */}
              <Route path="profile" element={<BuyerProfile />} />
              <Route path="verification" element={<BuyerVerification />} />
              <Route path="browse" element={<MarketplaceBrowse />} />
              <Route path="property/:id" element={<PropertyDetails />} />
              <Route path="purchase-history" element={<PurchaseHistory />} />
              <Route path="properties" element={<BuyerProperties />} /> {/* Added this route */}
            </Route>
            
            {/* Nested Routes for Land Owner Dashboard */}
            <Route path="/owner-dashboard" element={<OwnerDashboard />}>
              <Route index element={<OwnerProfile />} />
              <Route path="profile" element={<OwnerProfile />} />
              <Route path="add-land" element={<AddLandPage />} />
              <Route path="my-lands" element={<MyLandsPage />} />
              <Route path="received-requests" element={<ReceivedRequestsPage />} />
              <Route path="sent-requests" element={<SentRequestsPage />} />
            </Route>

            {/* Land Inspector (Verifier) Routes */}
            <Route path="/verifier-dashboard" element={<VerifierDashboardPage />} />
            <Route path="/verifier/users" element={<VerifyUsersPage />} />
            <Route path="/verifier/lands" element={<VerifyLandsPage />} />
            <Route path="/verifier/transfers" element={<TransferOwnershipPage />} />
            
            <Route path="/task/:taskId" element={<TaskDetailsPage />} />
          </Routes>
        </div>
        
      </div>
    </BuyerProvider>
  );
}

export default App;