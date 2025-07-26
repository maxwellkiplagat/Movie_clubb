from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.user import User
from ..models.club_member import ClubMember 
from ..models.club import Club 
from ..models.follow import Follow 
from ..models.post import Post # Import Post model
import re 
import traceback # NEW: Import traceback for detailed error logging

# Create a Blueprint for user routes. 
user_bp = Blueprint('user_bp', __name__)

# Route to get user details
@user_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_details(user_id):
    """
    Retrieves a user's profile by ID.
    Requires authentication. User can fetch their own profile or another user's public profile.
    """
    current_user_id = get_jwt_identity()
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    print(f"Backend: Serving GET request for user {user_id}. User data: {user.to_dict()}")
    return make_response(jsonify(user.to_dict()), 200)

# Route to update user details
@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user_details(user_id):
    """
    Updates the profile of the authenticated user.
    A user can only update their own profile.
    Includes stricter password validation.
    """
    current_user_id = get_jwt_identity()

    if current_user_id != user_id:
        return jsonify({'message': 'Unauthorized: You can only update your own profile'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()
    print(f"Backend: Received PUT request for user {user_id}. Data: {data}") 
    print(f"Backend: Current user object before update: {user.username}, {user.email}, {user._password_hash[:10]}...") 

    if 'username' in data:
        new_username = data['username'].strip()
        if not new_username:
            return jsonify({'message': 'Username cannot be empty'}), 400
        
        if new_username != user.username and User.query.filter(User.username == new_username).first():
            return jsonify({'message': 'Username already taken'}), 409
        user.username = new_username
        print(f"Backend: Updating username to {new_username}") 

    if 'email' in data:
        new_email = data['email'].strip()
        if not new_email:
            return jsonify({'message': 'Email cannot be empty'}), 400

        if new_email != user.email and User.query.filter(User.email == new_email).first():
            return jsonify({'message': 'Email already taken'}), 409
        user.email = new_email
        print(f"Backend: Updating email to {new_email}") 

    if 'password' in data:
        new_password = data['password']
        if not new_password:
            return jsonify({'message': 'Password cannot be empty'}), 400
        if len(new_password) < 5: 
            return jsonify({'message': 'Password must be at least 5 characters long'}), 400
        if not re.search(r'[A-Z]', new_password): 
            return jsonify({'message': 'Password must contain at least one capital letter'}), 400
        if not re.search(r'[a-z]', new_password): 
            return jsonify({'message': 'Password must contain at least one small letter'}), 400
        if not re.search(r'[0-9]', new_password): 
            return jsonify({'message': 'Password must contain at least one number'}), 400
        
        user.password_hash = new_password 
        print(f"Backend: Attempting to update password for user {user.username}") 
        print(f"Backend: Password hash setter called. New hash (partial): {user._password_hash[:10]}...") 

    try:
        db.session.add(user) 
        db.session.commit()
        print(f"Backend: User {user.username} updated successfully and committed.") 
        return make_response(jsonify(user.to_dict()), 200)
    except Exception as e:
        db.session.rollback()
        print(f"Backend ERROR: Failed to update user {user.username}. Error: {str(e)}") 
        return jsonify({'message': f'Error updating user: {str(e)}'}), 500

# Route to get clubs a user has joined
@user_bp.route('/users/<int:user_id>/clubs', methods=['GET'])
@jwt_required()
def get_user_clubs(user_id):
    """
    Retrieves all clubs a specific user is a member of.
    Requires authentication.
    """
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({"message": "Unauthorized access"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    memberships = ClubMember.query.filter_by(user_id=user.id).all()
    
    joined_clubs = [membership.club.to_dict() for membership in memberships if membership.club]
    
    return jsonify(joined_clubs), 200

# NEW ROUTE: Get posts created by a specific user - MODIFIED FOR DEBUGGING
@user_bp.route('/users/<int:user_id>/posts', methods=['GET'])
@jwt_required()
def get_user_posts(user_id):
    """
    Retrieves all posts created by a specific user.
    Requires authentication.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # For now, let's allow viewing other users' public posts.
    # If you want to restrict this to only the current user viewing their own posts, uncomment the line below:
    # if current_user_id != user_id:
    #     return jsonify({'message': 'Unauthorized to view this user\'s posts'}), 403

    user_posts_data = []
    for post in user.posts: # Iterate through the posts relationship
        try:
            # Attempt to serialize each post
            post_dict = post.to_dict()
            user_posts_data.append(post_dict)
        except Exception as e:
            # If an error occurs during serialization of a specific post, log it
            print(f"ERROR: Failed to serialize post ID {post.id} for user {user_id}: {e}")
            traceback.print_exc() # Print full traceback for the specific post
            # Optionally, you can skip this post or return a partial list
            # For now, we'll just log and continue, but the 500 will still occur if the list is returned with error
            # To prevent 500, you might return a 200 with a message about partial data
            # or include an 'errors' field in the response.
            # For debugging, just logging is fine. The 500 will still tell us something went wrong.
            return jsonify({"message": f"Error processing posts for user {user_id}: {str(e)}"}), 500 # Return 500 immediately for any post error

    return jsonify(user_posts_data), 200


# Route to get users that a specific user is following
@user_bp.route('/users/<int:user_id>/following', methods=['GET']) 
@jwt_required()
def get_user_following(user_id):
    """
    Retrieves the list of users that a specific user is following.
    Requires authentication.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    following_users_data = []
    for followed_user_obj in user.following: 
        followed_user = followed_user_obj.followed 
        following_users_data.append({
            'id': followed_user.id,
            'username': followed_user.username,
            'email': followed_user.email 
        })
    
    return jsonify(following_users_data), 200

# Route to follow a user
@user_bp.route('/users/<int:user_id>/follow', methods=['POST'])
@jwt_required()
def follow_user(user_id):
    """
    Allows the authenticated user to follow another user.
    """
    current_user_id = get_jwt_identity()
    
    follower = User.query.get(current_user_id)
    followed = User.query.get(user_id)

    if not follower or not followed:
        return jsonify({'message': 'User not found'}), 404

    if follower.id == followed.id:
        return jsonify({'message': 'You cannot follow yourself'}), 400

    existing_follow = Follow.query.filter_by(follower_id=follower.id, followed_id=followed.id).first()
    if existing_follow:
        return jsonify({'message': 'Already following this user'}), 409 

    new_follow = Follow(follower_id=follower.id, followed_id=followed.id)
    db.session.add(new_follow)
    db.session.commit()

    return jsonify({'message': f'You are now following {followed.username}'}), 201 

# Route to unfollow a user
@user_bp.route('/users/<int:user_id>/unfollow', methods=['POST']) 
@jwt_required()
def unfollow_user(user_id):
    """
    Allows the authenticated user to unfollow another user.
    """
    current_user_id = get_jwt_identity()
    
    follower = User.query.get(current_user_id)
    followed = User.query.get(user_id)

    if not follower or not followed:
        return jsonify({'message': 'User not found'}), 404

    if follower.id == followed.id:
        return jsonify({'message': 'You cannot unfollow yourself'}), 400

    follow_to_delete = Follow.query.filter_by(follower_id=follower.id, followed_id=followed.id).first()

    if not follow_to_delete:
        return jsonify({'message': 'Not currently following this user'}), 404

    db.session.delete(follow_to_delete)
    db.session.commit()

    return jsonify({'message': f'You have unfollowed {followed.username}'}), 200

# NEW ROUTE: Get users that are following a specific user (followers)
@user_bp.route('/users/<int:user_id>/followers', methods=['GET'])
@jwt_required()
def get_user_followers(user_id):
    """
    Retrieves the list of users who are following a specific user.
    Requires authentication.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # The 'followers' relationship on the User model is defined in models/user.py
    # It should correctly return Follow objects where this user is the 'followed' party.
    follower_users_data = []
    for follower_obj in user.followers: 
        # Access the 'follower' User object from the Follow object
        follower_user = follower_obj.follower 
        follower_users_data.append({
            'id': follower_user.id,
            'username': follower_user.username,
            'email': follower_user.email 
        })
    
    return jsonify(follower_users_data), 200
