import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const MyLandsPage = () => {
    const { isAuthenticated } = useAuth();
    const [myLands, setMyLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all lands owned by the user when the component loads
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchMyLands = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/properties/my', {
                    credentials: 'include', // Automatically sends the auth cookie
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
    // In MyLandsPage.jsx

const handleListForSale = async (landId) => {
    try {
        // Change the URL in this fetch call
        const response = await fetch(`http://localhost:5000/api/properties/list/${landId}`, {
            method: 'PUT',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update status');
        }
        
        const updatedLand = await response.json();

        // Update the state for an instant UI change
        setMyLands(prevLands => 
            prevLands.map(land => 
                land._id === landId ? updatedLand : land
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{land.propertyPID}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{land.surveyNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatAddress(land)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{land.area} {land.areaUnit || 'sq m'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{land.price} ETH</td>
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
                                            onClick={() => handleListForSale(land._id)}
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