import React from 'react';

const ProviderCard = ({ provider, onSelect, onBook }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {provider.photo && (
        <img
          src={`http://localhost:5000${provider.photo}`}
          alt={provider.name}
          className="w-16 h-16 rounded-full mx-auto mb-2"
        />
      )}
      <h3 className="text-lg font-semibold">{provider.name}</h3>
      <p className="text-gray-600">{provider.service}</p>
      <p className="text-gray-600">{provider.location}</p>
      <p className="text-yellow-500">Rating: {provider.rating.toFixed(1)} / 5</p>
      <div className="flex gap-2 mt-2">
        <button
          onClick={onSelect}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          View Profile
        </button>
        <button
          onClick={onBook}
          className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default ProviderCard;