import React from 'react';

const PostCard = ({ post }) => (
  <div className="post-card">
    <h2>{post.title}</h2>
    <p>{post.comment}</p>
    <div className="post-meta">
      <span>Posted by <strong>@{post.username}</strong></span>
      <span>{post.created_at}</span>
    </div>
  </div>
);

export default PostCard;