import { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // <-- Import ethers correctly
import { Upload, FileText, MapPin, User, AlertCircle, CheckCircle, Loader2, Search, Wallet } from 'lucide-react';

export default function RegisterProperty() {
  const [formData, setFormData] = useState({
    ownerWalletAddress: '',
    ownerName: '',
    surveyNumber: '',
    propertyId: '',
    propertyAddress: '',
    district: '',
    area: '',
  });
  const [selectedFiles, setSelectedFiles] = useState({ motherDeed: null, encumbranceCertificate: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [verifierWalletAddress, setVerifierWalletAddress] = useState('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);

  // Check if wallet is already connected
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setVerifierWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };
    checkWallet();
  }, []);

  // Connect MetaMask wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setFeedback({ type: 'error', message: 'MetaMask is not installed.' });
      return;
    }
    setIsConnectingWallet(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setVerifierWalletAddress(accounts[0]);
        setFeedback({ type: 'success', message: 'Wallet connected successfully!' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to connect wallet.' });
    } finally {
      setIsConnectingWallet(false);
    }
  };

  // Fetch verified users by email
  const fetchVerifiedUsers = async (email = '') => {
    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');
      const res = await fetch(`http://localhost:5000/api/verifier/verified-users?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
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
    if (file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, [documentType]: 'Please select a PDF file.' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrors(prev => ({ ...prev, [documentType]: 'File size must be less than 10MB.' }));
      return;
    }
    setSelectedFiles(prev => ({ ...prev, [documentType]: file }));
    setErrors(prev => ({ ...prev, [documentType]: '' }));
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.ownerWalletAddress.trim()) newErrors.ownerWalletAddress = 'Owner wallet address is required.';
    else if (!ethers.isAddress(formData.ownerWalletAddress.trim())) // <-- Fixed here
      newErrors.ownerWalletAddress = 'Invalid wallet address.';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required.';
    if (!formData.surveyNumber.trim()) newErrors.surveyNumber = 'Survey number is required.';
    if (!formData.propertyId.trim()) newErrors.propertyId = 'Property ID is required.';
    if (!formData.propertyAddress.trim()) newErrors.propertyAddress = 'Property address is required.';
    if (!formData.district.trim()) newErrors.district = 'District is required.'; // ✅ FIXED: Added district validation
    if (!formData.area.trim()) newErrors.area = 'Area is required.';
    if (!selectedFiles.motherDeed) newErrors.motherDeed = 'Mother Deed is required.';
    if (!selectedFiles.encumbranceCertificate) newErrors.encumbranceCertificate = 'Encumbrance Certificate is required.';
    if (!verifierWalletAddress) newErrors.verifierWallet = 'Please connect your wallet to proceed.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setFeedback({ type: 'error', message: 'Please correct the errors before submitting.' });
      return;
    }
    setPendingSubmission({ formData, selectedFiles });
    confirmWalletTransaction({ formData, selectedFiles });
  };

  const confirmWalletTransaction = async (submissionData) => {
    if (!submissionData) return;

    setIsSubmitting(true);
    setFeedback({ type: 'info', message: 'Uploading documents and preparing transaction...' });

    try {
      const prepareData = new FormData();
      Object.entries(submissionData.formData).forEach(([key, value]) => prepareData.append(key, value.trim()));
      prepareData.append('motherDeed', submissionData.selectedFiles.motherDeed);
      prepareData.append('encumbranceCertificate', submissionData.selectedFiles.encumbranceCertificate);
      
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');

      const prepareRes = await fetch('http://localhost:5000/api/properties/prepare', {
        method: 'POST',
        body: prepareData,
        headers: { Authorization: `Bearer ${token}` },
      });

      const prepareResult = await prepareRes.json();
      if (!prepareRes.ok) throw new Error(prepareResult.message || `Server error: ${prepareRes.status}`);

      const { transactionData, propertyData } = prepareResult;

      setFeedback({ type: 'info', message: 'Please sign the transaction in your MetaMask wallet.' });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: transactionData.to,
        data: transactionData.data,
      });

      setFeedback({ type: 'info', message: 'Transaction sent. Waiting for confirmation...' });
      await tx.wait();

      const finalizeRes = await fetch('http://localhost:5000/api/properties/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transactionHash: tx.hash, propertyData }),
      });

      const finalizeResult = await finalizeRes.json();
      if (!finalizeRes.ok) throw new Error(finalizeResult.message || `Server error: ${finalizeRes.status}`);

      setFeedback({ type: 'success', message: 'Property registered successfully!' });
      resetForm();

    } catch (error) {
      console.error('Submission Error:', error);
      const errorMessage = error.code === 'ACTION_REJECTED'
        ? 'Transaction rejected in wallet.'
        : (error.message || 'An unknown error occurred.');
      setFeedback({ type: 'error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
      setPendingSubmission(null);
    }
  };

  const resetForm = () => {
    setFormData({ ownerWalletAddress: '', ownerName: '', surveyNumber: '', propertyId: '', propertyAddress: '', district: '', area: '' });
    setSelectedFiles({ motherDeed: null, encumbranceCertificate: null });
    setSearchQuery('');
    setErrors({});
    document.getElementById('motherDeed-upload').value = '';
    document.getElementById('encumbranceCertificate-upload').value = '';
  };

  const inputClass = (error) => `w-full px-4 py-3 border rounded-lg ${error ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Register New Property</h2>
            <p className="text-gray-600">Enter property details and upload documents for on-chain registration.</p>
        </div>

        {/* Wallet Connector */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Verifier Wallet</span>
            </div>
            {!verifierWalletAddress ? (
                <button onClick={connectWallet} disabled={isConnectingWallet} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center">
                    {isConnectingWallet ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /><span>Connecting...</span></> : 'Connect Wallet'}
                </button>
            ) : (
                <div className="text-sm text-green-800 font-mono bg-green-100 px-2 py-1 rounded">
                    Connected: {verifierWalletAddress.substring(0, 6)}...{verifierWalletAddress.substring(38)}
                </div>
            )}
        </div>
        {errors.verifierWallet && <p className="mt-2 text-sm text-red-600">{errors.verifierWallet}</p>}

        {/* Feedback Area */}
        {feedback.message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
                feedback.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                'bg-red-50 border-red-200 text-red-800'
            }`}>
                {feedback.type === 'success' ? <CheckCircle className="h-5 w-5" /> : 
                 feedback.type === 'info' ? <Loader2 className="h-5 w-5 animate-spin" /> :
                 <AlertCircle className="h-5 w-5" />}
                <p className="text-sm">{feedback.message}</p>
            </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Search User */}
            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><Search className="h-4 w-4 mr-2" />Search User by Email *</label>
                <div className="relative">
                    <input value={searchQuery} onChange={handleSearchChange} placeholder="Enter user email..." className={inputClass()} disabled={isSubmitting} />
                    {isSearching && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-gray-400" />}
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                            {searchResults.map(user => (
                                <div key={user._id} onClick={() => handleUserSelect(user)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <p className="text-sm font-medium">{user.email}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Owner Wallet Address */}
            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><User className="h-4 w-4 mr-2" />Owner's Wallet Address *</label>
                <input name="ownerWalletAddress" value={formData.ownerWalletAddress} readOnly className={`${inputClass(errors.ownerWalletAddress)} bg-gray-100`} />
                {errors.ownerWalletAddress && <p className="mt-1 text-sm text-red-600">{errors.ownerWalletAddress}</p>}
            </div>

            {/* Owner Name */}
            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><User className="h-4 w-4 mr-2" />Owner Name *</label>
                <input name="ownerName" value={formData.ownerName} readOnly className={`${inputClass(errors.ownerName)} bg-gray-100`} />
                {errors.ownerName && <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>}
            </div>
            
            {/* Survey Number */}
            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><FileText className="h-4 w-4 mr-2" />Survey Number *</label>
                <input name="surveyNumber" value={formData.surveyNumber} onChange={handleInputChange} placeholder="e.g., S-123/45" className={inputClass(errors.surveyNumber)} disabled={isSubmitting} />
                {errors.surveyNumber && <p className="mt-1 text-sm text-red-600">{errors.surveyNumber}</p>}
            </div>

            {/* Property ID */}
            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><FileText className="h-4 w-4 mr-2" />Property ID (PID) *</label>
                <input name="propertyId" value={formData.propertyId} onChange={handleInputChange} placeholder="e.g., PID-2025-7890" className={inputClass(errors.propertyId)} disabled={isSubmitting} />
                {errors.propertyId && <p className="mt-1 text-sm text-red-600">{errors.propertyId}</p>}
            </div>

            {/* Property Address */}
            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><MapPin className="h-4 w-4 mr-2" />Property Address *</label>
                <input name="propertyAddress" value={formData.propertyAddress} onChange={handleInputChange} placeholder="e.g., 123 Main St, Sector 15" className={inputClass(errors.propertyAddress)} disabled={isSubmitting} />
                {errors.propertyAddress && <p className="mt-1 text-sm text-red-600">{errors.propertyAddress}</p>}
            </div>
            
            {/* District */}
            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><MapPin className="h-4 w-4 mr-2" />District *</label>
                <input name="district" value={formData.district} onChange={handleInputChange} placeholder="e.g., Thane" className={inputClass(errors.district)} disabled={isSubmitting} />
                {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
            </div>

            {/* Area */}
            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><MapPin className="h-4 w-4 mr-2" />Area (sq ft) *</label>
                <input name="area" value={formData.area} onChange={handleInputChange} placeholder="e.g., 1200" className={inputClass(errors.area)} disabled={isSubmitting} />
                {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
            </div>
            
            {/* File Uploads */}
            {['motherDeed', 'encumbranceCertificate'].map(docType => (
                <div key={docType}>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><Upload className="h-4 w-4 mr-2" />{docType === 'motherDeed' ? 'Mother Deed' : 'Encumbrance Certificate'} (PDF) *</label>
                    <div className={`border-2 border-dashed rounded-lg p-6 ${errors[docType] ? 'border-red-300' : 'border-gray-300'}`}>
                        <input type="file" id={`${docType}-upload`} accept=".pdf" onChange={(e) => handleFileChange(e, docType)} className="hidden" disabled={isSubmitting} />
                        <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <label htmlFor={`${docType}-upload`} className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                                Upload a file
                            </label>
                            <p className="text-xs text-gray-500 mt-2">PDF up to 10MB</p>
                            {selectedFiles[docType] && (
                                <div className="mt-4 p-2 bg-blue-50 rounded-md text-sm text-blue-800">
                                    Selected: {selectedFiles[docType].name}
                                </div>
                            )}
                        </div>
                    </div>
                    {errors[docType] && <p className="mt-1 text-sm text-red-600">{errors[docType]}</p>}
                </div>
            ))}

            {/* Submit Button */}
            <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !verifierWalletAddress}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /><span>Processing...</span></> : 'Register Property'}
                </button>
            </div>
        </form>
    </div>
  );

}