// src/features/pages/Feed.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../styles.css';

const Feed = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <div className="page-container">
      <div className="feed-welcome-box">
        <h1 className="feed-title">Welcome to CineClub</h1>
        <p className="feed-subtitle">
          Connect with fellow movie and TV series enthusiasts
        </p>

        {!isAuthenticated ? (
          <div className="feed-buttons">
            <Link to="/register" className="join-btn">
              Join the Community
            </Link>
            <Link to="/login" className="login-btn-box">
              Sign In
            </Link>
          </div>
        ) : (
          <p className="text-green-400 mt-4 text-center">
            👋 Welcome back{user?.username ? `, @${user.username}` : ''}!
          </p>
        )}
      </div>

      <div className="text-center mt-8 text-gray-400">
        <p>Explore clubs or join one to see and create posts!</p>
      </div>
    </div>
  );
};

export default Feed;
