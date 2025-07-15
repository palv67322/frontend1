import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingModal = ({ provider, isOpen, onClose, onBook }) => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');

  useEffect(() => {
    if (provider) {
      setServices(provider.services || []);
      setSelectedService(null);
      setSelectedDate('');
      setSelectedSlot('');
      setBookingStatus('');
    }
  }, [provider]);

  const handlePaymentCancel = () => {
    setBookingStatus('Payment canceled, please try again.');
    setTimeout(() => {
      setBookingStatus('');
    }, 3000); // Clear message after 3 seconds
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedSlot) {
      alert('Please select a service, date, and slot');
      return;
    }

    try {
      setBookingStatus('Creating booking...');
      const res = await axios.post(
        'http://localhost:5000/api/bookings',
        {
          providerId: provider._id,
          serviceId: selectedService._id,
          date: selectedDate,
          slot: selectedSlot,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setBookingStatus('Booking created, proceeding to payment...');
      onBook(
        {
          providerId: provider._id,
          service: selectedService,
          date: selectedDate,
          slot: selectedSlot,
          bookingId: res.data._id,
        },
        handlePaymentCancel
      );
    } catch (err) {
      console.error('Booking error:', err);
      setBookingStatus('');
      alert(err.response?.data?.message || 'Failed to create booking');
    }
  };

  if (!isOpen || !provider) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Book with {provider.name}</h2>
        {bookingStatus && (
          <p className={`mb-4 ${bookingStatus.includes('canceled') ? 'text-red-600' : 'text-blue-600'}`}>
            {bookingStatus}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Select Service</label>
            <select
              value={selectedService?._id || ''}
              onChange={(e) => {
                const service = services.find(s => s._id === e.target.value);
                setSelectedService(service);
                setSelectedDate('');
                setSelectedSlot('');
              }}
              className="p-2 border rounded-lg w-full"
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} - ₹{service.price} ({service.duration})
                </option>
              ))}
            </select>
          </div>
          {selectedService && (
            <div>
              <label className="block mb-1">Select Date</label>
              <select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot('');
                }}
                className="p-2 border rounded-lg w-full"
              >
                <option value="">Select a date</option>
                {selectedService.availability.map((avail) => (
                  <option key={avail.date} value={avail.date}>
                    {avail.date}
                  </option>
                ))}
              </select>
            </div>
          )}
          {selectedDate && (
            <div>
              <label className="block mb-1">Select Slot</label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="p-2 border rounded-lg w-full"
              >
                <option value="">Select a slot</option>
                {selectedService?.availability
                  .find((a) => a.date === selectedDate)
                  ?.slots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
              </select>
            </div>
          )}
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
              disabled={bookingStatus !== '' && !bookingStatus.includes('canceled')}
            >
              Proceed to Payment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700"
              disabled={bookingStatus !== '' && !bookingStatus.includes('canceled')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;