import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, DollarSign, Ruler, FileText, CheckCircle, LinkIcon, ArrowLeft, Hash, ClipboardList, User, Mail, Phone, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import marketplaceABI from  '../../abis/Marketplace.json';
import { useAuth } from '../../context/AuthContext';
const PropertyDetailsPage = () => {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [purchaseStatus, setPurchaseStatus] = useState('');
    const [userWallet, setUserWallet] = useState(null);

    // Marketplace contract ABI (simplified - you'll need the complete ABI)
    
        

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
        checkWalletConnection();
    }, [id]);

    const checkWalletConnection = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setUserWallet(accounts[0]);
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
            }
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert('Please install MetaMask to purchase properties');
            return;
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setUserWallet(accounts[0]);
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet');
        }
    };

    const handlePurchase = async () => {
    if (!userWallet) {
        await connectWallet();
        return;
    }

    if (!property) return;

    setPurchaseLoading(true);
    setPurchaseStatus('Checking property listing on blockchain...');

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const marketplaceContract = new ethers.Contract(
            import.meta.env.VITE_MARKETPLACE_ADDRESS,
            marketplaceABI.abi,
            signer
        );

        // 1️⃣ Fetch listing info from contract
        const listing = await marketplaceContract.listings(Number(property.tokenId));
        console.log('Listing info:', listing);

        if (!listing.active) {
            setPurchaseStatus('Purchase failed. Property is not listed on blockchain.');
            setPurchaseLoading(false);
            return;
        }

        // 2️⃣ Check if price matches
        const priceInWei = ethers.parseEther(property.price.toString());
        if (BigInt(listing.price) !== priceInWei) {
            setPurchaseStatus('Purchase failed. Price on blockchain does not match property price.');
            setPurchaseLoading(false);
            return;
        }

        setPurchaseStatus('Property is listed. Initiating purchase...');

        // 3️⃣ Send buyProperty transaction
        const tx = await marketplaceContract.buyProperty(Number(property.tokenId), {
            value: priceInWei
        });

        setPurchaseStatus('Transaction sent. Waiting for confirmation...');

        const receipt = await tx.wait();

        if (receipt.status === 1) {
            setPurchaseStatus('Purchase successful! Updating database...');

            // Confirm sale in backend
            console.log('Property ID:', property._id);
            const priceInWei = ethers.parseEther(property.price.toString());
            console.log('Making API call to:', `http://localhost:5000/api/properties/${property._id}/confirm-sale`);

            const response = await fetch(`http://localhost:5000/api/properties/${property._id}/confirm-sale`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // Add any auth headers if needed
                    // 'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    buyerWalletAddress: userWallet, 
                    transactionHash: tx.hash ,
                    
                })
            });

            console.log('API Response status:', response.status);
            console.log('API Response headers:', response.headers);

            if (response.ok) {
                const responseData = await response.json();
                console.log('API Response data:', responseData);
                setPurchaseStatus('Purchase completed successfully!');
                
                // Refresh property data
                try {
                    const updatedResponse = await fetch(`http://localhost:5000/api/properties/${property._id}`, {
                        credentials: 'include',
                    });
                    if (updatedResponse.ok) {
                        const updatedProperty = await updatedResponse.json();
                        setProperty(updatedProperty);
                    }
                } catch (refreshError) {
                    console.warn('Failed to refresh property data:', refreshError);
                }
            } else {
                const errorText = await response.text();
                console.error('API Error response:', errorText);
                setPurchaseStatus(`Blockchain transaction successful, but database update failed. Status: ${response.status}`);
            }
        } else {
            throw new Error('Transaction failed');
        }

    } catch (error) {
        console.error('Purchase error:', error);
        let errorMessage = 'Purchase failed. ';
        
        if (error.code === 4001) {
            errorMessage += 'Transaction was rejected by user.';
        } else if (error.message.includes('insufficient funds')) {
            errorMessage += 'Insufficient funds in wallet.';
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage += 'Failed to connect to server. Please check if the backend is running.';
        } else {
            errorMessage += error.message || 'Unknown error occurred.';
        }
        
        setPurchaseStatus(errorMessage);
    } finally {
        setPurchaseLoading(false);
        setTimeout(() => setPurchaseStatus(''), 5000);
    }
};


    const formatAddress = (prop) => {
        if (prop.address && prop.address.city) {
            return `${prop.address.street}, ${prop.address.city}, ${prop.address.state}, ${prop.address.zip}`;
        }
        return prop.propertyAddress;
    };
    
    const getDocumentsArray = (hashes) => {
        if (!hashes) return [];
        if (Array.isArray(hashes)) {
            return hashes.map((hash, index) => ({
                name: `Document ${index + 1}`,
                ipfsHash: hash,
                status: 'verified'
            }));
        }
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
                        <p className="text-gray-700 leading-relaxed">{property.description || 'No description available.'}</p>
                    </div>

                    <div className="p-6 bg-white rounded-lg border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Property Details</h2>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-center">
                                <Hash className="w-5 h-5 mr-3 text-gray-500" />
                                <span className="font-semibold mr-2">Property ID:</span>
                                <span>{property.propertyId || 'N/A'}</span>
                            </li>
                            <li className="flex items-center">
                                <ClipboardList className="w-5 h-5 mr-3 text-gray-500" />
                                <span className="font-semibold mr-2">Survey No:</span>
                                <span>{property.surveyNumber || 'N/A'}</span>
                            </li>
                            <li className="flex items-center">
                                <MapPin className="w-5 h-5 mr-3 text-gray-500" />
                                <span className="font-semibold mr-2">District:</span>
                                <span>{property.district || 'N/A'}</span>
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

                        {documents.length > 0 ? (
                            <ul className="space-y-4">
                                {documents[0] && (
                                    <li className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <span className="font-semibold text-gray-700 flex items-center">
                                            <CheckCircle className="w-5 h-5 mr-2 text-purple-500" /> Mother Deed
                                        </span>
                                        <a
                                            href={`https://ipfs.io/ipfs/${documents[0].ipfsHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-blue-600 hover:underline"
                                        >
                                            View on IPFS <LinkIcon className="w-4 h-4 ml-1" />
                                        </a>
                                    </li>
                                )}

                                {documents[1] && (
                                    <li className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <span className="font-semibold text-gray-700 flex items-center">
                                            <CheckCircle className="w-5 h-5 mr-2 text-orange-500" /> Encumbrance Certificate
                                        </span>
                                        <a
                                            href={`https://ipfs.io/ipfs/${documents[1].ipfsHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-blue-600 hover:underline"
                                        >
                                            View on IPFS <LinkIcon className="w-4 h-4 ml-1" />
                                        </a>
                                    </li>
                                )}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No documents available</p>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <User className="w-6 h-6 mr-2 text-blue-600" />
                            Owner Information
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <div className="flex items-center">
                                <User className="w-5 h-5 mr-3 text-gray-500" />
                                <span className="font-semibold mr-2">Name:</span>
                                <span>{property.owner?.name || property.ownerName || 'N/A'}</span>
                            </div>
                            {property.owner?.email && (
                                <div className="flex items-center">
                                    <Mail className="w-5 h-5 mr-3 text-gray-500" />
                                    <span className="font-semibold mr-2">Email:</span>
                                    <span>{property.owner.email}</span>
                                </div>
                            )}
                            {property.owner?.phone && (
                                <div className="flex items-center">
                                    <Phone className="w-5 h-5 mr-3 text-gray-500" />
                                    <span className="font-semibold mr-2">Phone:</span>
                                    <span>{property.owner.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-white rounded-lg border">
                        <h3 className="text-lg font-semibold mb-3">Quick Info</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Listed:</span>
                                <span>{new Date(property.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Updated:</span>
                                <span>{new Date(property.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Actions</h2>
                        
                        {/* Wallet Connection Status */}
                        {!userWallet && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-800 text-sm">Connect your wallet to purchase this property</p>
                            </div>
                        )}

                        {userWallet && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 text-sm">Wallet connected: {userWallet.slice(0, 6)}...{userWallet.slice(-4)}</p>
                            </div>
                        )}

                        {/* Purchase Status */}
                        {purchaseStatus && (
                            <div className={`p-3 rounded-lg ${
                                purchaseStatus.includes('successful') || purchaseStatus.includes('completed') 
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : purchaseStatus.includes('failed') || purchaseStatus.includes('error')
                                    ? 'bg-red-50 border border-red-200 text-red-800'
                                    : 'bg-blue-50 border border-blue-200 text-blue-800'
                            }`}>
                                <p className="text-sm">{purchaseStatus}</p>
                            </div>
                        )}

                        {/* Purchase Button */}
                        {property.status === 'listed_for_sale' ? (
                            <button 
                                onClick={handlePurchase}
                                disabled={purchaseLoading}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {purchaseLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : userWallet ? (
                                    `Purchase for ${property.price} ETH`
                                ) : (
                                    'Connect Wallet to Purchase'
                                )}
                            </button>
                        ) : property.status === 'sold' ? (
                            <div className="w-full py-3 bg-gray-400 text-white rounded-lg font-semibold text-center">
                                Property Sold
                            </div>
                        ) : (
                            <div className="w-full py-3 bg-gray-400 text-white rounded-lg font-semibold text-center">
                                Not Available for Purchase
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsPage;