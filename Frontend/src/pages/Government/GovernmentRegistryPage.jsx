import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Download, FileText, MapPin, Calendar, User, Shield, Database, ExternalLink, Eye, AlertCircle } from 'lucide-react';

const GovernmentRegistryPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('aadhar');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ govId: '', accessKey: '' });

  // Mock government data - In real implementation, this would come from IPFS/blockchain
  const mockGovData = [
    {
      id: 'PROP001',
      aadharNumber: '1234-5678-9012',
      panNumber: 'ABCDE1234F',
      ownerName: 'Rajesh Kumar Singh',
      propertyType: 'Residential Plot',
      area: '2400 sq ft',
      location: 'Sector 15, Noida, UP',
      surveyNumber: 'SN/2023/001',
      registrationDate: '2020-03-15',
      lastUpdated: '2023-08-20',
      ipfsHash: 'QmX7Y8Z9A1B2C3D4E5F6G7H8I9J0K',
      documents: [
        { name: 'Sale Deed', type: 'PDF', size: '2.3 MB', ipfsHash: 'QmSaleDeed123', status: 'verified' },
        { name: 'Property Card', type: 'PDF', size: '1.8 MB', ipfsHash: 'QmPropCard456', status: 'verified' },
        { name: 'Survey Settlement', type: 'PDF', size: '3.1 MB', ipfsHash: 'QmSurvey789', status: 'verified' },
        { name: 'Mutation Entry', type: 'PDF', size: '1.2 MB', ipfsHash: 'QmMutation012', status: 'pending' }
      ],
      coordinates: { lat: 28.5355, lng: 77.3910 },
      marketValue: '₹85,00,000',
      status: 'Active',
      verificationStatus: 'Verified',
      lastVerifiedBy: 'Inspector ID: INS001'
    },
    {
      id: 'PROP002',
      aadharNumber: '9876-5432-1098',
      panNumber: 'FGHIJ5678K',
      ownerName: 'Priya Sharma',
      propertyType: 'Agricultural Land',
      area: '5 Acres',
      location: 'Village Rampur, District Ghaziabad, UP',
      surveyNumber: 'SN/2023/002',
      registrationDate: '2019-11-08',
      lastUpdated: '2023-07-15',
      ipfsHash: 'QmA1B2C3D4E5F6G7H8I9J0K1L',
      documents: [
        { name: 'Land Revenue Record', type: 'PDF', size: '2.8 MB', ipfsHash: 'QmRevenue345', status: 'verified' },
        { name: 'Khasra Number', type: 'PDF', size: '1.5 MB', ipfsHash: 'QmKhasra678', status: 'verified' },
        { name: 'Agricultural Certificate', type: 'PDF', size: '2.1 MB', ipfsHash: 'QmAgri901', status: 'verified' }
      ],
      coordinates: { lat: 28.6692, lng: 77.4538 },
      marketValue: '₹2,50,00,000',
      status: 'Active',
      verificationStatus: 'Verified',
      lastVerifiedBy: 'Inspector ID: INS002'
    }
  ];

  const handleAuth = () => {
    // Mock authentication - in real implementation, this would verify against government database
    if (credentials.govId === 'GOV123' && credentials.accessKey === 'ACCESS456') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials. Please check your Government ID and Access Key.');
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const results = mockGovData.filter(property => {
        if (searchType === 'aadhar') {
          return property.aadharNumber.includes(searchQuery.replace(/\s/g, ''));
        } else if (searchType === 'pan') {
          return property.panNumber.toLowerCase().includes(searchQuery.toLowerCase());
        } else if (searchType === 'survey') {
          return property.surveyNumber.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
      });
      
      setSearchResults(results);
      setLoading(false);
    }, 1500);
  };

  const handleDownloadDocument = (document, propertyId) => {
    // In real implementation, this would fetch from IPFS
    console.log(`Downloading ${document.name} from IPFS: ${document.ipfsHash}`);
    
    // Simulate download
    const blob = new Blob(['Sample document content'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.name}_${propertyId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllDocuments = (property) => {
    property.documents.forEach(doc => {
      setTimeout(() => handleDownloadDocument(doc, property.id), 500);
    });
  };

  // Authentication Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Government Registry Access</h1>
              <p className="text-gray-600">Enter your official credentials to access the land metadata registry</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Government ID</label>
                <input
                  type="text"
                  value={credentials.govId}
                  onChange={(e) => setCredentials({...credentials, govId: e.target.value})}
                  placeholder="Enter your Government ID (e.g., GOV123)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Key</label>
                <input
                  type="password"
                  value={credentials.accessKey}
                  onChange={(e) => setCredentials({...credentials, accessKey: e.target.value})}
                  placeholder="Enter your Access Key (e.g., ACCESS456)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={handleAuth}
              disabled={!credentials.govId || !credentials.accessKey}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white p-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Access Registry
            </button>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <strong>Demo Credentials:</strong><br />
                  Government ID: GOV123<br />
                  Access Key: ACCESS456
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const PropertyCard = ({ property }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{property.propertyType}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{property.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">Registered: {property.registrationDate}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
            property.verificationStatus === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {property.verificationStatus}
          </div>
          <div className="text-lg font-bold text-blue-600">{property.marketValue}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Owner:</span>
          <div className="font-semibold">{property.ownerName}</div>
        </div>
        <div>
          <span className="text-gray-500">Area:</span>
          <div className="font-semibold">{property.area}</div>
        </div>
        <div>
          <span className="text-gray-500">Survey No:</span>
          <div className="font-semibold">{property.surveyNumber}</div>
        </div>
        <div>
          <span className="text-gray-500">Property ID:</span>
          <div className="font-semibold">{property.id}</div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-900">Available Documents ({property.documents.length})</h4>
          <button
            onClick={() => handleDownloadAllDocuments(property)}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors duration-200"
          >
            Download All
          </button>
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {property.documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-blue-600 mr-2" />
                <div>
                  <div className="font-medium text-sm text-gray-900">{doc.name}</div>
                  <div className="text-xs text-gray-500">{doc.type} • {doc.size}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  doc.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {doc.status}
                </span>
                <button
                  onClick={() => handleDownloadDocument(doc, property.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded transition-colors duration-200"
                  title="Download Document"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Shield className="w-3 h-3 mr-1" />
          IPFS Hash: {property.ipfsHash}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedProperty(property)}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-semibold"
          >
            <Eye className="w-4 h-4 inline mr-1" />
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Government Land Registry</h1>
                <p className="text-gray-600">Access land metadata stored on IPFS blockchain</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                <Shield className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold">Authenticated</span>
              </div>
              <div className="flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-lg">
                <Database className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold">IPFS Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Search Land Records</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Type</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="aadhar">Aadhar Number</option>
                <option value="pan">PAN Number</option>
                <option value="survey">Survey Number</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {searchType === 'aadhar' ? 'Aadhar Number' : searchType === 'pan' ? 'PAN Number' : 'Survey Number'}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchType === 'aadhar' ? 'Enter 12-digit Aadhar (1234-5678-9012)' : 
                  searchType === 'pan' ? 'Enter PAN number (ABCDE1234F)' : 
                  'Enter survey number (SN/2023/001)'
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={!searchQuery || loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white p-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Records
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Secure Access</h3>
                <p className="text-blue-700 text-sm">
                  All land records are stored securely on IPFS blockchain. Only authorized government credentials can access this data. 
                  Documents are encrypted and verified for authenticity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results ({searchResults.length})
              </h2>
              <div className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((property, index) => (
                <PropertyCard key={index} property={property} />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchResults.length === 0 && searchQuery && !loading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Records Found</h3>
              <p className="text-gray-600">
                No land records found for the provided {searchType} number. Please verify the information and try again.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property ID:</span>
                      <span className="font-semibold">{selectedProperty.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold">{selectedProperty.propertyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-semibold">{selectedProperty.area}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Value:</span>
                      <span className="font-semibold text-green-600">{selectedProperty.marketValue}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold">{selectedProperty.ownerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aadhar:</span>
                      <span className="font-semibold">{selectedProperty.aadharNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PAN:</span>
                      <span className="font-semibold">{selectedProperty.panNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Registration</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <div className="font-semibold">{selectedProperty.location}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Survey Number:</span>
                      <div className="font-semibold">{selectedProperty.surveyNumber}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Registration Date:</span>
                      <div className="font-semibold">{selectedProperty.registrationDate}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <div className="font-semibold">{selectedProperty.lastUpdated}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Information</h3>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Database className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-semibold">IPFS Storage Hash</span>
                  </div>
                  <code className="text-sm text-purple-800 bg-white px-2 py-1 rounded block mb-3">
                    {selectedProperty.ipfsHash}
                  </code>
                  <div className="flex items-center justify-between">
                    <a
                      href={`https://ipfs.io/ipfs/${selectedProperty.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View on IPFS Network
                    </a>
                    <span className="text-sm text-gray-600">
                      Verified by: {selectedProperty.lastVerifiedBy}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentRegistryPage;