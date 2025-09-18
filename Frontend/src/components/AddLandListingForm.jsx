import React, { useState } from 'react';
import InteractiveMap from './InteractiveMap'; // Adjust path as needed
import PropertyDetailsForm from './PropertyDetailsForm'; // Adjust path as needed

const AddLandListingForm = () => {
  const [formData, setFormData] = useState({
    propertyAddress: '',
    area: '',
    price: '',
    description: '',
    propertyPID: '',
    surveyNumber: '',
    coordinates: [],
    pinLocations: [],
    taxDocument: null,
    encumbrance: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Receive map data
  const handleMapUpdate = (mapData) => {
    setFormData(prev => ({
      ...prev,
      coordinates: mapData.coordinates,
      pinLocations: mapData.pinLocations,
      area: mapData.area,
    }));
  };

  // Handle input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files[0] }));
  };

  // Hash a file using SHA-256
  const getFileHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  // Hash only taxDocument & encumbrance
  const hashDocuments = async () => {
    const hashedDocs = {};
    const filesToHash = ["taxDocument", "encumbrance"];
    for (const fileKey of filesToHash) {
      if (formData[fileKey]) {
        hashedDocs[fileKey] = await getFileHash(formData[fileKey]);
      }
    }
    return hashedDocs;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      setSubmitMessage("Hashing documents...");
      const documentHashes = await hashDocuments();

      const propertyData = {
        ...formData,
        documentHashes,
        taxDocument: undefined,
        encumbrance: undefined,
        blockchainTxHash: "0xFAKEBLOCKCHAINHASH1234567890", // placeholder
      };

      setSubmitMessage("Submitting property to the server...");

      const response = await fetch("http://localhost:5000/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // for auth cookies
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit property");
      }

      const result = await response.json();
      console.log("Property created:", result);
      setSubmitMessage("Property submitted successfully!");
    } catch (err) {
      console.error("Error submitting property:", err);
      setSubmitError(`Error: ${err.message}`);
      setSubmitMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasMapData = formData.coordinates.length > 0 || formData.pinLocations.length > 0;

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-lg shadow-md my-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        🗺️ Add New Land Listing
      </h2>

      {submitMessage && <div className="mb-4 p-4 text-sm text-green-800 bg-green-50 rounded-lg">{submitMessage}</div>}
      {submitError && <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 rounded-lg">{submitError}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <PropertyDetailsForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
        />

        <InteractiveMap onMapUpdate={handleMapUpdate} />

        <div className="pt-6">
          <button
            type="submit"
            className="w-full flex justify-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            disabled={isSubmitting || !hasMapData}
          >
            {isSubmitting ? 'Processing...' : '🚀 Submit to Blockchain for Verification'}
          </button>
          {!hasMapData && (
            <p className="text-sm text-red-600 mt-2 text-center">
              ⚠️ Please draw land boundaries or add pins on the map before submitting.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddLandListingForm;
