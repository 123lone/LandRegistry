import React from 'react';

const mockLands = [
  { id: 1, pid: 'LND-101', location: 'Pune', status: 'Verified', forSale: false },
  { id: 2, pid: 'LND-102', location: 'Mumbai', status: 'Pending', forSale: false },
];

const MyLandsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Lands</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {mockLands.map(land => (
            <tr key={land.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{land.pid}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{land.location}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{land.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900 mr-2">View</button>
                {land.status === 'Verified' && (
                  <button className="text-green-600 hover:text-green-900">Mark for Sale</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyLandsPage;