import React from 'react';
import { User, FileText, MapPin } from 'lucide-react';

export const PropertyFormFields = ({ formData, errors, onChange, disabled }) => {
  const FormField = ({ label, name, value, placeholder, error, icon: Icon, type = 'text', rows }) => {
    const Component = type === 'textarea' ? 'textarea' : 'input';
    
    return (
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          {Icon && <Icon className="h-4 w-4 mr-2" />}
          {label}
        </label>
        <Component
          type={type === 'textarea' ? undefined : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={disabled}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  return (
    <>
      <FormField
        label="Owner's Wallet Address *"
        name="ownerWalletAddress"
        value={formData.ownerWalletAddress}
        placeholder="0x1234567890123456789012345678901234567890"
        error={errors.ownerWalletAddress}
        icon={User}
      />

      <FormField
        label="Owner Name *"
        name="ownerName"
        value={formData.ownerName}
        placeholder="e.g., John Doe"
        error={errors.ownerName}
        icon={User}
      />

      <FormField
        label="Survey Number *"
        name="surveyNumber"
        value={formData.surveyNumber}
        placeholder="e.g., S-123/45"
        error={errors.surveyNumber}
        icon={FileText}
      />

      <FormField
        label="Property ID (PID) *"
        name="propertyId"
        value={formData.propertyId}
        placeholder="e.g., PID-2025-7890"
        error={errors.propertyId}
        icon={FileText}
      />

      <FormField
        label="Property Address *"
        name="propertyAddress"
        value={formData.propertyAddress}
        placeholder="e.g., 123 Main St, Sector 15, New Delhi"
        error={errors.propertyAddress}
        icon={MapPin}
      />

      <FormField
        label="Area (sq ft) *"
        name="area"
        value={formData.area}
        placeholder="e.g., 1200"
        error={errors.area}
        icon={MapPin}
      />

      <FormField
        label="Property Title *"
        name="propertyTitle"
        value={formData.propertyTitle}
        placeholder="e.g., Residential Plot #123, Green Valley Estate"
        error={errors.propertyTitle}
        icon={FileText}
      />

      <FormField
        label="Property Location *"
        name="propertyLocation"
        value={formData.propertyLocation}
        placeholder="e.g., Sector 15, Block A, New Delhi, India"
        error={errors.propertyLocation}
        icon={MapPin}
      />

      <FormField
        label="Description (Optional)"
        name="description"
        type="textarea"
        value={formData.description}
        placeholder="Additional details about the property..."
        rows={3}
      />
    </>
  );
};