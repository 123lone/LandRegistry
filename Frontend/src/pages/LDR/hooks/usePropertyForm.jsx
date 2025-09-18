import { useState } from 'react';

export const usePropertyForm = () => {
  const [formData, setFormData] = useState({
    ownerWalletAddress: '',
    ownerName: '',
    surveyNumber: '',
    propertyId: '',
    propertyAddress: '',
    area: '',
    propertyTitle: '',
    propertyLocation: '',
    description: ''
  });
  
  const [selectedFiles, setSelectedFiles] = useState({
    motherDeed: null,
    encumbranceCertificate: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  
  // User search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.ownerWalletAddress.trim()) {
      newErrors.ownerWalletAddress = 'Owner wallet address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.ownerWalletAddress.trim())) {
      newErrors.ownerWalletAddress = 'Invalid wallet address format';
    }
    
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!formData.surveyNumber.trim()) newErrors.surveyNumber = 'Survey number is required';
    if (!formData.propertyId.trim()) newErrors.propertyId = 'Property ID is required';
    if (!formData.propertyAddress.trim()) newErrors.propertyAddress = 'Property address is required';
    if (!formData.area.trim()) newErrors.area = 'Area is required';
    if (!formData.propertyTitle.trim()) newErrors.propertyTitle = 'Property title is required';
    if (!formData.propertyLocation.trim()) newErrors.propertyLocation = 'Property location is required';
    
    if (!selectedFiles.motherDeed) newErrors.motherDeed = 'Mother Deed is required';
    if (!selectedFiles.encumbranceCertificate) newErrors.encumbranceCertificate = 'Encumbrance Certificate is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // User search
  const fetchVerifiedUsers = async (email = '') => {
    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      const response = await fetch(`http://localhost:5000/api/verifier/verified-users${email ? `?email=${encodeURIComponent(email)}` : ''}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setSearchResults(result.data);
      } else {
        setFeedback({ type: 'error', message: result.message || 'Failed to fetch users' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch users' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      fetchVerifiedUsers(query);
    } else {
      setSearchResults([]);
    }
  };

  const handleUserSelect = (user) => {
    setFormData(prev => ({
      ...prev,
      ownerWalletAddress: user.walletAddress || '',
      ownerName: user.name || ''
    }));
    // setSearchQuery(user.email || '');
    // setSearchResults([]);
    // setErrors(prev => ({ ...prev, ownerWalletAddress: '', ownerName: '' }));
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
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
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setFeedback({
        type: 'error',
        message: 'Please correct the errors above before submitting'
      });
      return;
    }
    
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });
    
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.trim());
      });
      submitData.append('motherDeed', selectedFiles.motherDeed);
      submitData.append('encumbranceCertificate', selectedFiles.encumbranceCertificate);
      
      const response = await fetch('/api/ldr/upload', {
        method: 'POST',
        body: submitData
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      setFeedback({
        type: 'success',
        message: 'Property registered successfully! Documents have been uploaded and are pending blockchain verification.'
      });
      
      // Reset form
      setFormData({
        ownerWalletAddress: '',
        ownerName: '',
        surveyNumber: '',
        propertyId: '',
        propertyAddress: '',
        area: '',
        propertyTitle: '',
        propertyLocation: '',
        description: ''
      });
      setSelectedFiles({ motherDeed: null, encumbranceCertificate: null });
      setSearchQuery('');
      
      // Reset file inputs
      ['motherDeed', 'encumbranceCertificate'].forEach(id => {
        const fileInput = document.getElementById(`${id}-upload`);
        if (fileInput) fileInput.value = '';
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      setFeedback({
        type: 'error',
        message: 'Failed to register property. Please try again or contact support.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    selectedFiles,
    isSubmitting,
    feedback,
    errors,
    searchQuery,
    searchResults,
    isSearching,
    handleSearchChange,
    handleUserSelect,
    handleInputChange,
    handleFileChange,
    handleSubmit
  };
};

// components/UserSearchSection.jsx
import React from 'react';
import { Search, Loader2 } from 'lucide-react';

export const UserSearchSection = ({ 
  searchQuery, 
  searchResults, 
  isSearching, 
  onSearchChange, 
  onUserSelect, 
  disabled 
}) => {
  return (
    <div>
      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
        <Search className="h-4 w-4 mr-2" />
        Search User by Email *
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Enter user email to search..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={disabled}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-gray-400" />
        )}
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map(user => (
              <div
                key={user._id}
                onClick={() => onUserSelect(user)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">{user.name || 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
