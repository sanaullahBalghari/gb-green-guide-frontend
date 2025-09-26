// src/hooks/usePasswordReset.js
import { useState } from 'react';
import apiServer from '../utils/apiServer';
import API_ROUTES from '../apiRoutes';

export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Clear messages
  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  // Send forgot password email
  const sendResetEmail = async (email) => {
    if (!email?.trim()) {
      setError('Please enter your email address');
      return { success: false };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return { success: false };
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await apiServer(
        'post',
        API_ROUTES.FORGOTPASSWORD,
        { email: email.trim() },
        {
          tokenRequired: false,
          showNotification: false, // We'll handle our own messages
          showErrorNotification: false
        }
      );

      setMessage('If an account with that email exists, a reset link has been sent to your email address.');
      return { success: true, data: response };

    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (uid, token, newPassword, confirmPassword) => {
    // Validation
    if (!uid || !token) {
      setError('Invalid reset link. Please request a new password reset.');
      return { success: false };
    }

    if (!newPassword?.trim()) {
      setError('Please enter a new password');
      return { success: false };
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return { success: false };
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return { success: false };
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      // Build the URL with uid and token as per backend URL pattern
      const resetUrl = `/api/accounts/reset-password/${uid}/${token}/`;

      const response = await apiServer(
        'put',
        resetUrl,
        {
          // Remove uid and token from request body since they're in the URL
          new_password: newPassword.trim(),
          confirm_password: confirmPassword.trim()
        },
        {
          tokenRequired: false,
          showNotification: false,
          showErrorNotification: false
        }
      );

      setMessage('Password reset successful! You can now login with your new password.');
      return { success: true, data: response };

    } catch (err) {
      console.error('Reset password error:', err);
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.detail || 
                      'Failed to reset password. Please try again or request a new reset link.';
      setError(errorMsg);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    message,
    error,
    sendResetEmail,
    resetPassword,
    clearMessages
  };
};