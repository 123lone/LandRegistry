import React from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const FileUploadSection = ({ 
  selectedFiles, 
  errors, 
  onFileChange, 
  feedback, 
  isSubmitting, 
  onSubmit 
}) => {
  const FileUpload = ({ id, label, selectedFile, error }) => (
    <div>
      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
        <Upload className="h-4 w-4 mr-2" />
        {label}
      </label>
      <div className={`border-2 border-dashed rounded-lg p-6 ${
        error ? 'border-red-300' : 'border-gray-300'
      }`}>
        <input
          type="file"
          id={`${id}-upload`}
          accept=".pdf"
          onChange={(e) => onFileChange(e, id)}
          className="hidden"
          disabled={isSubmitting}
        />
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label
              htmlFor={`${id}-upload`}
              className="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
            >
              {label}
            </label>
            <p className="text-gray-500 text-sm mt-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">PDF up to 10MB</p>
          {selectedFile && (
            <div className="mt-4 p-2 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800 font-medium">
                Selected: {selectedFile.name}
              </p>
              <p className="text-xs text-blue-600">
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );

  return (
    <>
      {/* Feedback Messages */}
      {feedback.message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
          feedback.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <p className={`text-sm ${
            feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {feedback.message}
          </p>
        </div>
      )}

      <FileUpload
        id="motherDeed"
        label="Upload Mother Deed"
        selectedFile={selectedFiles.motherDeed}
        error={errors.motherDeed}
      />

      <FileUpload
        id="encumbranceCertificate"
        label="Upload Encumbrance Certificate"
        selectedFile={selectedFiles.encumbranceCertificate}
        error={errors.encumbranceCertificate}
      />

      {/* Submit Button */}
      <div className="pt-4">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Registering Property...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>Register Property</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};