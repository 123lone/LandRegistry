import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Mock data for a single task. In a real app, this would be fetched based on a task ID.
const mockTask = {
  id: 1,
  type: 'Profile Verification',
  status: 'Pending',
  userName: 'Atharva Doe',
  submittedDocuments: [
    { name: 'Aadhar Card.pdf', url: 'https://example.com/aadhar.pdf' },
    { name: 'PAN Card.jpg', url: 'https://example.com/pan.jpg' },
  ],
  details: 'User needs profile verification to proceed with land transactions.',
};

const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejected, setIsRejected] = useState(false);

  const handleApprove = () => {
    alert(`Task ${taskId} Approved! A record will be created on the blockchain.`);
    navigate('/verifier-dashboard');
  };

  const handleReject = () => {
    setIsRejected(true);
  };
  
  const handleConfirmReject = () => {
      if (rejectionReason.trim() === '') {
          alert("Please provide a reason for rejection.");
          return;
      }
      alert(`Task ${taskId} Rejected with reason: "${rejectionReason}"`);
      navigate('/verifier-dashboard');
  };

  const handleGoBack = () => {
    navigate('/verifier-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <button
          onClick={handleGoBack}
          className="text-blue-600 hover:text-blue-800 mb-6 font-semibold"
        >
          &larr; Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Task Details
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Review and take action on this task.
        </p>

        <div className="space-y-4 border-b pb-6 mb-6">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700">Type:</span>
            <span className="text-gray-900">{mockTask.type}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700">Submitted By:</span>
            <span className="text-gray-900">{mockTask.userName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700">Status:</span>
            <span className="text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full text-xs font-semibold">
              {mockTask.status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700">Details:</span>
            <span className="text-gray-900">{mockTask.details}</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-700">
            Submitted Documents
          </h2>
          <ul className="space-y-2">
            {mockTask.submittedDocuments.map((doc, index) => (
              <li key={index} className="flex items-center space-x-2 text-blue-600 hover:underline cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2a1 1 0 011-1h2.586l.293.293A1 1 0 0010 5.586V9a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 011-1h2.414L10 6.586V6z" clipRule="evenodd" />
                </svg>
                <span>{doc.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center space-x-4">
          {isRejected ? (
            <div className="w-full">
              <textarea
                className="w-full p-2 border rounded-md mb-2"
                rows="3"
                placeholder="Provide a clear reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleConfirmReject}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => setIsRejected(false)}
                  className="flex-1 py-2 px-4 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={handleApprove}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Approve Task
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Reject Task
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;