import React from 'react';

// Mock data for land verification table
const mockLands = [
  { no: 1, owner: "0x123...4567", pid: "LND-101", location: "Pune", price: "20 ETH", surveyNo: "S-1234", document: "View", status: "Pending", actions: "Verify" },
  { no: 2, owner: "0x890...cdef", pid: "LND-102", location: "Mumbai", price: "35 ETH", surveyNo: "S-5678", document: "View", status: "Pending", actions: "Verify" },
];

const VerifyLandsPage = () => (
  <div className="container mx-auto max-w-7xl py-8">
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Verify Land Records</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner Address</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Survey No</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockLands.map((land) => (
              <tr key={land.no}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{land.no}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{land.owner}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{land.pid}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{land.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{land.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{land.surveyNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">{land.document}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{land.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-green-600 hover:text-green-900">Verify</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default VerifyLandsPage;