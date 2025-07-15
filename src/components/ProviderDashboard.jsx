import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProviderDashboard = () => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    availability: [{ date: '', slots: [''] }],
  });
  const [editServiceId, setEditServiceId] = useState(null);
  const [profile, setProfile] = useState({ service: '', location: '', photo: '' });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/services/my-services', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setServices(res.data);
      } catch (err) {
        console.error('Fetch services error:', err);
      }
    };
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/providers/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProfile({ service: res.data.service, location: res.data.location, photo: res.data.photo });
      } catch (err) {
        console.error('Fetch profile error:', err);
      }
    };
    fetchServices();
    fetchProfile();
  }, []);

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editServiceId) {
        const res = await axios.put(`http://localhost:5000/api/services/${editServiceId}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setServices(services.map(s => (s._id === editServiceId ? res.data : s)));
        setEditServiceId(null);
      } else {
        const res = await axios.post('http://localhost:5000/api/services', formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setServices([...services, res.data]);
      }
      setFormData({ name: '', description: '', price: '', duration: '', availability: [{ date: '', slots: [''] }] });
    } catch (err) {
      console.error('Service operation error:', err);
      alert(err.response?.data?.message || 'Failed to save service');
    }
  };

  const handleEditService = (service) => {
    setEditServiceId(service._id);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      availability: service.availability,
    });
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setServices(services.filter(s => s._id !== serviceId));
    } catch (err) {
      console.error('Delete service error:', err);
      alert(err.response?.data?.message || 'Failed to delete service');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('http://localhost:5000/api/providers/profile', profile, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setProfile(res.data);
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Update profile error:', err);
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await axios.post('http://localhost:5000/api/providers/upload-photo', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfile({ ...profile, photo: res.data.photo });
      alert('Photo uploaded successfully');
    } catch (err) {
      console.error('Photo upload error:', err);
      alert(err.response?.data?.message || 'Failed to upload photo');
    }
  };

  const addAvailability = () => {
    setFormData({
      ...formData,
      availability: [...formData.availability, { date: '', slots: [''] }],
    });
  };

  const updateAvailability = (index, field, value) => {
    const newAvailability = [...formData.availability];
    if (field === 'date') {
      newAvailability[index].date = value;
    } else if (field === 'slot') {
      newAvailability[index].slots = value.split(',').map(s => s.trim());
    }
    setFormData({ ...formData, availability: newAvailability });
  };

  const addSlot = (index) => {
    const newAvailability = [...formData.availability];
    newAvailability[index].slots.push('');
    setFormData({ ...formData, availability: newAvailability });
  };

  const updateSlot = (availIndex, slotIndex, value) => {
    const newAvailability = [...formData.availability];
    newAvailability[availIndex].slots[slotIndex] = value;
    setFormData({ ...formData, availability: newAvailability });
  };

  const removeAvailability = (index) => {
    setFormData({
      ...formData,
      availability: formData.availability.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link to="/" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
          Home
        </Link>
      </div>
      <h2 className="text-2xl font-bold mb-4">Provider Dashboard</h2>

      {/* Profile Update */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Update Profile</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block mb-1">Service Type</label>
            <input
              type="text"
              value={profile.service}
              onChange={(e) => setProfile({ ...profile, service: e.target.value })}
              className="p-2 border rounded-lg w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Location</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="p-2 border rounded-lg w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Profile Picture</label>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="mb-2" />
            {profile.photo && <img src={profile.photo} alt="Profile" className="w-32 h-32 object-cover rounded-full" />}
          </div>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
            Update Profile
          </button>
        </form>
      </div>

      {/* Add/Edit Service */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">{editServiceId ? 'Edit Service' : 'Add New Service'}</h3>
        <form onSubmit={handleServiceSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Service Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="p-2 border rounded-lg w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="p-2 border rounded-lg w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Price (₹)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="p-2 border rounded-lg w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Duration</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="p-2 border rounded-lg w-full"
            />
          </div>
          <div>
            <h4 className="font-medium mb-2">Availability</h4>
            {formData.availability.map((avail, index) => (
              <div key={index} className="mb-4 p-4 border rounded-lg">
                <div>
                  <label className="block mb-1">Date</label>
                  <input
                    type="date"
                    value={avail.date}
                    onChange={(e) => updateAvailability(index, 'date', e.target.value)}
                    className="p-2 border rounded-lg w-full"
                  />
                </div>
                <div className="mt-2">
                  <label className="block mb-1">Time Slots</label>
                  {avail.slots.map((slot, slotIndex) => (
                    <input
                      key={slotIndex}
                      type="text"
                      value={slot}
                      onChange={(e) => updateSlot(index, slotIndex, e.target.value)}
                      placeholder="e.g., 10:00"
                      className="p-2 border rounded-lg w-full mb-2"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => addSlot(index)}
                    className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700"
                  >
                    Add Slot
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeAvailability(index)}
                  className="mt-2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                >
                  Remove Availability
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAvailability}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            >
              Add Availability
            </button>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700">
              {editServiceId ? 'Update Service' : 'Add Service'}
            </button>
            {editServiceId && (
              <button
                type="button"
                onClick={() => {
                  setEditServiceId(null);
                  setFormData({ name: '', description: '', price: '', duration: '', availability: [{ date: '', slots: [''] }] });
                }}
                className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Current Services */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Your Services</h3>
        {services.length > 0 ? (
          <ul className="space-y-2">
            {services.map((service) => (
              <li key={service._id} className="p-4 bg-gray-100 rounded-lg">
                <p><strong>{service.name}</strong> - ₹{service.price} ({service.duration})</p>
                <p>{service.description}</p>
                <p><strong>Availability:</strong></p>
                <ul className="list-disc pl-5">
                  {service.availability.map((avail, index) => (
                    <li key={index}>
                      {avail.date}: {avail.slots.join(', ')}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => handleEditService(service)}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No services added yet</p>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;