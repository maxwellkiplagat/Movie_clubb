# backend/app/routes/like_routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.like import Like # Import the Like model
from app.models.post import Post # Import the Post model

like_bp = Blueprint('like_bp', __name__)

@like_bp.route('/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(post_id):
    """
    Toggles a like on a post (add or remove).
    Requires JWT authentication.
    """
    current_user_id = get_jwt_identity()

    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404

    # Check if the user has already liked this post
    existing_like = Like.query.filter_by(user_id=current_user_id, post_id=post_id).first()

    if existing_like:
        # If already liked, unlike it
        db.session.delete(existing_like)
        db.session.commit()
        # Recalculate likes_count after deletion
        likes_count = len(post.likes)
        return jsonify({'message': 'Post unliked successfully', 'likes_count': likes_count, 'liked': False}), 200
    else:
        # If not liked, like it
        new_like = Like(user_id=current_user_id, post_id=post_id)
        db.session.add(new_like)
        db.session.commit()
        # Recalculate likes_count after addition
        likes_count = len(post.likes)
        return jsonify({'message': 'Post liked successfully', 'likes_count': likes_count, 'liked': True}), 201

@like_bp.route('/posts/<int:post_id>/likes', methods=['GET'])
def get_likes_for_post(post_id):
    """
    Gets the number of likes and a list of users who liked a specific post.
    """
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404

    likes = Like.query.filter_by(post_id=post_id).all()
    likes_data = [like.to_dict() for like in likes]
    
    # We can also return the count directly from the relationship
    likes_count = len(post.likes)

    return jsonify({
        'likes_count': likes_count,
        'likes': likes_data
    }), 200

@like_bp.route('/users/<int:user_id>/liked_posts', methods=['GET'])
def get_liked_posts_by_user(user_id):
    """
    Gets all posts liked by a specific user.
    """
    liked_posts = [like.post.to_dict() for like in Like.query.filter_by(user_id=user_id).all()]
    return jsonify(liked_posts), 200

