import React, { useState } from 'react';
import { Download, FileText, Search, AlertCircle, CheckCircle, Upload, Eye } from 'lucide-react';

const DocumentFetcher = ({ onDocumentsFetched }) => {
  const [ownerCredentials, setOwnerCredentials] = useState({
    aadharNumber: '',
    panNumber: '',
    mobileNumber: '',
    otp: ''
  });
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP, 3: Documents
  const [loading, setLoading] = useState(false);
  const [fetchedDocuments, setFetchedDocuments] = useState([]);
  const [additionalDocuments, setAdditionalDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  // Mock OTP for demo
  const DEMO_OTP = '123456';

  const handleCredentialSubmit = async () => {
    setLoading(true);
    // Simulate API call for OTP generation
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleOTPVerification = async () => {
    if (ownerCredentials.otp !== DEMO_OTP) {
      alert('Invalid OTP. Please use 123456 for demo');
      return;
    }
    
    setLoading(true);
    // Simulate fetching documents from IPFS based on credentials
    setTimeout(() => {
      const mockDocuments = [
        {
          id: 'DOC001',
          name: 'Sale Deed',
          type: 'PDF',
          size: '2.3 MB',
          ipfsHash: 'QmSaleDeed123',
          issueDate: '2020-03-15',
          status: 'verified',
          description: 'Original sale deed document from government registry',
          required: true
        },
        {
          id: 'DOC002',
          name: 'Property Card',
          type: 'PDF',
          size: '1.8 MB',
          ipfsHash: 'QmPropCard456',
          issueDate: '2020-03-16',
          status: 'verified',
          description: 'Government issued property ownership card',
          required: true
        },
        {
          id: 'DOC003',
          name: 'Survey Settlement',
          type: 'PDF',
          size: '3.1 MB',
          ipfsHash: 'QmSurvey789',
          issueDate: '2020-03-10',
          status: 'verified',
          description: 'Land survey and settlement records',
          required: true
        },
        {
          id: 'DOC004',
          name: 'Mutation Entry',
          type: 'PDF',
          size: '1.2 MB',
          ipfsHash: 'QmMutation012',
          issueDate: '2020-03-20',
          status: 'pending',
          description: 'Land mutation and ownership transfer records',
          required: false
        }
      ];
      
      setFetchedDocuments(mockDocuments);
      setSelectedDocuments(mockDocuments.filter(doc => doc.required));
      setLoading(false);
      setStep(3);
    }, 2000);
  };

  const handleDocumentDownload = (document) => {
    console.log(`Downloading ${document.name} from IPFS: ${document.ipfsHash}`);
    
    // Simulate download
    const blob = new Blob(['Sample document content'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.name.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAdditionalDocumentUpload = (event) => {
    const files = Array.from(event.target.files);
    const newDocuments = files.map((file, index) => ({
      id: `ADDITIONAL_${Date.now()}_${index}`,
      name: file.name,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      file: file,
      status: 'uploaded',
      description: 'Additional document uploaded by seller',
      required: false
    }));
    
    setAdditionalDocuments([...additionalDocuments, ...newDocuments]);
  };

  const handleDocumentSelection = (documentId) => {
    setSelectedDocuments(prev => {
      const isSelected = prev.find(doc => doc.id === documentId);
      if (isSelected) {
        return prev.filter(doc => doc.id !== documentId);
      } else {
        const document = [...fetchedDocuments, ...additionalDocuments].find(doc => doc.id === documentId);
        return [...prev, document];
      }
    });
  };

  const handleSubmitForVerification = () => {
    const allDocuments = {
      governmentDocuments: selectedDocuments.filter(doc => fetchedDocuments.find(fd => fd.id === doc.id)),
      additionalDocuments: selectedDocuments.filter(doc => additionalDocuments.find(ad => ad.id === doc.id)),
      ownerCredentials: ownerCredentials
    };
    
    onDocumentsFetched && onDocumentsFetched(allDocuments);
    alert('Documents submitted for verification successfully!');
  };

  if (step === 1) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fetch Your Land Documents</h2>
          <p className="text-gray-600">Enter your credentials to retrieve documents from government registry</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number</label>
            <input
              type="text"
              value={ownerCredentials.aadharNumber}
              onChange={(e) => setOwnerCredentials({...ownerCredentials, aadharNumber: e.target.value})}
              placeholder="Enter 12-digit Aadhar number (1234-5678-9012)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
            <input
              type="text"
              value={ownerCredentials.panNumber}
              onChange={(e) => setOwnerCredentials({...ownerCredentials, panNumber: e.target.value})}
              placeholder="Enter PAN number (ABCDE1234F)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
            <input
              type="text"
              value={ownerCredentials.mobileNumber}
              onChange={(e) => setOwnerCredentials({...ownerCredentials, mobileNumber: e.target.value})}
              placeholder="Enter registered mobile number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <button
          onClick={handleCredentialSubmit}
          disabled={!ownerCredentials.aadharNumber || !ownerCredentials.panNumber || !ownerCredentials.mobileNumber || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Send OTP & Fetch Documents
            </>
          )}
        </button>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <strong>Demo Credentials:</strong><br />
              Aadhar: 1234-5678-9012<br />
              PAN: ABCDE1234F<br />
              Mobile: 9876543210
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">OTP Verification</h2>
          <p className="text-gray-600">Enter the OTP sent to your registered mobile number</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
            <input
              type="text"
              value={ownerCredentials.otp}
              onChange={(e) => setOwnerCredentials({...ownerCredentials, otp: e.target.value})}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg tracking-widest"
            />
          </div>
        </div>
        
        <button
          onClick={handleOTPVerification}
          disabled={!ownerCredentials.otp || ownerCredentials.otp.length !== 6 || loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify & Fetch Documents
            </>
          )}
        </button>
        
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-700">
              <strong>Demo OTP:</strong> 123456
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Land Documents</h2>
          <p className="text-gray-600">Review, download, and add additional documents for verification</p>
        </div>
        
        {/* Government Fetched Documents */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Government Registry Documents</h3>
          <div className="space-y-3">
            {fetchedDocuments.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.find(sd => sd.id === doc.id) !== undefined}
                      onChange={() => handleDocumentSelection(doc.id)}
                      className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                      <p className="text-sm text-gray-600">{doc.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      doc.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status}
                    </span>
                    <button
                      onClick={() => handleDocumentDownload(doc)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors duration-200"
                      title="Download Document"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500 ml-9">
                  {doc.type} • {doc.size} • Issue Date: {doc.issueDate}
                  {doc.required && <span className="text-red-600 ml-2">• Required</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Additional Documents Upload */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Documents</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-sm text-gray-600 mb-2">
              Upload additional documents (Property tax receipts, NOCs, etc.)
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleAdditionalDocumentUpload}
              className="hidden"
              id="additional-docs"
            />
            <label
              htmlFor="additional-docs"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </label>
          </div>
          
          {additionalDocuments.length > 0 && (
            <div className="mt-4 space-y-3">
              {additionalDocuments.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.find(sd => sd.id === doc.id) !== undefined}
                        onChange={() => handleDocumentSelection(doc.id)}
                        className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <FileText className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {doc.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 ml-9">
                    {doc.type} • {doc.size}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit for Verification */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Selected Documents ({selectedDocuments.length})</h4>
          <div className="text-sm text-gray-600 mb-4">
            {selectedDocuments.length === 0 ? 'No documents selected' : 
             `${selectedDocuments.filter(doc => fetchedDocuments.find(fd => fd.id === doc.id)).length} government documents, ${selectedDocuments.filter(doc => additionalDocuments.find(ad => ad.id === doc.id)).length} additional documents`}
          </div>
          
          <button
            onClick={handleSubmitForVerification}
            disabled={selectedDocuments.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white p-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Submit for Land Inspector Verification
          </button>
        </div>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              <strong>Note:</strong> Your selected documents will be submitted to a land inspector for verification. 
              Government documents fetched from IPFS are already verified, but additional documents will need inspection approval.
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default DocumentFetcher;