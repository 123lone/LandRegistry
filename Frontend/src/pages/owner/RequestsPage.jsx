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
  const [currentOffers, setCurrentOffers] = useState([]);
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [offersLoading, setOffersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'completed'

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
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

        // Fetch current offers/pending transactions
        await fetchCurrentOffers(marketplace, sellerAddress);

        // Fetch completed sales
        await fetchCompletedSales(marketplace, sellerAddress);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const fetchCurrentOffers = async (marketplace, sellerAddress) => {
    try {
      setOffersLoading(true);
      
      // Method 1: Check for escrow events or pending purchases
      // Assuming you have events like "OfferMade" or "EscrowCreated"
      let currentOffersList = [];

      try {
        // If you have an OfferMade event
        const offerFilter = marketplace.filters.OfferMade?.(null, sellerAddress, null);
        if (offerFilter) {
          const offerEvents = await marketplace.queryFilter(offerFilter);
          
          // Filter out offers that haven't been completed or rejected
          for (const event of offerEvents) {
            const tokenId = event.args.tokenId.toString();
            const buyer = event.args.buyer;
            const offerAmount = ethers.formatEther(event.args.amount);
            
            // Check if this offer is still active (not sold, not rejected)
            // You'd need to check your contract state here
            const isStillActive = await checkIfOfferActive(marketplace, tokenId, buyer);
            
            if (isStillActive) {
              currentOffersList.push({
                tokenId,
                buyer,
                offerAmount,
                timestamp: event.blockNumber,
                transactionHash: event.transactionHash,
                status: 'pending'
              });
            }
          }
        }
      } catch (err) {
        console.log("No OfferMade events found or not implemented");
      }

      // Method 2: Check your backend API for pending purchase requests
      try {
        const response = await fetch(`http://localhost:5000/api/requests/pending-offers/${sellerAddress}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const apiOffers = await response.json();
          currentOffersList = [...currentOffersList, ...apiOffers];
        }
      } catch (err) {
        console.log("Backend API for pending offers not available");
      }

      // Method 3: Check for properties with escrow balance
      try {
        // Get your listed properties and check if any have escrow funds
        const listedResponse = await fetch(`http://localhost:5000/api/requests/seller/${sellerAddress}`, {
          credentials: 'include',
        });
        
        if (listedResponse.ok) {
          const listedProperties = await listedResponse.json();
          
          for (const property of listedProperties) {
            if (property.tokenId) {
              // Check if there's any escrow for this property
              try {
                const escrowBalance = await marketplace.getEscrowBalance?.(property.tokenId);
                if (escrowBalance && escrowBalance > 0) {
                  currentOffersList.push({
                    tokenId: property.tokenId,
                    buyer: "Unknown", // You'd need to track this
                    offerAmount: ethers.formatEther(escrowBalance),
                    status: 'escrowed',
                    propertyDetails: property
                  });
                }
              } catch (err) {
                console.log(`No escrow info for token ${property.tokenId}`);
              }
            }
          }
        }
      } catch (err) {
        console.log("Could not fetch listed properties");
      }

      // Enrich offers with buyer and property details
      const enrichedOffers = await Promise.all(
        currentOffersList.map(async (offer) => {
          try {
            // Fetch buyer details if we have a buyer address
            let buyerDetails = null;
            if (offer.buyer !== "Unknown") {
              const buyerResponse = await fetch(`http://localhost:5000/api/auth/by-wallet/${offer.buyer}`, {
                credentials: 'include',
              });
              
              if (buyerResponse.ok) {
                buyerDetails = await buyerResponse.json();
              }
            }

            // Fetch property details if not already present
            let propertyDetails = offer.propertyDetails || null;
            if (!propertyDetails && offer.tokenId) {
              const propertyResponse = await fetch(`http://localhost:5000/api/requests/by-token/${offer.tokenId}`, {
                credentials: 'include',
              });
              
              if (propertyResponse.ok) {
                propertyDetails = await propertyResponse.json();
              }
            }

            return {
              ...offer,
              buyerDetails,
              propertyDetails
            };
          } catch (error) {
            console.error(`Error fetching details for offer on token ${offer.tokenId}:`, error);
            return offer;
          }
        })
      );

      setCurrentOffers(enrichedOffers);
      setOffersLoading(false);

    } catch (err) {
      console.error("Error fetching current offers:", err);
      setOffersLoading(false);
    }
  };

  const fetchCompletedSales = async (marketplace, sellerAddress) => {
    try {
      setBuyersLoading(true);
      
      // Fetch sold properties using events
      const filter = marketplace.filters.PropertySold(null, null, sellerAddress, null);
      const events = await marketplace.queryFilter(filter);
      
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
      console.error("Error fetching completed sales:", err);
      setBuyersLoading(false);
    }
  };

  // Helper function to check if an offer is still active
  const checkIfOfferActive = async (marketplace, tokenId, buyer) => {
    try {
      // This depends on your smart contract implementation
      // You might have a mapping of active offers or a function to check offer status
      // Example: return await marketplace.isOfferActive(tokenId, buyer);
      return true; // Placeholder - implement based on your contract
    } catch (err) {
      return false;
    }
  };

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

  const handleAcceptOffer = async (tokenId, buyer) => {
    try {
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const marketplace = new ethers.Contract(
        import.meta.env.VITE_MARKETPLACE_ADDRESS,
        MarketplaceABI.abi,
        signer
      );

      // This depends on your contract implementation
      const tx = await marketplace.acceptOffer(tokenId, buyer);
      await tx.wait();
      
      setSuccess("Offer accepted successfully!");
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error("Error accepting offer:", err);
      setError("Failed to accept offer.");
    }
  };

  const handleRejectOffer = async (tokenId, buyer) => {
    try {
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const marketplace = new ethers.Contract(
        import.meta.env.VITE_MARKETPLACE_ADDRESS,
        MarketplaceABI.abi,
        signer
      );

      // This depends on your contract implementation
      const tx = await marketplace.rejectOffer(tokenId, buyer);
      await tx.wait();
      
      setSuccess("Offer rejected successfully!");
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error("Error rejecting offer:", err);
      setError("Failed to reject offer.");
    }
  };

  const formatDate = (blockNumber) => {
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

      {/* Tab Navigation */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('current')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'current'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Current Offers ({currentOffers.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed Sales ({soldProperties.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Current Offers Tab */}
          {activeTab === 'current' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Active Trading Requests</h2>
                {offersLoading && <div className="text-sm text-blue-600">Loading current offers...</div>}
              </div>

              {currentOffers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg mb-2">No active offers</div>
                  <p className="text-gray-500">Current trading requests will appear here</p>
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
                          Offer Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOffers.map((offer, index) => (
                        <tr key={`${offer.tokenId}-${index}`} className="hover:bg-gray-50">
                          {/* Property Details */}
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                Token ID: #{offer.tokenId}
                              </div>
                              {offer.propertyDetails && (
                                <div className="text-gray-500">
                                  <div>{offer.propertyDetails.title || 'Property Title'}</div>
                                  <div className="text-xs">{offer.propertyDetails.location || 'Location'}</div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Buyer Details */}
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              {offer.buyerDetails ? (
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {offer.buyerDetails.name || 'N/A'}
                                  </div>
                                  <div className="text-gray-500">
                                    <div>📧 {offer.buyerDetails.email || 'No email'}</div>
                                    <div>📞 {offer.buyerDetails.phone || 'No phone'}</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-400">
                                  {offer.buyer !== "Unknown" ? "Loading buyer info..." : "Unknown buyer"}
                                </div>
                              )}
                              {offer.buyer !== "Unknown" && (
                                <div className="text-xs text-gray-400 mt-1">
                                  <span 
                                    className="cursor-pointer hover:text-blue-600" 
                                    onClick={() => copyToClipboard(offer.buyer)}
                                    title="Click to copy wallet address"
                                  >
                                    {offer.buyer.slice(0, 6)}...{offer.buyer.slice(-4)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Offer Amount */}
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-green-600">{offer.offerAmount} ETH</div>
                              <div className="text-gray-500 text-xs">
                                ~${(parseFloat(offer.offerAmount) * 2000).toLocaleString()} USD
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              offer.status === 'escrowed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {offer.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAcceptOffer(offer.tokenId, offer.buyer)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                disabled={offer.buyer === "Unknown"}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectOffer(offer.tokenId, offer.buyer)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                disabled={offer.buyer === "Unknown"}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Completed Sales Tab */}
          {activeTab === 'completed' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Completed Sales</h2>
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
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Offers</h3>
          <p className="text-2xl font-bold text-blue-600">{currentOffers.length}</p>
        </div>
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