import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Watchlist = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="watchlist-page">
      {isAuthenticated ? (
        <div className="watchlist-content">
          <h2>Your Watchlist</h2>
          <p>Here’s where your saved movies and shows will appear.</p>
          {/* You can map through your saved items here later */}
        </div>
      ) : (
        <div className="watchlist-content">
          <h2>Please log in to access your watchlist</h2>
          <Link to="/login" className="login-link">Go to Login</Link>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
