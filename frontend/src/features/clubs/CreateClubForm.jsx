import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createClub } from './clubSlice';

const CreateClubForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateClub = async (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      return setError('Please fill in all fields.');
    }

    setLoading(true);
    setError(null);

    const newClub = {
      name,
      description,
      owner_id: user?.id,
    };

    try {
      const result = await dispatch(createClub(newClub)).unwrap();
      navigate(`/clubs/${result.id}`); // go to new club page
    } catch (err) {
      setError(err.message || 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-orange-400 mb-4">Create a New Club</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleCreateClub} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-300">Club Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-300">Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md shadow-md transition duration-200"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Club'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClubForm;
