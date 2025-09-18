import { useState } from 'react';
import { Upload, FileText, MapPin, User, AlertCircle, CheckCircle, Loader2, Search } from 'lucide-react';

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
    if (file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, [documentType]: 'Please select a PDF file only' }));
      setSelectedFiles(prev => ({ ...prev, [documentType]: null }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [documentType]: 'File size must be less than 10MB' }));
      setSelectedFiles(prev => ({ ...prev, [documentType]: null }));
      return;
    }
    setSelectedFiles(prev => ({ ...prev, [documentType]: file }));
    setErrors(prev => ({ ...prev, [documentType]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ownerWalletAddress.trim()) newErrors.ownerWalletAddress = 'Owner wallet address is required';
    else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.ownerWalletAddress.trim())) newErrors.ownerWalletAddress = 'Invalid wallet address format';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!formData.surveyNumber.trim()) newErrors.surveyNumber = 'Survey number is required';
    if (!formData.propertyId.trim()) newErrors.propertyId = 'Property ID is required';
    if (!formData.propertyAddress.trim()) newErrors.propertyAddress = 'Property address is required';
    if (!formData.area.trim()) newErrors.area = 'Area is required';
    if (!selectedFiles.motherDeed) newErrors.motherDeed = 'Mother Deed is required';
    if (!selectedFiles.encumbranceCertificate) newErrors.encumbranceCertificate = 'Encumbrance Certificate is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setFeedback({ type: 'error', message: 'Please correct the errors above' });
      return;
    }
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => submitData.append(key, value.trim()));
      submitData.append('motherDeed', selectedFiles.motherDeed);
      submitData.append('encumbranceCertificate', selectedFiles.encumbranceCertificate);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      const res = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        body: submitData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const response = await res.json();
      setFeedback({ type: 'success', message: 'Property registered successfully! Documents uploaded and pending blockchain verification.' });
      setFormData({ ownerWalletAddress: '', ownerName: '', surveyNumber: '', propertyId: '', propertyAddress: '', area: '', description: '' });
      setSelectedFiles({ motherDeed: null, encumbranceCertificate: null });
      setSearchQuery('');
      ['motherDeed', 'encumbranceCertificate'].forEach(id => document.getElementById(`${id}-upload`).value = '');
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Failed to register property. Try again or contact support.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (error) => `w-full px-4 py-3 border rounded-lg ${error ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`;
  const fileUploadClass = (error) => `border-2 border-dashed rounded-lg p-6 ${error ? 'border-red-300' : 'border-gray-300'}`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Register New Property</h2>
          <p className="text-gray-600">Upload official property documents to register on the blockchain.</p>
        </div>

        {feedback.message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${feedback.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            {feedback.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
            <p className={`text-sm ${feedback.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{feedback.message}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><Search className="h-4 w-4 mr-2" />Search User by Email *</label>
            <div className="relative">
              <input value={searchQuery} onChange={handleSearchChange} placeholder="Enter user email..." className={inputClass()} disabled={isSubmitting} />
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
            <input name="surveyNumber" value={formData.surveyNumber} onChange={handleInputChange} placeholder="e.g., S-123/45" className={inputClass(errors.surveyNumber)} disabled={isSubmitting} />
            {errors.surveyNumber && <p className="mt-1 text-sm text-red-600">{errors.surveyNumber}</p>}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><FileText className="h-4 w-4 mr-2" />Property ID (PID) *</label>
            <input name="propertyId" value={formData.propertyId} onChange={handleInputChange} placeholder="e.g., PID-2025-7890" className={inputClass(errors.propertyId)} disabled={isSubmitting} />
            {errors.propertyId && <p className="mt-1 text-sm text-red-600">{errors.propertyId}</p>}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><MapPin className="h-4 w-4 mr-2" />Property Address *</label>
            <input name="propertyAddress" value={formData.propertyAddress} onChange={handleInputChange} placeholder="e.g., 123 Main St, Sector 15, New Delhi" className={inputClass(errors.propertyAddress)} disabled={isSubmitting} />
            {errors.propertyAddress && <p className="mt-1 text-sm text-red-600">{errors.propertyAddress}</p>}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><MapPin className="h-4 w-4 mr-2" />Area (sq ft) *</label>
            <input name="area" value={formData.area} onChange={handleInputChange} placeholder="e.g., 1200" className={inputClass(errors.area)} disabled={isSubmitting} />
            {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Additional details..." className={inputClass()} disabled={isSubmitting} />
          </div>

          {['motherDeed', 'encumbranceCertificate'].map(docType => (
            <div key={docType}>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2"><Upload className="h-4 w-4 mr-2" />{docType === 'motherDeed' ? 'Mother Deed' : 'Encumbrance Certificate'} (PDF) *</label>
              <div className={fileUploadClass(errors[docType])}>
                <input type="file" id={`${docType}-upload`} accept=".pdf" onChange={(e) => handleFileChange(e, docType)} className="hidden" disabled={isSubmitting} />
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor={`${docType}-upload`} className="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
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
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Register Property</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}