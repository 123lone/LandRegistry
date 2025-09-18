import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, DollarSign, Ruler, FileText, CheckCircle, Upload, LinkIcon, ArrowLeft, Hash, ClipboardList } from 'lucide-react';

const PropertyDetailsPage = () => {
    const { id } = useParams();
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
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch property details');
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

    const formatAddress = (prop) => {
        if (prop.address && prop.address.city) {
            return `${prop.address.street}, ${prop.address.city}, ${prop.address.state}, ${prop.address.zip}`;
        }
        return prop.propertyAddress;
    };
    
    const getDocumentsArray = (hashes) => {
        if (!hashes) return [];
        return Object.entries(hashes).map(([key, value]) => ({
            name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            ipfsHash: value,
            status: 'verified'
        }));
    };

    if (loading) {
        return <div className="text-center py-12">Loading Property Details...</div>;
    }

    if (error) {
        return <div className="text-center py-12 text-red-600">Error: {error}</div>;
    }

    if (!property) {
        return <div className="text-center py-12">Property not found.</div>;
    }
    
    const documents = getDocumentsArray(property.documentHashes);

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <Link 
                to="/buyer-dashboard/browse" 
                className="inline-flex items-center text-gray-700 hover:text-blue-600 font-semibold mb-4"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Browse
            </Link>

            <div className="relative">
                {/* Image source updated to the static image in the public folder */}
                <img 
                    src="/land-image-01.jpg" 
                    alt={property.propertyAddress} 
                    className="w-full h-96 object-cover rounded-xl" 
                />
                <div className="absolute bottom-4 left-4 p-4 bg-black bg-opacity-50 text-white rounded-lg">
                    <h1 className="text-3xl font-bold">{property.propertyAddress}</h1>
                    <p className="flex items-center text-lg mt-1">
                        <MapPin className="w-5 h-5 mr-2" />
                        {formatAddress(property)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="p-6 bg-gray-50 rounded-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <span className="flex items-center text-2xl font-bold text-green-600">
                                <DollarSign className="w-6 h-6 mr-2" /> {property.price || 'N/A'} ETH
                            </span>
                            <span className="flex items-center text-lg text-gray-600">
                                <Ruler className="w-5 h-5 mr-2" /> {property.area || 'N/A'} {property.areaUnit || 'sq m'}
                            </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{property.description}</p>
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Property Details</h2>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-center">
                                <Hash className="w-5 h-5 mr-3 text-gray-500" />
                                <span className="font-semibold mr-2">Property ID:</span>
                                <span>{property.propertyPID || 'N/A'}</span>
                            </li>
                            <li className="flex items-center">
                                <ClipboardList className="w-5 h-5 mr-3 text-gray-500" />
                                <span className="font-semibold mr-2">Survey No:</span>
                                <span>{property.surveyNumber || 'N/A'}</span>
                            </li>
                            <li className="flex items-center">
                                <MapPin className="w-5 h-5 mr-3 text-gray-500" />
                                <span className="font-semibold mr-2">Full Address:</span>
                                <span>{formatAddress(property)}</span>
                            </li>
                        </ul>
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <FileText className="w-6 h-6 mr-2 text-blue-600" />
                            Verifiable Documents
                        </h2>
                        <ul className="space-y-4">
                           {documents.map((doc, index) => (
                                <li key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="font-semibold text-gray-700 flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" /> {doc.name}
                                    </span>
                                    <a href={`https://ipfs.io/ipfs/${doc.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                                        View on IPFS <LinkIcon className="w-4 h-4 ml-1" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Actions</h2>
                    <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                        Initiate Purchase
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;