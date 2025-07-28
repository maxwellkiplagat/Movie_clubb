# backend/app/routes/comment_routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.comment import Comment # Import the Comment model
from app.models.post import Post     # Import the Post model (to find the post for commenting)
from app.models.user import User     # Import the User model (to get username for comment)

comment_bp = Blueprint('comment_bp', __name__)

@comment_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    """
    Allows an authenticated user to add a comment to a specific post.
    Requires 'content' in the request body.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    post = Post.query.get(post_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404
    if not post:
        return jsonify({'message': 'Post not found'}), 404

    data = request.get_json()
    content = data.get('content')

    if not content:
        return jsonify({'message': 'Comment content is required'}), 400

    new_comment = Comment(
        content=content,
        user_id=current_user_id,
        post_id=post_id
    )
    db.session.add(new_comment)
    db.session.commit()

    # Return the new comment's data, including the username
    return jsonify(new_comment.to_dict()), 201

@comment_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """
    Allows an authenticated user to delete their own comment.
    """
    current_user_id = get_jwt_identity()
    
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'message': 'Comment not found'}), 404

    # Ensure only the author of the comment can delete it
    if comment.user_id != current_user_id:
        return jsonify({'message': 'Unauthorized: You can only delete your own comments'}), 403

    try:
        db.session.delete(comment)
        db.session.commit()
        return jsonify({'message': 'Comment deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting comment {comment_id}: {e}")
        return jsonify({'message': 'An error occurred while deleting the comment'}), 500

@comment_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments_for_post(post_id):
    """
    Retrieves all comments for a specific post, ordered by creation date (oldest first).
    """
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404

    # The Post.to_dict() method already includes comments, but this route
    # can be used to fetch comments specifically if needed.
    # For now, we'll leverage the to_dict from the Post model, which fetches them.
    # If you need a separate endpoint for comments only, you'd query Comment directly.
    comments_data = [comment.to_dict() for comment in post.comments]
    return jsonify(comments_data), 200

