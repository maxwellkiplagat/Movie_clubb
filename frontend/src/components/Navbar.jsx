import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import '../styles.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <nav className="navbar">
      <span className="logo">CineClub</span>
      <ul className="nav-links">
        <li><Link to="/feed" className="nav-item">Feed</Link></li>
        <li><Link to="/tracker" className="nav-item">My Tracker</Link></li>
        {isAuthenticated ? (
          <li>
            <button
              className="nav-item nav-button"
              onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}
            >
              Logout
            </button>
          </li>
        ) : (
          <>
            <li><Link to="/login" className="nav-item">Login</Link></li>
            <li><Link to="/register" className="nav-item join-btn">Join Now</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
