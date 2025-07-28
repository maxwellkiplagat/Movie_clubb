// src/components/Navbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <span className="logo">CineClub</span>
      <ul>
        {isAuthenticated && (
          <li><NavLink to="/dashboard">Dashboard</NavLink></li>
        )}
        <li><NavLink to="/feed">Feed</NavLink></li>
        <li><NavLink to="/clubs">Clubs</NavLink></li>
        <li><NavLink to="/watchlist">Watchlist</NavLink></li>

        {isAuthenticated && (
          <>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}

        {!isAuthenticated && (
          <>
            <li><NavLink to="/login">Login</NavLink></li>
            <li><NavLink to="/register" className="join-btn">Join Now</NavLink></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
