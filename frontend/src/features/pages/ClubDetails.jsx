// src/features/pages/ClubDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const mockClubs = [
  { id: 1, name: 'Thriller Fanatics', description: 'Dive deep into thrilling mysteries and suspense.' },
  { id: 2, name: 'Rom-Com Lovers', description: 'Celebrate romance and comedy with us.' },
  { id: 3, name: 'Sci-Fi Nerds', description: 'Explore galaxies, aliens, and future tech.' },
];

const mockPosts = [
  { id: 1, clubId: 1, movieTitle: 'Gone Girl', content: 'Intense mystery.', author: 'maxwell', date: '2025-07-17' },
  { id: 2, clubId: 1, movieTitle: 'Se7en', content: 'What’s in the box?!', author: 'filmfan', date: '2025-07-16' },
  { id: 3, clubId: 2, movieTitle: 'Notting Hill', content: 'Classic rom-com!', author: 'user12', date: '2025-07-15' },
];

function ClubDetails() {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const foundClub = mockClubs.find(c => c.id === parseInt(id));
    setClub(foundClub);
    setPosts(mockPosts.filter(p => p.clubId === parseInt(id)));
  }, [id]);

  if (!club) return <p className="center-text">Club not found.</p>;

  return (
    <div className="page-container">
      <h1>{club.name}</h1>
      <p className="club-desc">{club.description}</p>

      <div className="text-right">
        <Link to={`/clubs/${club.id}/create-post`} className="join-btn">+ Create Post</Link>
      </div>

      {posts.length === 0 ? (
        <p className="no-posts-text">No posts in this club yet.</p>
      ) : (
        <div className="feed-list">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <h2>{post.movieTitle}</h2>
              <p>{post.content}</p>
              <div className="post-meta">
                <span>By @{post.author}</span>
                <span>{post.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClubDetails;
