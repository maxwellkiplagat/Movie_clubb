import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../auth/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState(''); // For client-side password mismatch
  const [apiError, setApiError] = useState(''); // For backend API errors

  const { isLoading, error: reduxError } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear all errors when component mounts or unmounts
    dispatch(clearError());
    setConfirmError('');
    setApiError('');
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Update apiError when reduxError changes
  useEffect(() => {
    if (reduxError) {
      setApiError(reduxError);
    } else {
      setApiError('');
    }
  }, [reduxError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError()); // Clear Redux errors
    setConfirmError(''); // Clear client-side errors
    setApiError(''); // Clear API errors

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    try {
      // Use .unwrap() to handle the promise rejection and catch specific backend errors
      await dispatch(registerUser({ username, email, password })).unwrap();
      // Registration successful → redirect to login page
      navigate('/login');
    } catch (err) {
      // The error message from the backend is already in `reduxError`
      // We set it to `apiError` to display it
      console.error("Registration failed:", err);
      // apiError is already set by the useEffect watching reduxError
    }
  };

  return (
    <div className="form-page">
      <div className="form-container"> {/* Added form-container div for consistent styling */}
        <h2 className="text-2xl font-bold text-orange-400 mb-4 text-center">Join the Community</h2>

        {apiError && <p className="text-red-500 text-center">{apiError}</p>}
        {confirmError && <p className="text-red-500 text-center">{confirmError}</p>}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-gray-400 text-sm font-bold mb-2">Username:</label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-400 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-400 text-sm font-bold mb-2">Password:</label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-400 text-sm font-bold mb-2">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Now'}
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline"> {/* Kept your Tailwind classes */}
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
