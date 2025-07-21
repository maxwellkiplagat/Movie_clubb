// src/components/PrivateRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom'; // Removed Navigate

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return (
      <div className="protected-wrapper">
        <div className="protected-box">
          <h2>Please log in to access this page</h2>
          <Link to="/login" className="login-btn">Login</Link>
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
