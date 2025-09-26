// src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Shield,
  ArrowLeft
} from 'lucide-react';
import { usePasswordReset } from '../../hooks/usePasswordReset';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { loading, message, error, resetPassword, clearMessages } = usePasswordReset();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [resetSuccess, setResetSuccess] = useState(false);

  // Clear messages when component mounts
  useEffect(() => {
    clearMessages();
    
    // Validate that we have uid and token
    if (!uid || !token) {
      navigate('/forgot-password');
    }
  }, [uid, token, navigate, clearMessages]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when user types
    clearMessages();
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await resetPassword(
      uid, 
      token, 
      formData.newPassword, 
      formData.confirmPassword
    );
    
    if (result.success) {
      setResetSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return null;
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 2) return { level: 'weak', color: 'red' };
    if (score < 4) return { level: 'medium', color: 'yellow' };
    return { level: 'strong', color: 'green' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successful!</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700">{message}</p>
            </div>
            
            <p className="text-gray-600">
              Redirecting you to login page in 3 seconds...
            </p>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Go to Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPasswords.newPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                  error
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-emerald-500'
                }`}
                placeholder="Enter your new password"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('newPassword')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.newPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.newPassword && passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Password strength:</span>
                  <span className={`text-xs font-medium capitalize text-${passwordStrength.color}-600`}>
                    {passwordStrength.level}
                  </span>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                    style={{
                      width: passwordStrength.level === 'weak' ? '33%' : 
                             passwordStrength.level === 'medium' ? '66%' : '100%'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                  error || (formData.confirmPassword && formData.newPassword !== formData.confirmPassword)
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-emerald-500'
                }`}
                placeholder="Confirm your new password"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.confirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            
            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="mt-1">
                {formData.newPassword === formData.confirmPassword ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Passwords match</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">Passwords do not match</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Password Requirements */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 mb-2 font-medium">Password requirements:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li className="flex items-center gap-1">
                <span className={formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}>•</span>
                At least 8 characters long
              </li>
              <li className="flex items-center gap-1">
                <span className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>•</span>
                Contains uppercase letter
              </li>
              <li className="flex items-center gap-1">
                <span className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>•</span>
                Contains lowercase letter
              </li>
              <li className="flex items-center gap-1">
                <span className={/\d/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>•</span>
                Contains a number
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              loading || 
              !formData.newPassword || 
              !formData.confirmPassword || 
              formData.newPassword !== formData.confirmPassword ||
              formData.newPassword.length < 8
            }
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Resetting Password...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Reset Password
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;