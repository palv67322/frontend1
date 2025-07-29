import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ReviewForm = ({ providerId, bookingId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5');
      return;
    }
    try {
      const res = await axios.post(
        'https://backend1-rtt3.onrender.com/api/reviews',
        { providerId, bookingId, rating, comment },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess('Review submitted successfully');
      setRating(0);
      setComment('');
      onReviewSubmitted();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
      console.error('Submit review error:', err);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Submit a Review</h3>
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Rating (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="p-2 border rounded-lg w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="p-2 border rounded-lg w-full"
            rows="4"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

const ProviderProfile = ({ provider, onBack, onBook }) => {
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [currentProvider, setCurrentProvider] = useState(provider);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`https://backend1-rtt3.onrender.com/api/reviews/provider/${provider._id}`);
        setReviews(res.data);
      } catch (err) {
        console.error('Fetch reviews error:', err);
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await axios.get('https://backend1-rtt3.onrender.com/api/bookings/my-bookings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setBookings(res.data.filter(b => b.provider._id === provider._id && b.paymentStatus === 'completed'));
      } catch (err) {
        console.error('Fetch bookings error:', err);
      }
    };

    fetchReviews();
    fetchBookings();
    setCurrentProvider(provider); // Update local state when prop changes
  }, [provider]);

  const handleReviewSubmitted = async () => {
    try {
      const [reviewsRes, providerRes] = await Promise.all([
        axios.get(`https://backend1-rtt3.onrender.com/api/reviews/provider/${provider._id}`),
        axios.get(`https://backend1-rtt3.onrender.com/api/providers/${provider._id}`)
      ]);
      setReviews(reviewsRes.data);
      setCurrentProvider(providerRes.data); // Update provider with new rating
    } catch (err) {
      console.error('Error refreshing reviews or provider:', err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <button
        onClick={onBack}
        className="text-blue-600 hover:underline mb-4"
      >
        Back to Providers
      </button>
      <div className="flex items-center">
        {currentProvider.photo && (
          <img
            src={currentProvider.photo}
            alt={currentProvider.name}
            className="w-24 h-24 rounded-full mr-4"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold">{currentProvider.name}</h2>
          <p className="text-gray-600">{currentProvider.service}</p>
          <p className="text-gray-600">{currentProvider.location}</p>
          <p className="text-yellow-500">Rating: {currentProvider.rating.toFixed(1)} / 5</p>
        </div>
      </div>
      <button
        onClick={onBook}
        className="mt-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
      >
        Book Now
      </button>
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Services</h3>
        <ul className="list-disc pl-5">
          {currentProvider.services.map((service) => (
            <li key={service._id}>
              {service.name} - ₹{service.price} ({service.duration})
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Reviews</h3>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="border-t pt-2 mt-2">
              <p className="text-yellow-500">Rating: {review.rating} / 5</p>
              <p>{review.comment}</p>
              <p className="text-gray-500 text-sm">By {review.user.name} on {new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet</p>
        )}
      </div>
      {bookings.length > 0 && (
        <ReviewForm
          providerId={currentProvider._id}
          bookingId={bookings[0]._id}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default ProviderProfile;