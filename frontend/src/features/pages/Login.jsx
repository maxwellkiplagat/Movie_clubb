import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../auth/authSlice';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/feed');
    }
  };

  return (
    <div>
      <nav>
        <span className="logo">CineClub</span>
        <ul>
          <li><a href="/feed">Feed</a></li>
          <li><a href="/tracker">My Tracker</a></li>
          <li><a href="/watchlist">Watchlist</a></li>
          <li><a href="/login">Login</a></li>
          <li><button className="join-btn" onClick={() => navigate('/register')}>Join Now</button></li>
        </ul>
      </nav>
      <div className="form-container">
        <h2>Sign In</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="link">
          Don't have an account? <Link to="/register">Join the Community</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;