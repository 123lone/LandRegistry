import React, { useState, useEffect } from 'react';
// This import path is now corrected for the new location
import PropertyCard from '../../components/PropertyCard'; 

const MarketplaceBrowse = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMarketplaceProperties = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/properties/marketplace', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: Failed to fetch properties`);
                }

                const data = await response.json();
                setProperties(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMarketplaceProperties();
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading properties...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-600">Error: {error}</div>;
    }

    if (properties.length === 0) {
        return <div className="text-center py-8">No properties are currently listed for sale.</div>;
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Marketplace</h1>
                <p className="text-lg text-gray-600">Browse verified properties available for purchase.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map(property => (
                    <PropertyCard key={property?.propertyId} property={property} />
                ))}
            </div>
        </div>
    );
};

export default MarketplaceBrowse;