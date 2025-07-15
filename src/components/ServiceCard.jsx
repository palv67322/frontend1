import React from 'react';

const ServiceCard = ({ service, onEdit }) => {
  return (
    <div className="p-4 border rounded-lg shadow-md hover:shadow-lg transition">
      <h3 className="text-lg font-semibold">{service.name}</h3>
      <p className="text-gray-600">{service.description}</p>
      <p className="text-gray-600">Price: ₹{service.price}</p>
      <p className="text-gray-600">Duration: {service.duration}</p>
      <div className="mt-2">
        <h4 className="font-semibold">Availability:</h4>
        {service.availability.map((avail, index) => (
          <p key={index}>{avail.date}: {avail.slots.join(', ')}</p>
        ))}
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className="mt-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          Edit Service
        </button>
      )}
    </div>
  );
};

export default ServiceCard;