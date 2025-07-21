// src/features/pages/EditProfile.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem('user')) || {
    username: '',
    email: '',
  };

  const [formData, setFormData] = useState(storedUser);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('user', JSON.stringify(formData));
    alert('Profile updated!');
    navigate('/dashboard');
  };

  return (
    <div className="form-page">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2>Edit Profile</h2>

        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;
