import React, { useState } from 'react';
import axios from 'axios';

const AuthModal = ({ isOpen, onClose, onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOTP, setIsOTP] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const data = isLogin ? { email, password } : { name, email, password, role };
      const res = await axios.post(`https://backend1-rtt3.onrender.com${url}`, data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      onAuth(res.data.user);
      setError('');
      setSuccess(isLogin ? 'Logged in successfully' : 'Registered successfully');
      setTimeout(onClose, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
      setSuccess('');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://backend1-rtt3.onrender.com/api/auth/forgot-password', { email });
      setSuccess(res.data.message);
      setError('');
      setIsForgotPassword(false);
      setIsOTP(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      setSuccess('');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://backend1-rtt3.onrender.com/api/auth/verify-otp', { email, otp });
      setSuccess(res.data.message);
      setError('');
      setIsOTP(false);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
      setSuccess('');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://backend1-rtt3.onrender.com/api/auth/reset-password', { email, otp, newPassword });
      setSuccess(res.data.message);
      setError('');
      setTimeout(() => {
        setIsLogin(true);
        setEmail('');
        setOtp('');
        setNewPassword('');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
      setSuccess('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isForgotPassword ? 'Forgot Password' : isOTP ? 'Verify OTP' : isLogin ? 'Login' : 'Register'}
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
              onClick={() => setIsForgotPassword(false)}
              className="text-blue-600 hover:underline ml-4"
            >
              Back to {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        ) : isOTP ? (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
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
          </form>
        ) : success && !isLogin ? null : (
          <form onSubmit={success ? handleResetPassword : handleAuth} className="space-y-4">
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
              <label className="block mb-1">{success ? 'New Password' : 'Password'}</label>
              <input
                type="password"
                value={success ? newPassword : password}
                onChange={(e) => (success ? setNewPassword(e.target.value) : setPassword(e.target.value))}
                className="p-2 border rounded-lg w-full"
                required
              />
            </div>
            {!isLogin && !success && (
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
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            >
              {success ? 'Reset Password' : isLogin ? 'Login' : 'Register'}
            </button>
            {!success && (
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:underline ml-4"
              >
                Switch to {isLogin ? 'Register' : 'Login'}
              </button>
            )}
            {!success && isLogin && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-blue-600 hover:underline ml-4"
              >
                Forgot Password?
              </button>
            )}
          </form>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AuthModal;