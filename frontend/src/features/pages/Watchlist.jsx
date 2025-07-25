// src/features/pages/Watchlist.jsx

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToWatchlist, removeFromWatchlist, toggleWatchedStatus } from '../Watchlist/watchlistSlice.js';
import '../../styles.css';

const Watchlist = () => {
  const dispatch = useDispatch();
  const watchlist = useSelector((state) => state.watchlist.movies);

  // Local state for input form
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState('plan'); // plan or watched

  const handleAdd = (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    const newMovie = {
      id: Date.now(),
      title,
      genre,
      status,
    };

    dispatch(addToWatchlist(newMovie));

    // Clear form
    setTitle('');
    setGenre('');
    setStatus('plan');
  };

  return (
    <div className="page-container">
      <h2 className="watchlist-title">🎬 My Watchlist</h2>

      <form onSubmit={handleAdd} className="watchlist-form">
        <input
          type="text"
          placeholder="Movie title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="watchlist-input"
        />
        <input
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="watchlist-input"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="watchlist-input"
        >
          <option value="plan">Plan to Watch</option>
          <option value="watched">Watched</option>
        </select>
        <button type="submit" className="watchlist-button">
          ➕ Add Movie
        </button>
      </form>

      <ul className="watchlist-list">
        {watchlist.map((movie) => (
          <li key={movie.id} className="watchlist-item">
            <span className="watchlist-title">
              {movie.title} ({movie.genre}) - {movie.status === 'watched' ? '✅ Watched' : '📌 Plan'}
            </span>
            <div className="watchlist-actions">
              <button onClick={() => dispatch(toggleWatchedStatus(movie.id))}>
                🔁 Toggle
              </button>
              <button onClick={() => dispatch(removeFromWatchlist(movie.id))}>
                ❌ Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Watchlist;
