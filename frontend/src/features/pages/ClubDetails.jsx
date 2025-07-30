import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchClubPosts,
  clearClubError,
  clearCurrentClub,
  leaveClub,
  fetchClubDetails
} from '../clubs/clubSlice';
import PostCard from '../../components/PostCard';

function ClubDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});

  const {
    currentClub,
    currentClubPosts,
    isCurrentClubLoading,
    isLoading, 
    error 
  } = useSelector((state) => state.clubs);
  const { isAuthenticated } = useSelector((state) => state.auth);


  useEffect(() => {
    console.log("ClubDetails Render - id:", id);
    console.log("ClubDetails Render - currentClub:", currentClub);
    console.log("ClubDetails Render - currentClubPosts count:", currentClubPosts ? currentClubPosts.length : 0);
    console.log("ClubDetails Render - isCurrentClubLoading (for club details):", isCurrentClubLoading);
    console.log("ClubDetails Render - isLoading (for club posts):", isLoading);
    console.log("ClubDetails Render - error:", error);
    
  }, [id, currentClub, currentClubPosts, isCurrentClubLoading, isLoading, error]); 


  useEffect(() => {
    console.log(`ClubDetails useEffect (fetch): Club ID changed to ${id}. Dispatching fetches.`);
    if (id) {
      dispatch(clearClubError());
      dispatch(fetchClubDetails(parseInt(id)));
      dispatch(fetchClubPosts(parseInt(id)));
    }
    return () => {
      console.log("ClubDetails useEffect: Component unmounting or ID changing. Clearing current club data.");
      dispatch(clearCurrentClub());
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

  const handleLeaveClub = async () => {
    if (currentClub) {
      console.log(`ClubDetails: Attempting to leave club ${currentClub.id}`);
      try {
        await dispatch(leaveClub(currentClub.id)).unwrap();
        console.log(`ClubDetails: Successfully left club ${currentClub.name}. Navigating to /clubs.`);
        navigate('/clubs');
      } catch (leaveError) {
        console.error("ClubDetails: Failed to leave club:", leaveError);
        alert(`Failed to leave club: ${leaveError.message || 'An error occurred.'}`);
      }
    }
  };

  
  if (isCurrentClubLoading) {
    console.log("ClubDetails: Displaying initial club details loading message.");
    return <p className="text-blue-400 text-center mt-8">Loading club details...</p>;
  }

  if (error) {
    console.log("ClubDetails: Displaying error message:", error);
    return <p className="text-red-500 text-center mt-8">Error: {error}</p>;
  }

  if (!currentClub) {
    console.log("ClubDetails: Club not found or not loaded (currentClub is null).");
    return <p className="text-gray-400 text-center mt-8">Club not found or not loaded.</p>;
  }

  return (
    <div className="page-container p-6 bg-gray-900 min-h-screen text-white">
      {}
      {
        
      }

      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-400">{currentClub.name}</h1>
          <p className="text-gray-300 text-lg">{currentClub.description}</p>
        </div>

        {isAuthenticated && (
          <button onClick={handleLeaveClub} className="leave-btn">
            Leave Club
          </button>
        )}
      </div>

      {isAuthenticated && (
        <div className="text-right mb-6">
          <Link to={`/clubs/${currentClub.id}/create-post`} className="create-post-btn">
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
              likes={likes}
              comments={comments}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ClubDetails;
