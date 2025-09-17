import React from 'react';

const mockRequests = [
  { id: 1, from: "0xbuyer...1234", land: "LND-101", status: "Pending" },
];

const ReceivedRequestsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Received Requests</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Land ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {mockRequests.map(req => (
            <tr key={req.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.from}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.land}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.status}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-green-600 hover:text-green-900 mr-2">Accept</button>
                <button className="text-red-600 hover:text-red-900">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReceivedRequestsPage;