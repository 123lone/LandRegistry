// src/pages/buyer/PropertyDetailsPage.js

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Hash, ScanLine, Ruler, User, Mail, Phone, ExternalLink, ShieldCheck } from 'lucide-react';

const PropertyDetailsPage = () => {
    const { id } = useParams(); // Get property ID from the URL
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/properties/${id}`, {
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: Failed to fetch property details`);
                }
                const data = await response.json();
                setProperty(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyDetails();
    }, [id]);

    if (loading) {
        return <div className="text-center py-20">Loading property details...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-600">Error: {error}</div>;
    }

    if (!property) {
        return <div className="text-center py-20">Property not found.</div>;
    }

    // Safely access owner details with optional chaining
    const ownerName = property.owner?.name || 'N/A';
    const ownerEmail = property.owner?.email || 'N/A';
    const ownerPhone = property.owner?.phone || 'Not Provided';

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            {/* Back Link */}
            <div>
                <Link to="/buyer-dashboard/marketplace" className="flex items-center text-blue-600 hover:underline">
                    <ArrowLeft size={20} className="mr-2" /> Back to Marketplace
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Property Info */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-6">
                    {/* Image Placeholder */}
                    <div className="bg-gray-200 h-80 w-full rounded-lg flex items-center justify-center text-gray-500">
                                            </div>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{property.propertyAddress}</h1>
                            <p className="flex items-center text-gray-500 mt-1">
                                <MapPin size={16} className="mr-2" />
                                {property.district || 'N/A'}
                            </p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-sm font-medium px-4 py-1.5 rounded-full">
                            For Sale
                        </span>
                    </div>
                    
                    <hr />

                    {/* Property Details Grid */}
                    <h2 className="text-xl font-semibold text-gray-800">Property Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <DetailItem icon={<Hash size={20} />} label="Property ID" value={property.propertyId} />
                        <DetailItem icon={<ScanLine size={20} />} label="Survey No." value={property.surveyNumber} />
                        <DetailItem icon={<Ruler size={20} />} label="Area" value={`${property.area} ${property.areaUnit || 'sq m'}`} />
                        <DetailItem icon={<MapPin size={20} />} label="Full Address" value={property.propertyAddress} />
                    </div>

                    <hr />

                    {/* Verifiable Documents */}
                    <h2 className="text-xl font-semibold text-gray-800">Verifiable Documents</h2>
                    <div className="space-y-3">
                        {property.documentHashes && property.documentHashes.length > 0 ? (
                            property.documentHashes.map((hash, index) => (
                                <a
                                    key={index}
                                    href={`https://ipfs.io/ipfs/${hash}`} // Example IPFS gateway link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                                >
                                    <span className="font-medium text-blue-700">Document #{index + 1}</span>
                                    <ExternalLink size={18} className="text-gray-500" />
                                </a>
                            ))
                        ) : (
                            <p className="text-gray-500">No documents uploaded.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Actions & Seller Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Purchase Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-gray-600">Price</p>
                        <p className="text-3xl font-bold text-green-600 my-2">{property.price} ETH</p>
                        <button className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                            Initiate Purchase
                        </button>
                    </div>

                    {/* Seller Information Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Seller Information</h2>
                        <div className="space-y-4">
                            <InfoRow icon={<User size={18} />} label="Name" value={ownerName} />
                            <InfoRow icon={<Mail size={18} />} label="Email" value={ownerEmail} />
                            <InfoRow icon={<Phone size={18} />} label="Phone" value={ownerPhone} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component for consistent styling
const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start">
        <span className="text-gray-500 mt-1 mr-3">{icon}</span>
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="font-semibold text-gray-800">{value || 'N/A'}</p>
        </div>
    </div>
);

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center">
        <span className="text-gray-500 mr-3">{icon}</span>
        <div>
            <p className="font-semibold text-gray-800">{value}</p>
        </div>
    </div>
);

export default PropertyDetailsPage;