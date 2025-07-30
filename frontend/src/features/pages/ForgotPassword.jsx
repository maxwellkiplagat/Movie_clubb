import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../auth/authSlice'; // This thunk sends the API request
import { clearError } from '../auth/authSlice'; // Action to clear Redux error state

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  // Get loading and error states from Redux
  const { isLoading, error } = useSelector((state) => state.auth);
  const [message, setMessage] = useState(''); // State for local success message

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous success messages
    dispatch(clearError()); // Clear any previous Redux errors

    try {
      // Dispatch the forgotPassword thunk and unwrap the result to handle success/failure
      const resultAction = await dispatch(forgotPassword(email)).unwrap();
      // If successful, set a success message from the backend response or a default one
      setMessage(resultAction.message || 'Password reset email sent. Please check your inbox.');
    } catch (err) {
      
      console.error('Failed to send password reset email:', err);
      // The `error` state from Redux will already contain the message from rejectWithValue
    }
  };

  return (
    <div className="form-page"> {/* Uses global styling for consistent layout */}
      <div className="form-container"> {/* Uses global styling for consistent form appearance */}
        <h2 className="text-2xl font-bold text-orange-400 mb-4 text-center">Forgot Password?</h2>
        <p className="text-gray-300 text-sm mb-6 text-center">
          Enter your email address below and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-gray-400 text-sm font-bold mb-2">
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              placeholder="your-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Display loading, error, or success messages */}
          {isLoading && <p className="text-blue-400 text-center">Sending...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {message && <p className="text-green-500 text-center">{message}</p>}

          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
            disabled={isLoading} // Disable button while loading
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
