import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function CreatePostInClub() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movieTitle, setMovieTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      movieTitle,
      content,
      clubId: parseInt(id),
      author: 'current_user',
      date: new Date().toISOString().split('T')[0],
    });
    alert('Post submitted (mock only).');
    navigate(`/clubs/${id}`);
  };

  return (
    <div className="form-page">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2>Create Post in Club #{id}</h2>

        <label>Movie Title</label>
        <input
          type="text"
          value={movieTitle}
          onChange={(e) => setMovieTitle(e.target.value)}
          required
        />

        <label>Your Thoughts</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <button type="submit">Submit Post</button>
      </form>
    </div>
  );
}

export default CreatePostInClub;
