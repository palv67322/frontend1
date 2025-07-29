import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        if (res.data.role === 'provider') {
          const providerRes = await axios.get(`http://localhost:5000/api/provider/${res.data.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProvider(providerRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user');
        console.error('Fetch user error:', err.response?.data || err);
      }
    };
    fetchUser();
  }, []);

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photo) {
      setError('Please select an image');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      const token = localStorage.getItem('token');
      console.log(`Uploading new profile picture for ${user?.email}`);
      const res = await axios.post('http://localhost:5000/api/provider/upload-photo', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setProvider({ ...provider, photo: res.data.photo });
      setSuccess('Profile picture uploaded successfully');
      setError('');
      setPhoto(null);
      console.log(`Profile picture uploaded: ${res.data.photo}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo');
      setSuccess('');
      console.error('Photo upload error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}
      <div className="mb-4">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>
      {provider && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Provider Profile</h2>
          <p><strong>Service:</strong> {provider.service}</p>
          <p><strong>Location:</strong> {provider.location}</p>
          <p><strong>Rating:</strong> {provider.rating}</p>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Profile Picture</h3>
            {provider.photo ? (
              <img
                src={provider.photo}
                alt="Profile"
                className="w-32 h-32 object-cover rounded-full mt-2"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150';
                  console.error('Failed to load profile picture:', provider.photo);
                }}
              />
            ) : (
              <img
                src="https://via.placeholder.com/150"
                alt="Default Profile"
                className="w-32 h-32 object-cover rounded-full mt-2"
              />
            )}
            <form onSubmit={handlePhotoUpload} className="mt-4 space-y-4">
              <div>
                <label className="block mb-1">Upload New Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  className="p-2 border rounded-lg w-full"
                />
              </div>
              <button
                type="submit"
                className={`bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;