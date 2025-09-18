import React from 'react';

const PropertyDetailsForm = ({ formData, handleInputChange, handleFileChange }) => {
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";
  const fileInputClasses = "mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100";

  return (
    <>
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="propertyAddress" className={labelClasses}>Property Address *</label>
          <input type="text" id="propertyAddress" name="propertyAddress" value={formData.propertyAddress} onChange={handleInputChange} className={inputClasses} placeholder="Enter full property address" required />
        </div>
        <div>
          <label htmlFor="price" className={labelClasses}>Price (in ETH) *</label>
          <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} className={inputClasses} step="0.001" min="0" placeholder="0.5" required />
        </div>
        <div>
          <label htmlFor="propertyPID" className={labelClasses}>Property PID *</label>
          <input type="text" id="propertyPID" name="propertyPID" value={formData.propertyPID} onChange={handleInputChange} className={inputClasses} placeholder="Enter Property ID" required />
        </div>
        <div>
          <label htmlFor="surveyNumber" className={labelClasses}>Survey Number *</label>
          <input type="text" id="surveyNumber" name="surveyNumber" value={formData.surveyNumber} onChange={handleInputChange} className={inputClasses} placeholder="Enter survey number" required />
        </div>
        <div>
          <label htmlFor="area" className={labelClasses}>Area (in sq meters)</label>
          <input type="text" id="area" name="area" value={formData.area} className={inputClasses} placeholder="Auto-calculated from drawings" readOnly />
        </div>
      </div>
      <div>
        <label htmlFor="description" className={labelClasses}>Description</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="3" className={inputClasses} placeholder="Describe the property features..." />
      </div>

      {/* Document Upload Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700">📄 Required Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="deedDocument" className={labelClasses}>Deed Document</label>
            <input type="file" id="deedDocument" name="deedDocument" onChange={handleFileChange} className={fileInputClasses} accept=".pdf,.jpg,.jpeg,.png" />
          </div>
          <div>
            <label htmlFor="taxDocument" className={labelClasses}>Tax Documents</label>
            <input type="file" id="taxDocument" name="taxDocument" onChange={handleFileChange} className={fileInputClasses} accept=".pdf,.jpg,.jpeg,.png" />
          </div>
          <div>
            <label htmlFor="motherDeed" className={labelClasses}>Mother Deed</label>
            <input type="file" id="motherDeed" name="motherDeed" onChange={handleFileChange} className={fileInputClasses} accept=".pdf,.jpg,.jpeg,.png" />
          </div>
          <div>
            <label htmlFor="encumbrance" className={labelClasses}>Encumbrance Certificate</label>
            <input type="file" id="encumbrance" name="encumbrance" onChange={handleFileChange} className={fileInputClasses} accept=".pdf,.jpg,.jpeg,.png" />
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyDetailsForm;