import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; 
import {
  fetchClubPosts,
  clearClubError,
  clearCurrentClubPosts, 
} from '../clubs/clubSlice'; 

// PostCard component to display individual posts
const PostCard = ({ post }) => {
  return (
    <div className="post-card bg-gray-800 rounded-lg p-4 shadow-md mb-4">
      <h2 className="text-xl font-bold text-blue-400 mb-2">{post.movie_title}</h2>
      <p className="text-gray-300 mb-3">{post.content}</p>
      <div className="post-meta text-sm text-gray-400 flex justify-between items-center">
        <span>By @{post.author_username || 'Unknown'}</span> {/* Use author_username from backend */}
        <span>{new Date(post.created_at).toLocaleDateString()}</span> {/* Format date */}
      </div>
    </div>
  );
};

function ClubDetails() {
  const { id } = useParams(); // Get club ID from URL
  const dispatch = useDispatch(); 

  // Redux state selectors
  const { allClubs, currentClubPosts, isLoading, error } = useSelector((state) => state.clubs);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const club = allClubs.find(c => c.id === parseInt(id));

  // Effect to fetch posts for this specific club
  useEffect(() => {
    if (id) {
      dispatch(clearClubError()); 
      dispatch(fetchClubPosts(parseInt(id))); 
    }
    return () => {
      dispatch(clearCurrentClubPosts());
    };
  }, [id, dispatch]); 

  if (isLoading && !club && currentClubPosts.length === 0) {
    return <p className="text-blue-400 text-center mt-8">Loading club details and posts...</p>;
  }

  if (error) {
    return <p className="error text-red-500 text-center mt-8">Error: {error}</p>;
  }

  if (!club) {
    return <p className="text-gray-400 text-center mt-8">Club not found or not loaded.</p>;
  }

  return (
    <div className="page-container p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold text-orange-400 mb-2">{club.name}</h1>
      <p className="club-desc text-gray-300 text-lg mb-4">{club.description}</p>

      {isAuthenticated && ( // Only show create post button if authenticated
        <div className="text-right mb-6">
          <Link
            to={`/clubs/${club.id}/create-post`}
            className="
              bg-blue-600 hover:bg-blue-700
              text-white font-bold
              py-2 px-4 rounded-full
              shadow-md transition duration-300 ease-in-out
              transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
            "
          >
            + Create Post
          </Link>
        </div>
      )}

      {isLoading && currentClubPosts.length === 0 ? (
        <p className="text-blue-400 text-center">Loading posts for this club...</p>
      ) : currentClubPosts.length === 0 ? (
        <p className="no-posts-text text-gray-400 text-center mt-8">No posts in this club yet.</p>
      ) : (
        <div className="feed-list mt-8">
          {currentClubPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ClubDetails;
