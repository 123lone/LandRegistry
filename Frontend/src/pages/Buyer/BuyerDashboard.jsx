import React from 'react';
import { Outlet } from 'react-router-dom';

const BuyerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default BuyerDashboard;