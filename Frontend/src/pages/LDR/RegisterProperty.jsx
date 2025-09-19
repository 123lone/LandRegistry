import { useState } from 'react';
import { Upload, FileText, MapPin, User, AlertCircle, CheckCircle, Loader2, Search, Edit } from 'lucide-react';
import { ethers } from 'ethers';

export default function RegisterProperty() {
    const [formData, setFormData] = useState({
        ownerWalletAddress: '',
        ownerName: '',
        surveyNumber: '',
        propertyId: '',
        propertyAddress: '',
        area: '',
    });
    const [selectedFiles, setSelectedFiles] = useState({ motherDeed: null, encumbranceCertificate: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const fetchVerifiedUsers = async (email = '') => {
        setIsSearching(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');
            const res = await fetch(`http://localhost:5000/api/verifier/verified-users${email ? `?email=${encodeURIComponent(email)}` : ''}`, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
            const { success, data, message } = await res.json();
            if (success) setSearchResults(data);
            else setFeedback({ type: 'error', message: message || 'Failed to fetch users' });
        } catch (err) {
            setFeedback({ type: 'error', message: err.message || 'Failed to fetch users' });
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length >= 3) fetchVerifiedUsers(query);
        else {
            setSearchResults([]);
            setFormData(prev => ({ ...prev, ownerWalletAddress: '', ownerName: '' }));
        }
    };

    const handleUserSelect = (user) => {
        setFormData(prev => ({ ...prev, ownerWalletAddress: user.walletAddress || '', ownerName: user.name || '' }));
        setSearchQuery(user.email || '');
        setSearchResults([]);
        setErrors(prev => ({ ...prev, ownerWalletAddress: '', ownerName: '' }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e, documentType) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // File size validation (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, [documentType]: 'File size must be less than 10MB' }));
            return;
        }
        
        if (file.type !== 'application/pdf') {
            setErrors(prev => ({ ...prev, [documentType]: 'Please select a PDF file only' }));
            return;
        }
        
        setSelectedFiles(prev => ({ ...prev, [documentType]: file }));
        setErrors(prev => ({ ...prev, [documentType]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.ownerWalletAddress.trim() || !ethers.isAddress(formData.ownerWalletAddress.trim())) 
            newErrors.ownerWalletAddress = 'A valid owner wallet address is required';
        if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
        if (!formData.surveyNumber.trim()) newErrors.surveyNumber = 'Survey number is required';
        if (!formData.propertyId.trim()) newErrors.propertyId = 'Property ID is required';
        if (!formData.propertyAddress.trim()) newErrors.propertyAddress = 'Property address is required';
        if (!formData.area.trim() || Number(formData.area) <= 0) newErrors.area = 'A valid area is required';
        if (!selectedFiles.motherDeed) newErrors.motherDeed = 'Mother Deed is required';
        if (!selectedFiles.encumbranceCertificate) newErrors.encumbranceCertificate = 'Encumbrance Certificate is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const switchNetwork = async (expectedChainId) => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${parseInt(expectedChainId).toString(16)}` }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${parseInt(expectedChainId).toString(16)}`,
                            chainName: 'Ganache Local',
                            rpcUrls: ['http://127.0.0.1:7545'],
                            nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
                        }],
                    });
                } catch (addError) {
                    throw new Error("Failed to add the Ganache network. Please add it manually.");
                }
            } else {
                throw new Error("Failed to switch networks. Please do it manually in MetaMask.");
            }
        }
    };

    // ✅ FIXED: Consistent signature generation for ethers v6
    const getUserSignature = async (propertyHash) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            
            console.log('🔍 === FRONTEND SIGNING DEBUG ===');
            console.log('📝 Signing for address:', userAddress);
            console.log('📝 Property hash to sign:', propertyHash);
            
            setFeedback({ type: 'info', message: 'Please sign the transaction in MetaMask...' });
            
            // ✅ Use signMessage with getBytes for consistent ethers v6 signing
            const signature = await signer.signMessage(ethers.getBytes(propertyHash));
            
            console.log('✅ Signature created:', signature.substring(0, 20) + '...');
            console.log('📏 Signature length:', signature.length);
            
            return { signature, userAddress };
        } catch (error) {
            console.error('💥 Frontend signing error:', error);
            if (error.code === 4001) {
                throw new Error('User rejected the signature request');
            }
            throw new Error(`Signing failed: ${error.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setFeedback({ type: 'error', message: 'Please correct the errors in the form.' });
            return;
        }
        if (typeof window.ethereum === 'undefined') {
            setFeedback({ type: 'error', message: 'Please install MetaMask to continue.' });
            return;
        }

        setIsSubmitting(true);
        setFeedback({ type: 'info', message: 'Connecting to MetaMask...' });

        try {
            // Step 1: Connect to MetaMask
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            const expectedChainId = '1337';

            if (network.chainId.toString() !== expectedChainId) {
                setFeedback({ type: 'info', message: 'Wrong Network! Requesting switch to Ganache...' });
                await switchNetwork(expectedChainId);
            }

            // Step 2: Prepare the property data for signing
            setFeedback({ type: 'info', message: 'Preparing transaction data...' });
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication token not found');

            // ✅ Clean and normalize data for consistent hashing
            const prepareData = {
                ownerWalletAddress: formData.ownerWalletAddress.trim().toLowerCase(),
                surveyNumber: formData.surveyNumber.trim(),
                propertyId: formData.propertyId.trim(),
                propertyAddress: formData.propertyAddress.trim(),
                area: formData.area.trim(),
                ownerName: formData.ownerName.trim()
            };

            console.log('📤 Sending prepare-mint request:', prepareData);

            const prepareResponse = await fetch('http://localhost:5000/api/properties/prepare-mint', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(prepareData)
            });

            if (!prepareResponse.ok) {
                const errorData = await prepareResponse.json().catch(() => ({}));
                console.error('❌ Prepare response error:', errorData);
                throw new Error(errorData.message || `Failed to prepare transaction data (HTTP ${prepareResponse.status})`);
            }

            const prepareResult = await prepareResponse.json();
            const { propertyHash } = prepareResult;
            
            if (!propertyHash) {
                throw new Error('No property hash returned from server');
            }

            console.log('✅ Property hash received:', propertyHash);

            // Step 3: Get user signature
            const { signature, userAddress } = await getUserSignature(propertyHash);

            // Step 4: Execute the mint with signature
            setFeedback({ type: 'info', message: 'Finalizing registration...' });
            const submissionData = new FormData();
            Object.keys(formData).forEach(key => submissionData.append(key, formData[key]));
            submissionData.append('motherDeed', selectedFiles.motherDeed);
            submissionData.append('encumbranceCertificate', selectedFiles.encumbranceCertificate);
            
            // Add signature data
            submissionData.append('userSignature', signature);
            submissionData.append('userAddress', userAddress);
            submissionData.append('propertyHash', propertyHash);

            console.log('📤 Sending execute-mint request with signature');

            const executeRes = await fetch('http://localhost:5000/api/properties/execute-mint', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: submissionData,
            });

            const result = await executeRes.json();
            if (!executeRes.ok) {
                console.error('❌ Execute response error:', result);
                throw new Error(result.message || 'Failed to complete registration.');
            }

            setFeedback({ type: 'success', message: result.message || 'Property registered successfully!' });

            // Reset form after successful submission
            setFormData({
                ownerWalletAddress: '',
                ownerName: '',
                surveyNumber: '',
                propertyId: '',
                propertyAddress: '',
                area: '',
            });
            setSelectedFiles({ motherDeed: null, encumbranceCertificate: null });
            setSearchQuery('');

        } catch (error) {
            console.error('💥 Submission failed:', error);
            setFeedback({ 
                type: 'error', 
                message: error.message || 'Operation was rejected or failed. Please try again.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = (error) => `w-full px-4 py-3 border rounded-lg transition-colors ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`;
    const fileUploadClass = (error) => `border-2 border-dashed rounded-lg p-6 transition-colors ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Register New Property</h2>
                        <p className="text-gray-600">Upload official property documents to register on the blockchain.</p>
                    </div>

                    {feedback.message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 border 
                            ${feedback.type === 'success' ? 'bg-green-50 border-green-200' : ''}
                            ${feedback.type === 'error' ? 'bg-red-50 border-red-200' : ''}
                            ${feedback.type === 'info' ? 'bg-blue-50 border-blue-200' : ''}`}>
                            {feedback.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />}
                            {feedback.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
                            {feedback.type === 'info' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />}
                            <p className={`text-sm flex-1 
                                ${feedback.type === 'success' ? 'text-green-800' : ''}
                                ${feedback.type === 'error' ? 'text-red-800' : ''}
                                ${feedback.type === 'info' ? 'text-blue-800' : ''}`}>
                                {feedback.message}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Search className="h-4 w-4 inline mr-2" />
                                Search User by Email *
                            </label>
                            <div className="relative">
                                <input 
                                    value={searchQuery} 
                                    onChange={handleSearchChange} 
                                    placeholder="Enter user email..." 
                                    className={inputClass(errors.search)} 
                                    disabled={isSubmitting}
                                />
                                {isSearching && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-gray-400" />}
                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {searchResults.map(user => (
                                            <div 
                                                key={user._id} 
                                                onClick={() => handleUserSelect(user)} 
                                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            >
                                                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                                                <p className="text-xs text-gray-500 mt-1">{user.name || 'N/A'}</p>
                                                {user.walletAddress && (
                                                    <p className="text-xs text-gray-400 mt-1 truncate">{user.walletAddress}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {searchResults.length === 0 && searchQuery.length >= 3 && !isSearching && (
                                <p className="mt-1 text-sm text-gray-500">No users found</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User className="h-4 w-4 inline mr-2" />
                                Owner's Wallet Address *
                            </label>
                            <input 
                                name="ownerWalletAddress" 
                                value={formData.ownerWalletAddress} 
                                readOnly 
                                placeholder="Select a user to populate" 
                                className={`${inputClass(errors.ownerWalletAddress)} bg-gray-100 cursor-not-allowed`}
                                disabled 
                            />
                            {errors.ownerWalletAddress && <p className="mt-1 text-sm text-red-600">{errors.ownerWalletAddress}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User className="h-4 w-4 inline mr-2" />
                                Owner Name *
                            </label>
                            <input 
                                name="ownerName" 
                                value={formData.ownerName} 
                                readOnly 
                                placeholder="Select a user to populate" 
                                className={`${inputClass(errors.ownerName)} bg-gray-100 cursor-not-allowed`}
                                disabled 
                            />
                            {errors.ownerName && <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="h-4 w-4 inline mr-2" />
                                    Survey Number *
                                </label>
                                <input 
                                    name="surveyNumber" 
                                    value={formData.surveyNumber} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g., S-123/45" 
                                    className={inputClass(errors.surveyNumber)} 
                                    disabled={isSubmitting}
                                />
                                {errors.surveyNumber && <p className="mt-1 text-sm text-red-600">{errors.surveyNumber}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="h-4 w-4 inline mr-2" />
                                    Property ID (PID) *
                                </label>
                                <input 
                                    name="propertyId" 
                                    value={formData.propertyId} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g., PID-2025-7890" 
                                    className={inputClass(errors.propertyId)} 
                                    disabled={isSubmitting}
                                />
                                {errors.propertyId && <p className="mt-1 text-sm text-red-600">{errors.propertyId}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="h-4 w-4 inline mr-2" />
                                Property Address *
                            </label>
                            <input 
                                name="propertyAddress" 
                                value={formData.propertyAddress} 
                                onChange={handleInputChange} 
                                placeholder="e.g., 123 Main St, Sector 15, New Delhi" 
                                className={inputClass(errors.propertyAddress)} 
                                disabled={isSubmitting}
                            />
                            {errors.propertyAddress && <p className="mt-1 text-sm text-red-600">{errors.propertyAddress}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="h-4 w-4 inline mr-2" />
                                Area (sq ft) *
                            </label>
                            <input 
                                name="area" 
                                value={formData.area} 
                                onChange={handleInputChange} 
                                placeholder="e.g., 1200" 
                                type="number" 
                                min="1"
                                className={inputClass(errors.area)} 
                                disabled={isSubmitting}
                            />
                            {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {['motherDeed', 'encumbranceCertificate'].map(docType => (
                                <div key={docType}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Upload className="h-4 w-4 inline mr-2" />
                                        {docType === 'motherDeed' ? 'Mother Deed' : 'Encumbrance Certificate'} (PDF) *
                                    </label>
                                    <div className={fileUploadClass(errors[docType])}>
                                        <input 
                                            type="file" 
                                            id={`${docType}-upload`} 
                                            accept=".pdf" 
                                            onChange={(e) => handleFileChange(e, docType)} 
                                            className="hidden" 
                                            disabled={isSubmitting}
                                        />
                                        <label htmlFor={`${docType}-upload`} className="text-center cursor-pointer">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="mt-4">
                                                <span className="block bg-blue-600 text-white rounded-md px-4 py-2 font-medium hover:bg-blue-700 transition-colors">
                                                    Upload {docType === 'motherDeed' ? 'Mother Deed' : 'EC'}
                                                </span>
                                                <p className="text-gray-500 text-sm mt-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">PDF up to 10MB</p>
                                            {selectedFiles[docType] && (
                                                <div className="mt-4 p-2 bg-blue-50 rounded-md">
                                                    <p className="text-sm text-blue-800 font-medium truncate">
                                                        ✅ Selected: {selectedFiles[docType].name}
                                                    </p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    {errors[docType] && <p className="mt-1 text-sm text-red-600">{errors[docType]}</p>}
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit"
                                disabled={isSubmitting} 
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Edit className="h-5 w-5" />
                                        <span>Register Property on Blockchain</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}