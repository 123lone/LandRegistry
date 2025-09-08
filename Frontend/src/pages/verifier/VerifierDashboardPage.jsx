import React from 'react';
import { useWallet } from '../../context/WalletContext';

// Mock data for the dashboard stats
const stats = [
  { label: "Total Users Registered", value: "0", color: "bg-blue-600", icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" fillRule="evenodd"></path></svg> },
  { label: "Total Properties Registered", value: "0", color: "bg-green-600", icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293-.293a1 1 0 000-1.414l-7-7z"></path></svg> },
  { label: "Total Properties Transferred", value: "0", color: "bg-amber-600", icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"></path></svg> },
];

const VerifierDashboardPage = () => {
  const { accounts } = useWallet();
  const userName = "Vipul Patil"; // Placeholder from video

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto max-w-7xl">
        {/* User Profile Section */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">{userName}</h2>
            <p className="text-sm text-gray-500">Land Inspector</p>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className={`p-6 rounded-lg shadow-md text-white flex items-center justify-between ${stat.color}`}>
              <div>
                <h3 className="text-lg font-medium">{stat.label}</h3>
                <p className="text-4xl font-bold mt-2">{stat.value}</p>
              </div>
              <div>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to the Dashboard</h2>
          <p className="text-gray-600">Please select a task from the navigation bar above.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifierDashboardPage;