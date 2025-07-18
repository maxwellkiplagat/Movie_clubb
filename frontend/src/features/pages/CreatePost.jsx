// src/components/CreatePost.jsx
import React, { useState } from 'react';

const CreatePost = ({ onAddPost }) => {
  const [form, setForm] = useState({
    user: '',
    title: '',
    genre: '',
    poster: '',
    comment: '',
    rating: 1,
    club: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.user || !form.comment) return;
    onAddPost(form);
    setForm({ user: '', title: '', genre: '', poster: '', comment: '', rating: 1, club: '' });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h2>Create a Post</h2>

      <input name="user" value={form.user} onChange={handleChange} placeholder="Your Username" />
      <input name="title" value={form.title} onChange={handleChange} placeholder="Movie Title" />
      <input name="genre" value={form.genre} onChange={handleChange} placeholder="Genre" />
      <input name="poster" value={form.poster} onChange={handleChange} placeholder="Poster URL" />
      <textarea name="comment" value={form.comment} onChange={handleChange} placeholder="Your thoughts..." />
      <input type="number" name="rating" value={form.rating} onChange={handleChange} min="1" max="5" placeholder="Rating" />
      <input name="club" value={form.club} onChange={handleChange} placeholder="Club Name" />

      <button type="submit">Post</button>
    </form>
  );
};

export default CreatePost;