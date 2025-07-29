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
  const [confirmError, setConfirmError] = useState('');

  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    setConfirmError('');

    const resultAction = await dispatch(
      registerUser({ username, email, password })
    );

    if (registerUser.fulfilled.match(resultAction)) {
      // Registration successful → redirect to login page
      navigate('/login');
    }
  };

  return (
    <div className="form-page">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2>Join the Community</h2>

        {error && <p className="error">{error}</p>}
        {confirmError && <p className="error">{confirmError}</p>}

        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Confirm Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Joining...' : 'Join Now'}
        </button>

        <p className="text-sm text-gray-300 text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="sign-in-link">
          Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
