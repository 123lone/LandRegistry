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
