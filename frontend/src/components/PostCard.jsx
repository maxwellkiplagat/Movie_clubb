// src/components/PostCard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { followUser, unfollowUser, fetchFollowing } from '../features/auth/authSlice';
import { deletePost } from '../features/clubs/clubSlice';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user: currentUser, following: followingListFromRedux, isAuthenticated } = useSelector((state) => state.auth);

  const [currentLikes, setCurrentLikes] = useState(post.likes || 0);
  const [liked, setLiked] = useState(false);

  const [commentsVisible, setCommentsVisible] = useState(false);
  const [currentComments, setCurrentComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');

  const isFollowing = followingListFromRedux.some(followedUser => followedUser.id === post.author_id);
  const isOwnPost = currentUser && currentUser.id === post.author_id;

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchFollowing(currentUser.id));
    }
  }, [currentUser?.id, dispatch]);


  const handleLike = () => {
    setLiked(!liked);
    setCurrentLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      alert("Please log in to follow users.");
      return;
    }
    if (isOwnPost) {
      alert("You cannot follow yourself.");
      return;
    }
    if (!post.author_id) {
        alert("Cannot follow: Author ID is missing for this post.");
        console.error("PostCard: Missing post.author_id for follow action:", post);
        return;
    }

    try {
      if (isFollowing) {
        await dispatch(unfollowUser(post.author_id)).unwrap();
        console.log(`Successfully unfollowed user ${post.author_id}`);
      } else {
        await dispatch(followUser(post.author_id)).unwrap();
        console.log(`Successfully followed user ${post.author_id}`);
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      alert(`Failed to toggle follow: ${error.message || 'An error occurred.'}`);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      await dispatch(deletePost(post.id)).unwrap();
      alert("Post deleted successfully!");
      console.log(`Post ${post.id} deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert(`Failed to delete post: ${error.message || 'An error occurred.'}`);
    }
  };


  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const commentObj = {
        id: Date.now(),
        text: newComment,
        author: currentUser?.username || 'Guest'
      };
      setCurrentComments([...currentComments, commentObj]);
      setNewComment('');
    }
  };

  return (
    <div className="post-card p-4 rounded-lg bg-[#1a2a44] shadow-md text-white">
      <h2 className="text-xl font-semibold text-[#ff5733] mb-1">
        {post.title || post.movie_title}
      </h2>

      <p className="text-gray-200 mb-2">{post.comment || post.content}</p>

      <div className="post-meta flex justify-between text-sm text-gray-400 mb-4">
        <span>Posted by <strong>@{post.author_username || post.author}</strong></span>
        <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Invalid Date'}</span>
      </div>

      {/* Buttons */}
      <div className="post-actions flex gap-3 mb-4 flex-wrap">
        <button onClick={handleLike} className="post-btn">
          {liked ? 'Unlike' : 'Like'} ({currentLikes})
        </button>

        <button
          onClick={handleFollow}
          className="post-btn"
          disabled={isOwnPost || !isAuthenticated}
        >
          {isOwnPost ? 'Your Post' : (isFollowing ? 'Unfollow' : 'Follow')} @{post.author_username || post.author}
        </button>

        <button onClick={() => setCommentsVisible(prev => !prev)} className="post-btn">
          {commentsVisible ? 'Hide Comments' : 'Show Comments'}
        </button>

        {isAuthenticated && isOwnPost && (
          <button
            onClick={handleDeletePost}
            className="
              post-btn bg-red-600 hover:bg-red-700 text-white
              border border-red-500 hover:border-red-700
            " /* MODIFIED: Added post-btn class and red styling */
          >
            Delete Post
          </button>
        )}
      </div>

      {/* Comments Section */}
      {commentsVisible && (
        <div className="comments-section mt-3">
          <h4 className="text-[#ff5733] font-medium mb-2">Comments</h4>

          {currentComments.length === 0 ? (
            <p className="text-gray-400">No comments yet.</p>
          ) : (
            <ul className="space-y-1 mb-3">
              {currentComments.map((c, index) => (
                <li key={c.id || index} className="text-sm text-gray-200">
                  <strong>@{c.author}</strong>: {c.text}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="w-full p-2 rounded bg-[#2c3e50] text-white border border-gray-600 mb-2"
            />
            <button
              type="submit"
              className="post-btn"
            >
              Add Comment
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
