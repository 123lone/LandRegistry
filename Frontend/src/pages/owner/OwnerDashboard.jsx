import React from 'react';
import { Outlet } from 'react-router-dom';

const OwnerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content Area - Header navigation is now handled by Header.jsx */}
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
          <Outlet /> {/* This is where the sub-pages will be rendered */}
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;