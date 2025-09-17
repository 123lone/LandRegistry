import React from 'react';

// Mock data for user verification table
const mockUsers = [
  { no: 1, name: "John Doe", address: "0x345...8790", aadhar: "1234-5678-9012", pan: "ABCDE1234F", document: "View", verify: "Pending" },
  { no: 2, name: "Jane Smith", address: "0x987...1234", aadhar: "5678-9012-3456", pan: "FGHIJ5678K", document: "View", verify: "Pending" },
];

const VerifyUsersPage = () => (
  <div className="container mx-auto max-w-7xl py-8">
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Verify Land Inspectors</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aadhaar</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PAN</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verify</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockUsers.map((user) => (
              <tr key={user.no}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.no}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.aadhar}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.pan}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">{user.document}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-green-600 hover:text-green-900 mr-2">Approve</button>
                  <button className="text-red-600 hover:text-red-900">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default VerifyUsersPage;