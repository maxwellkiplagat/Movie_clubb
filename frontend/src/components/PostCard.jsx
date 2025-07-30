import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLike, addComment, deleteComment, deletePost } from '../features/clubs/clubSlice';
import { followUser, unfollowUser, fetchFollowing, fetchFollowers } from '../features/auth/authSlice'; // Import fetchFollowing/Followers

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, following } = useSelector((state) => state.auth); // Get 'following' list
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const isLiked = post.likes?.some(like => like.user_id === user?.id);
  const isAuthor = post.user_id === user?.id;
  const isFollowingAuthor = following?.some(followedUser => followedUser.id === post.user_id); // Check if current user follows post author

  const handleLikeToggle = async () => {
    if (!user) {
      console.error("Please log in to like posts.");
      return;
    }
    try {
      await dispatch(toggleLike({ postId: post.id, currentUserId: user.id })).unwrap();
      console.log(`Successfully toggled like for post ${post.id}`);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error("Please log in to comment.");
      return;
    }
    if (!newComment.trim()) {
      console.error("Comment cannot be empty.");
      return;
    }
    try {
      await dispatch(addComment({ postId: post.id, content: newComment })).unwrap();
      setNewComment('');
      setShowComments(true); // Automatically show comments after adding one
      console.log(`Successfully added comment to post ${post.id}`);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) {
      console.error("Please log in to delete comments.");
      return;
    }
    try {
      await dispatch(deleteComment(commentId)).unwrap();
      console.log(`Successfully deleted comment ${commentId}`);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!user || !isAuthor) {
      console.error("You are not authorized to delete this post.");
      return;
    }
    try {
      await dispatch(deletePost(post.id)).unwrap();
      console.log(`Successfully deleted post ${post.id}`);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      console.error("Please log in to follow/unfollow users.");
      return;
    }
    if (user.id === post.user_id) {
      console.log("Cannot follow/unfollow yourself.");
      return;
    }

    try {
      if (isFollowingAuthor) {
        await dispatch(unfollowUser(post.user_id)).unwrap();
        console.log(`Successfully unfollowed user ${post.author_username}`);
      } else {
        await dispatch(followUser(post.user_id)).unwrap();
        console.log(`Successfully followed user ${post.author_username}`);
      }
      // After follow/unfollow, refresh the following/followers lists to ensure UI consistency
      if (user?.id) {
        dispatch(fetchFollowing(user.id));
        dispatch(fetchFollowers(user.id));
      }
    } catch (error) {
      console.error("Failed to toggle follow status:", error);
      // Optionally, if the error is "Not currently following", you could force an unfollow state here
      // This helps with the race condition you described.
      if (error.message && error.message.includes("Not currently following")) {
        console.log("Attempting to correct local state for unfollow.");
        dispatch(unfollowUser.fulfilled(post.user_id)); // Manually dispatch fulfilled to update local state
      }
    }
  };

  return (
    <div className="post-card bg-gray-800 rounded-lg p-6 shadow-lg mb-6 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-orange-400 mb-1">{post.movie_title}</h3>
          <div className="flex items-center text-gray-300 text-sm">
            <p className="mr-2">by @{post.author_username}</p> {/* Added mr-2 for spacing */}
            {/* Show Follow/Unfollow button if not the author and authenticated */}
            {isAuthenticated && !isAuthor && (
              <button
                onClick={handleFollowToggle}
                className={`
                  px-3 py-1 rounded-full font-bold text-xs transition duration-300 ease-in-out
                  ${isFollowingAuthor ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'}
                `}
              >
                {isFollowingAuthor ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>
        {isAuthor && (
          <button
            onClick={handleDeletePost}
            className="delete-btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm transition duration-300"
          >
            Delete Post
          </button>
        )}
      </div>
      <p className="text-gray-200 mb-4">{post.content}</p>

      <div className="flex items-center text-gray-400 text-sm mb-4">
        <span className="mr-4">
          {post.likes_count} {post.likes_count === 1 ? 'Like' : 'Likes'}
        </span>
        <span>
          {post.comments?.length || 0} {post.comments?.length === 1 ? 'Comment' : 'Comments'}
        </span>
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleLikeToggle}
          className={`
            flex items-center px-4 py-2 rounded-full font-bold text-sm transition duration-300 ease-in-out
            ${isLiked ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 mr-2 ${isLiked ? 'text-white' : 'text-gray-400'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          {isLiked ? 'Liked' : 'Like'}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center px-4 py-2 rounded-full bg-gray-700 text-gray-300 font-bold text-sm hover:bg-gray-600 transition duration-300 ease-in-out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.336-3.111A8.85 8.85 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z"
              clipRule="evenodd"
            />
          </svg>
          {showComments ? 'Hide Comments' : 'Comment'}
        </button>
      </div>

      {showComments && (
        <div className="comments-section mt-4 bg-gray-700 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-200 mb-3">Comments</h4>
          {post.comments && post.comments.length > 0 ? (
            <ul className="space-y-3">
              {post.comments.map((comment) => (
                <li key={comment.id} className="bg-gray-600 p-3 rounded-md flex justify-between items-center">
                  <div>
                    <p className="text-gray-100">{comment.content}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      @{comment.username} on {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                  {user?.id === comment.user_id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="delete-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full text-xs transition duration-300"
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
          )}

          <form onSubmit={handleAddComment} className="mt-4 flex">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-grow p-2 rounded-l-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition duration-300"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
