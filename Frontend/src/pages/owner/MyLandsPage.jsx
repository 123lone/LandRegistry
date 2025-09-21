import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ethers } from 'ethers';

const MyLandsPage = () => {
    const { isAuthenticated } = useAuth();
    const [myLands, setMyLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Track price inputs per landId
    const [priceInputs, setPriceInputs] = useState({});

    // Fetch all lands owned by the user when the component loads
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchMyLands = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/properties/my-properties', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch your lands');
                }

                const data = await response.json();
                setMyLands(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMyLands();
    }, [isAuthenticated]);

    // Handler for the "List for Sale" button
    const handleListForSale = async (landId, price) => {
        if (!price) {
            setError("Price is required.");
            return;
        }

        try {
            // Step 1: Prepare approval transaction
            const prepareResponse = await fetch(`http://localhost:5000/api/properties/${landId}/prepare-listing`, {
                method: 'POST',  // ✅ backend expects POST
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ price }),
            });

            if (!prepareResponse.ok) {
                const errorData = await prepareResponse.json();
                throw new Error(errorData.message || 'Failed to prepare listing');
            }

            const { transactionData } = await prepareResponse.json();

            // Step 2: Ask wallet to sign & send the transaction
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const tx = await signer.sendTransaction(transactionData);

            // Step 3: Wait for confirmation
            const receipt = await tx.wait();

            // Step 4: Finalize listing in backend
            const finalizeResponse = await fetch(`http://localhost:5000/api/properties/${landId}/finalize-listing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ transactionHash: receipt.hash, price }),
            });

            if (!finalizeResponse.ok) {
                const errorData = await finalizeResponse.json();
                throw new Error(errorData.message || 'Failed to finalize listing');
            }

            const result = await finalizeResponse.json();

            // Update UI instantly
            setMyLands(prevLands =>
                prevLands.map(land =>
                    land._id === landId ? result.data : land
                )
            );
            setError(null);

        } catch (err) {
            setError(err.message);
        }
    };

    // Helper to format the address
    const formatAddress = (land) => {
        if (land.address && land.address.street) {
            return `${land.address.street}, ${land.address.city}`;
        }
        return land.propertyAddress;
    };

    if (loading) {
        return <div className="text-center py-8">Loading your lands...</div>;
    }

    if (!isAuthenticated) {
        return <div className="text-center py-8">Please log in to view your lands.</div>;
    }

    if (myLands.length === 0 && !error) {
        return <div className="text-center py-8">You have not registered any lands yet.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Lands</h1>
            
            {error && <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg" role="alert">{error}</div>}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Survey No.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {myLands.map((land) => (
                            <tr key={land._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{land.propertyId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{land.surveyNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatAddress(land)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{land.area} {land.areaUnit || 'sq m'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {land.status === 'verified' ? (
                                        <input
                                            type="number"
                                            className="border rounded px-2 py-1 w-24"
                                            placeholder="Price"
                                            value={priceInputs[land._id] || ""}
                                            onChange={e =>
                                                setPriceInputs(prev => ({
                                                    ...prev,
                                                    [land._id]: e.target.value
                                                }))
                                            }
                                        />
                                    ) : (
                                        `${land.price || '-'} ETH`
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        land.status === 'listed_for_sale' ? 'bg-green-100 text-green-800' :
                                        land.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {land.status.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                                    
                                    {land.status === 'verified' && (
                                        <button 
                                            onClick={() => handleListForSale(land._id, priceInputs[land._id])}
                                            className="ml-4 text-green-600 hover:text-green-900"
                                        >
                                            List for Sale
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyLandsPage;
