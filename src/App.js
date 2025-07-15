import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import ProviderCard from './components/ProviderCard';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import ProviderProfile from './components/ProviderProfile';
import ProviderDashboard from './components/ProviderDashboard';
import UserProfile from './components/UserProfile';
import { useRazorpay } from 'react-razorpay';

const App = () => {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { Razorpay } = useRazorpay();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await axios.get(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            setLocation(res.data.city || 'Delhi');
          } catch (err) {
            console.error('Geolocation error:', err);
            setLocation('Delhi');
          }
        },
        () => setLocation('Delhi')
      );
    } else {
      setLocation('Delhi');
    }
  }, []);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await axios.get(`https://backend1-rtt3.onrender.com/api/providers?location=${location}`);
        console.log('Fetched providers:', res.data);
        setProviders(res.data);
      } catch (err) {
        console.error('Fetch providers error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (location) fetchProviders();
  }, [location]);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      if (token) {
        try {
          const res = await axios.get('https://backend1-rtt3.onrender.com/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        } catch (err) {
          if (err.response?.status === 401 && refreshToken) {
            try {
              const refreshRes = await axios.post('https://backend1-rtt3.onrender.com/api/auth/refresh-token', {
                refreshToken,
              });
              localStorage.setItem('token', refreshRes.data.token);
              localStorage.setItem('refreshToken', refreshRes.data.refreshToken);
              const res = await axios.get('https://backend1-rtt3.onrender.com/api/auth/me', {
                headers: { Authorization: `Bearer ${refreshRes.data.token}` },
              });
              setUser(res.data);
            } catch (refreshErr) {
              console.error('Refresh token error:', refreshErr.response?.data?.message || refreshErr.message);
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
            }
          } else {
            console.error('Token validation error:', err.response?.data?.message || err.message);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
        }
      }
      setIsLoading(false);
    };
    validateToken();
  }, []);

  const handleSearch = async ({ query, location }) => {
    try {
      const res = await axios.get(
        `https://backend1-rtt3.onrender.com/api/providers?query=${query}&location=${location}`
      );
      console.log('Search results:', res.data);
      setProviders(res.data);
      setLocation(location);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleBooking = async (bookingData, onPaymentCancel) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      const orderRes = await axios.post(
        'https://backend1-rtt3.onrender.com/api/payments/create-order',
        { amount: bookingData.service.price, bookingId: bookingData.bookingId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        order_id: orderRes.data.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              'https://backend1-rtt3.onrender.com/api/payments/verify-payment',
              {
                orderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingId: bookingData.bookingId,
              },
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            alert(verifyRes.data.message);
            setShowBookingModal(false);
            // Refresh providers to update ratings
            const res = await axios.get(`https://backend1-rtt3.onrender.com/api/providers?location=${location}`);
            setProviders(res.data);
          } catch (err) {
            alert(err.response?.data?.message || 'Payment verification failed');
            onPaymentCancel();
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => {
            console.log('Razorpay modal closed without payment');
            onPaymentCancel();
          },
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.response?.data?.message || 'Booking failed');
      onPaymentCancel();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-800 text-white p-6 text-center">
          <h1 className="text-3xl font-bold">Local Service Finder</h1>
          <p className="mt-2">Find trusted service providers in your area</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
              Home
            </Link>
            {user ? (
              <>
                <span>Welcome, {user.name}</span>
                <Link
                  to={user.role === 'provider' ? '/provider/dashboard' : '/profile'}
                  className="text-blue-300 hover:underline"
                >
                  {user.role === 'provider' ? 'Dashboard' : 'Profile'}
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    setUser(null);
                  }}
                  className="bg-red-600 text-white p-2 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-green-600 text-white p-2 rounded-lg"
              >
                Login / Register
              </button>
            )}
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <SearchBar onSearch={handleSearch} initialLocation={location} />
                  {selectedProvider ? (
                    <ProviderProfile
                      provider={selectedProvider}
                      onBack={() => setSelectedProvider(null)}
                      onBook={() => setShowBookingModal(true)}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                      {providers.length > 0 ? (
                        providers.map((provider) => (
                          <ProviderCard
                            key={provider._id}
                            provider={provider}
                            onSelect={() => setSelectedProvider(provider)}
                            onBook={() => {
                              setSelectedProvider(provider);
                              setShowBookingModal(true);
                            }}
                          />
                        ))
                      ) : (
                        <p>No providers found</p>
                      )}
                    </div>
                  )}
                </>
              }
            />
            <Route
              path="/provider/dashboard"
              element={user && user.role === 'provider' ? <ProviderDashboard /> : <Navigate to="/" />}
            />
            <Route
              path="/profile"
              element={user ? <UserProfile user={user} setUser={setUser} /> : <Navigate to="/" />}
            />
          </Routes>
          <BookingModal
            provider={selectedProvider}
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            onBook={handleBooking}
          />
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onAuth={(userData) => {
              setUser(userData);
              setShowAuthModal(false);
            }}
          />
        </main>
        <footer className="bg-gray-800 text-white p-4 text-center">
          <p>© 2025 Local Service Finder. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;