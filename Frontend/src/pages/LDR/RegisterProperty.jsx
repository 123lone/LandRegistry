import { useState, useEffect } from 'react';
// The 'ethers' library will be loaded dynamically, so the static import is removed.
import { Upload, FileText, MapPin, User, AlertCircle, CheckCircle, Loader2, Search, Wallet } from 'lucide-react';

export default function RegisterProperty() {
  const [formData, setFormData] = useState({
    ownerWalletAddress: '',
    ownerName: '',
    surveyNumber: '',
    propertyId: '',
    propertyAddress: '',
    area: '',
    description: '',
  });
  const [selectedFiles, setSelectedFiles] = useState({ motherDeed: null, encumbranceCertificate: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [showWalletConfirmation, setShowWalletConfirmation] = useState(false);
  const [verifierWalletAddress, setVerifierWalletAddress] = useState('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);

  // New state to track if the ethers library has been loaded.
  const [isEthersReady, setIsEthersReady] = useState(false);

  // Effect to dynamically load the ethers.js library from a CDN.
  useEffect(() => {
    // Check if the library is already available on the window object.
    if (window.ethers) {
      setIsEthersReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.umd.min.js';
    script.async = true;
    script.onload = () => setIsEthersReady(true);
    script.onerror = () => {
      setFeedback({ type: 'error', message: 'Failed to load the ethers.js library. Please check your internet connection.' });
    };
    
    document.body.appendChild(script);

    // Cleanup function to remove the script if the component unmounts.
    return () => {
      document.body.removeChild(script);
    };
  }, []);


  // Effect to check for an already connected wallet on component mount.
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setVerifierWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking for existing wallet connection:', error);
        }
      }
    };
    checkWallet();
  }, []);

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setFeedback({ type: 'error', message: 'MetaMask is not installed. Please install it to continue.' });
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
      setFeedback({ type: 'error', message: 'Failed to connect wallet. Please try again.' });
    } finally {
      setIsConnectingWallet(false);
    }
  };
  
  // --- FORM HANDLERS ---
  const fetchVerifiedUsers = async (email = '') => {
    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');
      const res = await fetch(`http://localhost:5000/api/verifier/verified-users${email ? `?email=${encodeURIComponent(email)}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
      const { success, data, message } = await res.json();
      if (success) setSearchResults(data);
      else setFeedback({ type: 'error', message: message || 'Failed to fetch users' });
    // } catch (err) => {
    //   setFeedback({ type: 'error', message: err.message || 'Failed to fetch users' });
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
      setErrors(prev => ({ ...prev, [documentType]: 'Please select a PDF file only.' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrors(prev => ({ ...prev, [documentType]: 'File size must be less than 10MB.' }));
      return;
    }
    setSelectedFiles(prev => ({ ...prev, [documentType]: file }));
    setErrors(prev => ({ ...prev, [documentType]: '' }));
  };
  
  // --- FORM SUBMISSION & TRANSACTION WORKFLOW ---

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ownerWalletAddress.trim()) newErrors.ownerWalletAddress = 'Owner wallet address is required.';
    // Use window.ethers now that it's loaded dynamically
    else if (!window.ethers.isAddress(formData.ownerWalletAddress.trim())) newErrors.ownerWalletAddress = 'Invalid wallet address format.';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required.';
    if (!formData.surveyNumber.trim()) newErrors.surveyNumber = 'Survey number is required.';
    if (!formData.propertyId.trim()) newErrors.propertyId = 'Property ID is required.';
    if (!formData.propertyAddress.trim()) newErrors.propertyAddress = 'Property address is required.';
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
    setShowWalletConfirmation(true);
  };
  
  const confirmWalletTransaction = async () => {
    if (!pendingSubmission) return;

    setIsSubmitting(true);
    setShowWalletConfirmation(false);
    
    try {
      setFeedback({ type: 'info', message: 'Uploading documents and preparing transaction...' });
      
      const prepareData = new FormData();
      Object.entries(pendingSubmission.formData).forEach(([key, value]) => prepareData.append(key, value.trim()));
      prepareData.append('motherDeed', pendingSubmission.selectedFiles.motherDeed);
      prepareData.append('encumbranceCertificate', pendingSubmission.selectedFiles.encumbranceCertificate);

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
      
      // Use window.ethers now that it's loaded
      const provider = new window.ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const tx = await signer.sendTransaction({
        to: transactionData.to,
        data: transactionData.data,
      });

      setFeedback({ type: 'info', message: 'Transaction sent. Waiting for blockchain confirmation...' });
      
      await tx.wait();

      const finalizeRes = await fetch('http://localhost:5000/api/properties/finalize', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
              transactionHash: tx.hash,
              propertyData: propertyData,
          }),
      });

      const finalizeResult = await finalizeRes.json();
      if (!finalizeRes.ok) throw new Error(finalizeResult.message || `Server error: ${finalizeRes.status}`);

      setFeedback({ type: 'success', message: 'Property registered successfully!' });
      resetForm();

    } catch (error) {
      console.error('Submission Error:', error);
      const errorMessage = error.message || 'An unknown error occurred. Please try again.';
      if (error.code === 'ACTION_REJECTED') {
          setFeedback({ type: 'error', message: 'Transaction rejected in wallet. Please try again.' });
      } else {
          setFeedback({ type: 'error', message: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
      setPendingSubmission(null);
    }
  };
  
  const cancelWalletTransaction = () => {
    setShowWalletConfirmation(false);
    setPendingSubmission(null);
    setFeedback({ type: 'info', message: 'Registration cancelled.' });
  };
  
  const resetForm = () => {
      setFormData({ ownerWalletAddress: '', ownerName: '', surveyNumber: '', propertyId: '', propertyAddress: '', area: '', description: '' });
      setSelectedFiles({ motherDeed: null, encumbranceCertificate: null });
      setSearchQuery('');
      setPendingSubmission(null);
      ['motherDeed-upload', 'encumbranceCertificate-upload'].forEach(id => {
          const element = document.getElementById(id);
          if (element) element.value = '';
      });
  };

  const inputClass = (error) => `w-full px-4 py-3 border rounded-lg ${error ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`;
  const fileUploadClass = (error) => `border-2 border-dashed rounded-lg p-6 ${error ? 'border-red-300' : 'border-gray-300'}`;
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Register New Property</h2>
          <p className="text-gray-600">Upload official property documents to register on the blockchain with wallet verification.</p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Verifier Wallet</span>
            </div>
            {!verifierWalletAddress ? (
              <button
                onClick={connectWallet}
                disabled={isConnectingWallet}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isConnectingWallet ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Connecting...</span></> : <><Wallet className="h-4 w-4" /><span>Connect Wallet</span></>}
              </button>
            ) : (
              <div className="text-sm text-green-800 font-mono">
                Connected: {verifierWalletAddress.substring(0, 6)}...{verifierWalletAddress.substring(38)}
              </div>
            )}
          </div>
          {errors.verifierWallet && <p className="mt-2 text-sm text-red-600">{errors.verifierWallet}</p>}
        </div>

        {feedback.message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            feedback.type === 'success' ? 'bg-green-50 border-green-200' : 
            feedback.type === 'info' ? 'bg-blue-50 border-blue-200' :
            'bg-red-50 border-red-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-600" /> : 
             feedback.type === 'info' ? <Loader2 className="h-5 w-5 text-blue-600 animate-spin" /> :
             <AlertCircle className="h-5 w-5 text-red-600" />}
            <p className={`text-sm ${
              feedback.type === 'success' ? 'text-green-800' : 
              feedback.type === 'info' ? 'text-blue-800' :
              'text-red-800'
            }`}>{feedback.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><Search className="h-4 w-4 mr-2" />Search User by Email *</label>
            <div className="relative">
              <input value={searchQuery} onChange={handleSearchChange} placeholder="Enter user email..." className={inputClass()} disabled={isSubmitting || !isEthersReady} />
              {isSearching && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-gray-400" />}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map(user => (
                    <div key={user._id} onClick={() => handleUserSelect(user)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.name || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><User className="h-4 w-4 mr-2" />Owner's Wallet Address *</label>
            <input name="ownerWalletAddress" value={formData.ownerWalletAddress} readOnly placeholder="Select a user to populate" className={`${inputClass(errors.ownerWalletAddress)} bg-gray-100`} disabled />
            {errors.ownerWalletAddress && <p className="mt-1 text-sm text-red-600">{errors.ownerWalletAddress}</p>}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><User className="h-4 w-4 mr-2" />Owner Name *</label>
            <input name="ownerName" value={formData.ownerName} readOnly placeholder="Select a user to populate" className={`${inputClass(errors.ownerName)} bg-gray-100`} disabled />
            {errors.ownerName && <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><FileText className="h-4 w-4 mr-2" />Survey Number *</label>
            <input name="surveyNumber" value={formData.surveyNumber} onChange={handleInputChange} placeholder="e.g., S-123/45" className={inputClass(errors.surveyNumber)} disabled={isSubmitting || !isEthersReady} />
            {errors.surveyNumber && <p className="mt-1 text-sm text-red-600">{errors.surveyNumber}</p>}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><FileText className="h-4 w-4 mr-2" />Property ID (PID) *</label>
            <input name="propertyId" value={formData.propertyId} onChange={handleInputChange} placeholder="e.g., PID-2025-7890" className={inputClass(errors.propertyId)} disabled={isSubmitting || !isEthersReady} />
            {errors.propertyId && <p className="mt-1 text-sm text-red-600">{errors.propertyId}</p>}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><MapPin className="h-4 w-4 mr-2" />Property Address *</label>
            <input name="propertyAddress" value={formData.propertyAddress} onChange={handleInputChange} placeholder="e.g., 123 Main St, Sector 15, New Delhi" className={inputClass(errors.propertyAddress)} disabled={isSubmitting || !isEthersReady} />
            {errors.propertyAddress && <p className="mt-1 text-sm text-red-600">{errors.propertyAddress}</p>}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><MapPin className="h-4 w-4 mr-2" />Area (sq ft) *</label>
            <input name="area" value={formData.area} onChange={handleInputChange} placeholder="e.g., 1200" className={inputClass(errors.area)} disabled={isSubmitting || !isEthersReady} />
            {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Additional details..." className={inputClass()} disabled={isSubmitting || !isEthersReady} />
          </div>

          {['motherDeed', 'encumbranceCertificate'].map(docType => (
            <div key={docType}>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><Upload className="h-4 w-4 mr-2" />{docType === 'motherDeed' ? 'Mother Deed' : 'Encumbrance Certificate'} (PDF) *</label>
              <div className={fileUploadClass(errors[docType])}>
                <input type="file" id={`${docType}-upload`} accept=".pdf" onChange={(e) => handleFileChange(e, docType)} className="hidden" disabled={isSubmitting || !isEthersReady} />
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor={`${docType}-upload`} className={`cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${!isEthersReady && 'opacity-50 cursor-not-allowed'}`}>
                      Upload {docType === 'motherDeed' ? 'Mother Deed' : 'Encumbrance Certificate'}
                    </label>
                    <p className="text-gray-500 text-sm mt-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PDF up to 10MB</p>
                  {selectedFiles[docType] && (
                    <div className="mt-4 p-2 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800 font-medium">Selected: {selectedFiles[docType].name}</p>
                      <p className="text-xs text-blue-600">Size: {(selectedFiles[docType].size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>
              </div>
              {errors[docType] && <p className="mt-1 text-sm text-red-600">{errors[docType]}</p>}
            </div>
          ))}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !verifierWalletAddress || !isEthersReady}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {!isEthersReady ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Initializing...</span>
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Register Property</span>
                </>
              )}
            </button>
          </div>
        </form>

        {showWalletConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <Wallet className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold">Confirm Transaction</h3>
              </div>
              <p className="text-gray-600 mb-6">
                You are about to register this property on the blockchain. This will require a transaction from your wallet.
              </p>
              <div className="text-sm text-gray-500 mb-4">
                <p><strong>Verifier Wallet:</strong> {verifierWalletAddress.substring(0, 6)}...{verifierWalletAddress.substring(38)}</p>
                <p><strong>Property Owner:</strong> {pendingSubmission?.formData.ownerName}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={confirmWalletTransaction}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Confirm & Sign
                </button>
                <button
                  onClick={cancelWalletTransaction}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

