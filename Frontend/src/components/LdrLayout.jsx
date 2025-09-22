import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
export default function LdrLayout({ children, activeTab }) {
  const navigate = useNavigate();
    const { logout, user, updateUser } = useAuth();; // c

  const handleLogout = async () => {
    try {
      await logout(); // call your existing logout function (assume it’s globally available)
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Land Department Registrar</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Admin Portal
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Logged in as: LDR Officer</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded hover:bg-red-200 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === 'register'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => navigate('/ldr-dashboard')}
            >
              Register Property
            </button>
            
            <button
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === 'verified'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => navigate('/ldr/verified-users')}
            >
              Verified Users
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
