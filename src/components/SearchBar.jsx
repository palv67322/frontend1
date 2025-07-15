import React, { useState } from 'react';

const SearchBar = ({ onSearch, initialLocation }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(initialLocation);

  const handleSearch = () => {
    onSearch({ query, location });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-100 rounded-lg">
      <input
        type="text"
        placeholder="Search services (e.g., Plumber, Tutor)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="p-2 border rounded-lg flex-1"
      />
      <input
        type="text"
        placeholder="Enter location (e.g., Delhi)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="p-2 border rounded-lg flex-1"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;