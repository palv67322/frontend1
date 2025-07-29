import React, { useState } from 'react';
import axios from 'axios';

const AuthModal = ({ isOpen, onClose, onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOTP, setIsOTP] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [photo, setPhoto] = useState(null);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setRole('user');
    setPhoto(null);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const data = isLogin ? { email, password } : { name, email, password, role };
      console.log(`Auth attempt: ${url}`, { email, password: '***', role, name });
      const res = await axios.post(`http://localhost:5000${url}`, data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      // Upload profile picture for providers
      if (!isLogin && role === 'provider' && photo) {
        const formData = new FormData();
        formData.append('photo', photo);
        console.log(`Uploading profile picture for ${email}`);
        await axios.post('http://localhost:5000/api/provider/upload-photo', formData, {
          headers: {
            Authorization: `Bearer ${res.data.token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log(`Profile picture uploaded for ${email}`);
      }

      onAuth(res.data.user);
      resetForm();
      setTimeout(onClose, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
      setSuccess('');
      console.error('Auth error:', err.response?.data || err);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      console.log(`Sending OTP for ${email}`);
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setSuccess(res.data.message);
      setError('');
      setIsForgotPassword(false);
      setIsOTP(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      setSuccess('');
      console.error('Forgot password error:', err.response?.data || err);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      console.log(`Verifying OTP for ${email}: ${otp}`);
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      setSuccess(res.data.message);
      setError('');
      setIsOTP(false);
      setIsResetPassword(true);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
      setSuccess('');
      console.error('Verify OTP error:', err.response?.data || err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setSuccess('');
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(newPassword)) {
      setError('Password must include at least one letter and one number');
      setSuccess('');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setSuccess('');
      return;
    }
    try {
      console.log(`Resetting password for ${email}, OTP: ${otp}, newPassword: ${newPassword}`);
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, newPassword });
      setSuccess(res.data.message);
      setError('');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setTimeout(() => {
        setIsResetPassword(false);
        setIsLogin(true);
        resetForm();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
      setSuccess('');
      console.error('Reset password error:', err.response?.data || err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isForgotPassword ? 'Forgot Password' : isOTP ? 'Verify OTP' : isResetPassword ? 'Reset Password' : isLogin ? 'Login' : 'Register'}
        </h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 border rounded-lg w-full"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            >
              Send OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                resetForm();
              }}
              className="text-blue-600 hover:underline ml-4"
            >
              Back to {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        ) : isOTP ? (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 border rounded-lg w-full"
                required
                disabled
              />
            </div>
            <div>
              <label className="block mb-1">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="p-2 border rounded-lg w-full"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            >
              Verify OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOTP(false);
                setIsForgotPassword(true);
                setOtp('');
                setError('');
                setSuccess('');
              }}
              className="text-blue-600 hover:underline ml-4"
            >
              Back to Forgot Password
            </button>
          </form>
        ) : isResetPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 border rounded-lg w-full"
                required
                disabled
              />
            </div>
            <div>
              <label className="block mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-2 border rounded-lg w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="p-2 border rounded-lg w-full"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            >
              Reset Password
            </button>
            <button
              type="button"
              onClick={() => {
                setIsResetPassword(false);
                setIsLogin(true);
                resetForm();
              }}
              className="text-blue-600 hover:underline ml-4"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-2 border rounded-lg w-full"
                  required
                />
              </div>
            )}
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 border rounded-lg w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 border rounded-lg w-full"
                required
              />
            </div>
            {!isLogin && (
              <>
                <div>
                  <label className="block mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="p-2 border rounded-lg w-full"
                  >
                    <option value="user">User</option>
                    <option value="provider">Provider</option>
                  </select>
                </div>
                {role === 'provider' && (
                  <div>
                    <label className="block mb-1">Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhoto(e.target.files[0])}
                      className="p-2 border rounded-lg w-full"
                    />
                  </div>
                )}
              </>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline ml-4"
            >
              Switch to {isLogin ? 'Register' : 'Login'}
            </button>
            {isLogin && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  resetForm();
                }}
                className="text-blue-600 hover:underline ml-4"
              >
                Forgot Password?
              </button>
            )}
          </form>
        )}
        <button
          type="button"
          onClick={() => {
            onClose();
            resetForm();
          }}
          className="mt-4 bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AuthModal;