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
  const [buyersLoading, setBuyersLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchPending = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const sellerAddress = await signer.getAddress();

        const marketplace = new ethers.Contract(
          import.meta.env.VITE_MARKETPLACE_ADDRESS,
          MarketplaceABI.abi,
          provider
        );

        // Get pending balance
        const balance = await marketplace.pendingWithdrawals(sellerAddress);
        setPendingBalance(ethers.formatEther(balance));

        // Fetch sold properties using events
        const filter = marketplace.filters.PropertySold(null, null, sellerAddress, null);
        const events = await marketplace.queryFilter(filter);
        
        setBuyersLoading(true);
        
        // Get basic event data first
        const soldPropsWithoutDetails = events.map(ev => ({
          tokenId: ev.args.tokenId.toString(),
          buyer: ev.args.buyer,
          price: ethers.formatEther(ev.args.price),
          blockNumber: ev.blockNumber,
          transactionHash: ev.transactionHash,
          buyerDetails: null,
          propertyDetails: null
        }));

        setSoldProperties(soldPropsWithoutDetails);

        // Fetch buyer and property details for each sold property
        const enrichedProperties = await Promise.all(
          soldPropsWithoutDetails.map(async (prop) => {
            try {
              // Fetch buyer details
              const buyerResponse = await fetch(`http://localhost:5000/api/auth/by-wallet/${prop.buyer}`, {
                credentials: 'include',
              });
              
              let buyerDetails = null;
              if (buyerResponse.ok) {
                buyerDetails = await buyerResponse.json();
              }

              // Fetch property details by tokenId
              const propertyResponse = await fetch(`http://localhost:5000/api/requests/by-token/${prop.tokenId}`, {
                credentials: 'include',
              });
              
              let propertyDetails = null;
              if (propertyResponse.ok) {
                propertyDetails = await propertyResponse.json();
              }

              return {
                ...prop,
                buyerDetails,
                propertyDetails
              };
            } catch (error) {
              console.error(`Error fetching details for property ${prop.tokenId}:`, error);
              return prop;
            }
          })
        );

        setSoldProperties(enrichedProperties);
        setBuyersLoading(false);

      } catch (err) {
        console.error("Error fetching pending withdrawals:", err);
        setError("Failed to fetch pending withdrawals.");
        setBuyersLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
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
      console.log("Withdrawal tx sent:", tx);
      const receipt = await tx.wait();
      console.log("Withdrawal receipt:", receipt);

      setSuccess("Withdrawal successful!");
      setPendingBalance("0");
    } catch (err) {
      console.error("Withdrawal error:", err);
      setError("Withdrawal failed. Check console for details.");
    }
  };

  const formatDate = (blockNumber) => {
    // This is a rough estimate - you might want to fetch actual block timestamps
    return `Block #${blockNumber}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!isAuthenticated) return <div className="text-center py-8">Please log in to view requests.</div>;
  if (loading) return <div className="text-center py-8">Loading your requests...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Seller Dashboard</h1>

      {error && <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">{error}</div>}
      {success && <div className="p-4 mb-4 text-sm text-green-800 bg-green-100 rounded-lg">{success}</div>}

      {/* Pending Withdrawal Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Pending Withdrawal</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-600">{pendingBalance} ETH</p>
            <p className="text-sm text-gray-500">Available to withdraw</p>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={pendingBalance === "0" || parseFloat(pendingBalance) === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* Sold Properties Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Sales</h2>
          {buyersLoading && <div className="text-sm text-blue-600">Loading buyer details...</div>}
        </div>

        {soldProperties.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">No sales yet</div>
            <p className="text-gray-500">Your sold properties will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sale Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {soldProperties.map((prop, index) => (
                  <tr key={`${prop.tokenId}-${index}`} className="hover:bg-gray-50">
                    {/* Property Details */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          Token ID: #{prop.tokenId}
                        </div>
                        {prop.propertyDetails && (
                          <div className="text-gray-500">
                            <div>{prop.propertyDetails.title || 'Property Title'}</div>
                            <div className="text-xs">{prop.propertyDetails.location || 'Location'}</div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Buyer Details */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {prop.buyerDetails ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {prop.buyerDetails.name || 'N/A'}
                            </div>
                            <div className="text-gray-500">
                              <div>📧 {prop.buyerDetails.email || 'No email'}</div>
                              <div>📞 {prop.buyerDetails.phone || 'No phone'}</div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              <span 
                                className="cursor-pointer hover:text-blue-600" 
                                onClick={() => copyToClipboard(prop.buyer)}
                                title="Click to copy wallet address"
                              >
                                {prop.buyer.slice(0, 6)}...{prop.buyer.slice(-4)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-gray-400">Loading buyer info...</div>
                            <div className="text-xs text-gray-400">
                              <span 
                                className="cursor-pointer hover:text-blue-600"
                                onClick={() => copyToClipboard(prop.buyer)}
                                title="Click to copy wallet address"
                              >
                                {prop.buyer.slice(0, 6)}...{prop.buyer.slice(-4)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Sale Price */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-green-600">{prop.price} ETH</div>
                        <div className="text-gray-500 text-xs">
                          ~${(parseFloat(prop.price) * 2000).toLocaleString()} USD
                        </div>
                      </div>
                    </td>

                    {/* Transaction Details */}
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-500">
                          <div className="mb-1">{formatDate(prop.blockNumber)}</div>
                          <a
                            href={`https://etherscan.io/tx/${prop.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View on Etherscan ↗
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sales</h3>
          <p className="text-2xl font-bold text-gray-900">{soldProperties.length}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">
            {soldProperties.reduce((sum, prop) => sum + parseFloat(prop.price), 0).toFixed(4)} ETH
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Withdrawal</h3>
          <p className="text-2xl font-bold text-green-600">{pendingBalance} ETH</p>
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;