import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const UserProfile = ({ user, setUser }) => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setBookings(res.data);
      } catch (err) {
        console.error('Fetch bookings error:', err);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link to="/" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
          Home
        </Link>
      </div>
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Your Bookings</h3>
        {bookings.length > 0 ? (
          <ul className="space-y-2">
            {bookings.map((booking) => (
              <li key={booking._id} className="p-4 bg-gray-100 rounded-lg">
                <p><strong>Provider:</strong> {booking.provider.name}</p>
                <p><strong>Service:</strong> {booking.service.name}</p>
                <p><strong>Date:</strong> {booking.date}</p>
                <p><strong>Slot:</strong> {booking.slot}</p>
                <p><strong>Amount:</strong> ₹{booking.service.price}</p>
                <p><strong>Status:</strong> {booking.paymentStatus}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No bookings yet</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;