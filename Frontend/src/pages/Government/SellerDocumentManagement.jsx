import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Upload, CheckCircle, AlertTriangle, Database } from 'lucide-react';
import DocumentFetcher from './DocumentFetcher';

const SellerDocumentManagement = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState('fetch'); // 'fetch', 'review', 'submit'
  const [fetchedDocuments, setFetchedDocuments] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const handleDocumentsFetched = (documents) => {
    setFetchedDocuments(documents);
    setCurrentStep('review');
  };

  const handleFinalSubmission = async () => {
    // Simulate blockchain submission
    setSubmissionStatus('submitting');
    
    setTimeout(() => {
      setSubmissionStatus('success');
      setCurrentStep('submit');
    }, 3000);
  };

  const DocumentReview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Review & Submission</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Owner Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Owner Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Aadhar Number:</span>
                <span className="font-medium">{fetchedDocuments.ownerCredentials.aadharNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PAN Number:</span>
                <span className="font-medium">{fetchedDocuments.ownerCredentials.panNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mobile Number:</span>
                <span className="font-medium">{fetchedDocuments.ownerCredentials.mobileNumber}</span>
              </div>
            </div>
          </div>

          {/* Document Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Document Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Government Documents:</span>
                <span className="font-medium">{fetchedDocuments.governmentDocuments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Additional Documents:</span>
                <span className="font-medium">{fetchedDocuments.additionalDocuments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Documents:</span>
                <span className="font-medium text-blue-600">
                  {fetchedDocuments.governmentDocuments.length + fetchedDocuments.additionalDocuments.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Government Documents */}
        {fetchedDocuments.governmentDocuments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-green-600" />
              Government Registry Documents ({fetchedDocuments.governmentDocuments.length})
            </h3>
            <div className="space-y-3">
              {fetchedDocuments.governmentDocuments.map((doc, index) => (
                <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                        <p className="text-xs text-gray-500">IPFS: {doc.ipfsHash}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        Verified
                      </span>
                      <span className="text-sm text-gray-500">{doc.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Documents */}
        {fetchedDocuments.additionalDocuments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-blue-600" />
              Additional Documents ({fetchedDocuments.additionalDocuments.length})
            </h3>
            <div className="space-y-3">
              {fetchedDocuments.additionalDocuments.map((doc, index) => (
                <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        Pending Review
                      </span>
                      <span className="text-sm text-gray-500">{doc.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setCurrentStep('fetch')}
            className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
          <button
            onClick={handleFinalSubmission}
            disabled={submissionStatus === 'submitting'}
            className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submissionStatus === 'submitting' ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" /> Finalize & Submit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const SubmissionStatus = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg text-center">
      {submissionStatus === 'success' ? (
        <>
          <CheckCircle className="w-20 h-20 text-green-500 mb-4 animate-scale-in" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Submission Successful!</h2>
          <p className="text-gray-600 mb-6">Your documents have been successfully submitted to the blockchain network. A unique transaction ID has been generated for this record.</p>
          <div className="bg-gray-100 rounded-lg p-4 w-full max-w-md">
            <h4 className="font-semibold text-gray-700 mb-2">Transaction Details</h4>
            <p className="text-sm text-gray-500 break-all">
              <strong>Transaction Hash:</strong> <span className="text-blue-600 font-mono">0x4a2a...5c1b</span>
            </p>
          </div>
          <button onClick={onBack} className="mt-6 px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>
        </>
      ) : (
        <>
          <AlertTriangle className="w-20 h-20 text-red-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Submission Failed</h2>
          <p className="text-gray-600 mb-6">There was an issue submitting your documents. Please try again or contact support.</p>
          <button onClick={() => setCurrentStep('review')} className="mt-6 px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-200">
            Try Again
          </button>
        </>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 'fetch':
        return <DocumentFetcher onDocumentsFetched={handleDocumentsFetched} />;
      case 'review':
        return <DocumentReview />;
      case 'submit':
        return <SubmissionStatus />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {renderContent()}
    </div>
  );
};

export default SellerDocumentManagement;