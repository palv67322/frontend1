import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReviewSection = ({ providerId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/providers/${providerId}`);
        setReviews(res.data.reviews);
      } catch (err) {
        console.error('Fetch reviews error:', err);
      }
    };
    fetchReviews();
  }, [providerId]);

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/providers/${providerId}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReviews([...reviews, res.data]);
      setComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Reviews</h3>
      <div className="mt-4">
        <label className="block mb-2">Your Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="p-2 border rounded-lg"
        >
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
          ))}
        </select>
        <label className="block mb-2 mt-4">Your Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="p-2 border rounded-lg w-full"
          rows="4"
        ></textarea>
        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
          disabled={!comment}
        >
          Submit Review
        </button>
      </div>
      <div className="mt-6">
        {reviews.map((review) => (
          <div key={review._id} className="p-4 border rounded-lg mb-4">
            <p className="text-yellow-500">{'★'.repeat(review.rating)}</p>
            <p>{review.comment}</p>
            <p className="text-gray-500 text-sm">By {review.user.name} on {new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;