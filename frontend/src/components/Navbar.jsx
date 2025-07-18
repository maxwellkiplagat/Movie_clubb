import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <nav className="navbar">
      <span className="logo">CineClub</span>
      <ul>
        <li><Link to="/feed">Feed</Link></li>
        <li><Link to="/tracker">My Tracker</Link></li>
        {isAuthenticated ? (
          <li>
            <button onClick={() => { dispatch(logout()); navigate('/login'); }}>
              Logout
            </button>
          </li>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="join-btn">Join Now</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
