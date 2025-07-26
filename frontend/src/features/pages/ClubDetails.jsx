import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchClubPosts,
  clearClubError,
  clearCurrentClubPosts,
  leaveClub
} from '../clubs/clubSlice';

// Reusable PostCard component
const PostCard = ({ post, toggleLike, addComment, toggleFollow, likes, comments, following }) => {
  return (
    <div className="forum-post-card mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-blue-400 mb-2">{post.movie_title}</h2>
      <p className="text-gray-300 mb-3">{post.content}</p>

      <div className="post-meta text-sm text-gray-400 flex justify-between items-center">
        <span>By @{post.author_username || "Unknown"}</span>
        <span>{new Date(post.created_at_formatted).toLocaleDateString()}</span>
      </div>

      <div className="mt-2 flex gap-3 items-center text-sm">
        <button onClick={() => toggleLike(post.id)} className="text-blue-400 hover:underline">
          Like ({likes[post.id] || 0})
        </button>
        <button onClick={() => toggleFollow(post.author_username)} className="text-purple-400 hover:underline">
          {following[post.author_username] ? "Unfollow" : "Follow"} @{post.author_username}
        </button>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-1">Comments:</h4>
        <ul className="text-sm text-gray-300 mb-2">
          {(comments[post.id] || []).map((cmt, i) => (
            <li key={i} className="mb-1">
              - {cmt}
            </li>
          ))}
        </ul>

        <input
          type="text"
          placeholder="Add a comment..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim() !== "") {
              addComment(post.id, e.target.value.trim());
              e.target.value = "";
            }
          }}
          className="bg-gray-700 px-2 py-1 rounded w-full text-white"
        />
      </div>
    </div>
  );
};

function ClubDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [following, setFollowing] = useState({});

  const { allClubs, currentClubPosts, isLoading, error } = useSelector((state) => state.clubs);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const club = allClubs.find(c => c.id === parseInt(id));

  useEffect(() => {
    if (id) {
      dispatch(clearClubError());
      dispatch(fetchClubPosts(parseInt(id)));
    }
    return () => {
      dispatch(clearCurrentClubPosts());
    };
  }, [id, dispatch]);

  const toggleLike = (postId) => {
    setLikes(prev => ({
      ...prev,
      [postId]: prev[postId] === 1 ? 0 : 1
    }));
  };

  const addComment = (postId, text) => {
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), text]
    }));
  };

  const toggleFollow = (authorUsername) => {
    setFollowing(prev => ({
      ...prev,
      [authorUsername]: !prev[authorUsername]
    }));
  };

  const handleLeaveClub = () => {
    dispatch(leaveClub(club.id));
    navigate('/clubs');
  };

  if (isLoading && !club && currentClubPosts.length === 0) {
    return <p className="text-blue-400 text-center mt-8">Loading club details and posts...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center mt-8">Error: {error}</p>;
  }

  if (!club) {
    return <p className="text-gray-400 text-center mt-8">Club not found or not loaded.</p>;
  }

  return (
    <div className="page-container p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-400">{club.name}</h1>
          <p className="text-gray-300 text-lg">{club.description}</p>
        </div>

        {isAuthenticated && (
          <button onClick={handleLeaveClub} className="leave-btn">
            Leave Club
          </button>
        )}
      </div>

      {isAuthenticated && (
        <div className="text-right mb-6">
          <Link to={`/clubs/${club.id}/create-post`} className="create-post-btn">
            + Create Post
          </Link>
        </div>
      )}

      {isLoading && currentClubPosts.length === 0 ? (
        <p className="text-blue-400 text-center">Loading posts for this club...</p>
      ) : currentClubPosts.length === 0 ? (
        <p className="text-gray-400 text-center mt-8">No posts in this club yet.</p>
      ) : (
        <div className="feed-list mt-8">
          {currentClubPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              toggleLike={toggleLike}
              addComment={addComment}
              toggleFollow={toggleFollow}
              likes={likes}
              comments={comments}
              following={following}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ClubDetails;
