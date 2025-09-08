import React from 'react';

const mockRequests = [
  { id: 1, to: "0xseller...5678", land: "LND-103", status: "Pending" },
];

const SentRequestsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Sent Land Requests</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Land ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {mockRequests.map(req => (
            <tr key={req.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.to}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.land}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SentRequestsPage;