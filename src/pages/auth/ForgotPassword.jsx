// src/pages/auth/ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Lock
} from 'lucide-react';
import { usePasswordReset } from '../../hooks/usePasswordReset';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { loading, message, error, sendResetEmail, clearMessages } = usePasswordReset();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Clear messages when component mounts or email changes
  useEffect(() => {
    clearMessages();
  }, [email, clearMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await sendResetEmail(email);
    if (result.success) {
      setSubmitted(true);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = () => {
    setSubmitted(false);
    clearMessages();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            {submitted 
              ? "Check your email for reset instructions"
              : "No worries! We'll send you reset instructions"
            }
          </p>
        </div>

        {!submitted ? (
          // Email Form
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    error
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-emerald-500'
                  }`}
                  placeholder="Enter your email address"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        ) : (
          // Success State
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Email Sent!</h3>
              <p className="text-gray-600 text-sm">
                We've sent password reset instructions to:
              </p>
              <p className="font-medium text-emerald-600">{email}</p>
            </div>

            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700 text-sm">{message}</p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <button
                onClick={handleResendEmail}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium hover:underline"
              >
                Resend Email
              </button>
            </div>
          </div>
        )}

        {/* Back to Login */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleBackToLogin}
            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need more help?{' '}
            <Link to="/contact" className="text-emerald-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;