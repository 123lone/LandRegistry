import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ethers } from "ethers";
import MarketplaceABI from "../../abis/Marketplace.json";

const RequestsPage = () => {
  const { isAuthenticated } = useAuth();
  const [pendingBalance, setPendingBalance] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [soldProperties, setSoldProperties] = useState([]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/requests/seller", {
        credentials: "include",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to fetch seller requests");
      }

      const data = await response.json();
      setSoldProperties(data.data);

      // Fetch pending balance from blockchain
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const sellerAddress = await signer.getAddress();

      const marketplace = new ethers.Contract(
        import.meta.env.VITE_MARKETPLACE_ADDRESS,
        MarketplaceABI.abi,
        provider
      );

      const balance = await marketplace.pendingWithdrawals(sellerAddress);
      setPendingBalance(ethers.formatEther(balance));

    } catch (err) {
      console.error("Error fetching seller requests:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchRequests();
  }, [isAuthenticated]);

  const handleWithdraw = async () => {
    try {
      setError(null);
      setSuccess(null);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const marketplace = new ethers.Contract(
        import.meta.env.VITE_MARKETPLACE_ADDRESS,
        MarketplaceABI.abi,
        signer
      );

      const tx = await marketplace.withdrawProceeds();
      await tx.wait();

      setSuccess("Withdrawal successful!");
      await fetchRequests(); // refresh balance & table
    } catch (err) {
      console.error("Withdrawal error:", err);
      setError("Withdrawal failed. Check console for details.");
    }
  };

  const handleReject = async (propertyId) => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`http://localhost:5000/api/requests/${propertyId}/reject`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to reject trade");
      }

      const data = await response.json();
      setSuccess(data.message);

      await fetchRequests(); // refresh table & balance
    } catch (err) {
      console.error("Reject error:", err);
      setError(err.message);
    }
  };

  if (!isAuthenticated)
    return <div className="text-center py-8">Please log in to view requests.</div>;
  if (loading)
    return <div className="text-center py-8">Loading your requests...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Requests / Seller Dashboard</h1>

      {error && <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">{error}</div>}
      {success && <div className="p-4 mb-4 text-sm text-green-800 bg-green-100 rounded-lg">{success}</div>}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Pending Withdrawal</h2>
        <p className="mb-2">Amount: {pendingBalance} ETH</p>
        <button
          onClick={handleWithdraw}
          disabled={pendingBalance === "0"}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Withdraw
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Sold Properties / Requests</h2>
        {soldProperties.length === 0 ? (
          <p>No properties sold yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (ETH)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {soldProperties.map((prop) => (
                <tr key={prop._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prop.tokenId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.buyer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.buyer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.buyer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prop.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleReject(prop._id)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;
