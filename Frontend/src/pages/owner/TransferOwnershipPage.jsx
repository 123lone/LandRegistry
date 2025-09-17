import React from 'react';

// Mock data for ownership transfer table
const mockTransfers = [
  { serial: 1, landId: "LND-101", seller: "0x123...4567", buyer: "0x789...abcd", status: "Pending", transfer: "Approve" },
  { serial: 2, landId: "LND-102", seller: "0x890...cdef", buyer: "0x567...ghij", status: "Pending", transfer: "Approve" },
];

const TransferOwnershipPage = () => (
  <div className="container mx-auto max-w-7xl py-8">
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Transfer Ownership Table</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Land ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller Address</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer Address</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer Ownership</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockTransfers.map((transfer) => (
              <tr key={transfer.serial}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transfer.serial}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.landId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.seller}</td>
                <td className="px-6 py-4 whitespace-now-p text-sm text-gray-500">{transfer.buyer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transfer.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-green-600 hover:text-green-900">{transfer.transfer}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default TransferOwnershipPage;