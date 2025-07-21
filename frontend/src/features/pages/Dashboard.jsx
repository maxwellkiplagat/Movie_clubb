// src/features/pages/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const mockPosts = [
  {
    id: 1,
    movieTitle: 'Inception',
    content: 'Mind-blowing plot!',
    clubName: 'Sci-Fi Nerds',
    date: '2025-07-15',
  },
  {
    id: 2,
    movieTitle: 'Titanic',
    content: 'So emotional.',
    clubName: 'Rom-Com Lovers',
    date: '2025-07-14',
  },
];

const mockJoinedClubs = [
  {
    id: 3,
    name: 'Sci-Fi Nerds',
    description: 'Explore galaxies, aliens, and future tech.',
  },
  {
    id: 5,
    name: 'Rom-Com Lovers',
    description: 'Celebrate romance and comedy with us.',
  },
];

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {
    username: 'Unknown',
    email: 'not set',
    bio: '',
  };

  return (
    <div className="dashboard-container">
      {/* 🎬 Welcome Box */}
      <div className="feed-welcome-box">
        <h1 className="text-3xl font-bold mb-3 text-[#ff5733]">🎬 Welcome, {user.username}!</h1>
        <p className="text-gray-300">Manage your clubs, posts, and more below.</p>

        <div className="user-info-box mt-6">
          <h2 className="text-lg font-semibold mb-2 text-white">👤 Profile Info</h2>
          <p className="text-gray-300"><strong>Username:</strong> {user.username}</p>
          <p className="text-gray-300"><strong>Email:</strong> {user.email}</p>
          {user.bio && <p className="text-gray-300"><strong>Bio:</strong> {user.bio}</p>}
          <Link to="/profile" className="join-btn mt-4 inline-block">Edit Profile</Link>
        </div>
      </div>

      {/* 📝 My Posts */}
      <div className="section">
        <h2 className="section-title">📝 My Posts</h2>
        {mockPosts.length === 0 ? (
          <p className="text-gray-400">You haven’t created any posts yet.</p>
        ) : (
          <div className="feed-list">
            {mockPosts.map((post) => (
              <div key={post.id} className="post-card">
                <h2 className="text-xl font-semibold text-[#ff5733]">{post.movieTitle}</h2>
                <p className="text-gray-200 mt-2">{post.content}</p>
                <div className="post-meta mt-4">
                  <span>Club: {post.clubName}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🎥 My Clubs */}
      <div className="section">
        <h2 className="section-title">🎥 My Clubs</h2>
        {mockJoinedClubs.length === 0 ? (
          <p className="text-gray-400">You haven't joined any clubs yet.</p>
        ) : (
          <div className="club-grid mt-4">
            {mockJoinedClubs.map((club) => (
              <div key={club.id} className="club-card joined">
                <h3 className="club-title">{club.name}</h3>
                <p className="club-desc">{club.description}</p>
                <Link to={`/clubs/${club.id}`} className="join-btn mt-3 inline-block">Go to Club</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
