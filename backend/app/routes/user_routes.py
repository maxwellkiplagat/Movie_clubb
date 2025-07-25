from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.user import User
from ..models.club_member import ClubMember 
from ..models.club import Club 
import re # For password validation

# Create a Blueprint for user routes. 
user_bp = Blueprint('user_bp', __name__)

# Route to get user details
@user_bp.route('/<int:user_id>', methods=['GET'])
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
    
    # Debug log for GET request
    print(f"Backend: Serving GET request for user {user_id}. User data: {user.to_dict()}")
    return make_response(jsonify(user.to_dict()), 200)

# Route to update user details
@user_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user_details(user_id):
    """
    Updates the profile of the authenticated user.
    A user can only update their own profile.
    Includes stricter password validation.
    """
    current_user_id = get_jwt_identity()

    # Ensure the authenticated user is trying to update their own profile
    if current_user_id != user_id:
        return jsonify({'message': 'Unauthorized: You can only update your own profile'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()
    print(f"Backend: Received PUT request for user {user_id}. Data: {data}") 
    print(f"Backend: Current user object before update: {user.username}, {user.email}, {user._password_hash[:10]}...") 

    # Update username if provided and unique (and different from current)
    if 'username' in data:
        new_username = data['username'].strip()
        if not new_username:
            return jsonify({'message': 'Username cannot be empty'}), 400
        
        # Check if username is already taken by another user (excluding current user)
        if new_username != user.username and User.query.filter(User.username == new_username).first():
            return jsonify({'message': 'Username already taken'}), 409
        user.username = new_username
        print(f"Backend: Updating username to {new_username}") 

    # Update email if provided and unique (and different from current)
    if 'email' in data:
        new_email = data['email'].strip()
        if not new_email:
            return jsonify({'message': 'Email cannot be empty'}), 400

        # Check if email is already taken by another user (excluding current user)
        if new_email != user.email and User.query.filter(User.email == new_email).first():
            return jsonify({'message': 'Email already taken'}), 409
        user.email = new_email
        print(f"Backend: Updating email to {new_email}") 

    # Update password if provided - with stricter validation
    if 'password' in data:
        new_password = data['password']
        # Stricter password validation
        if not new_password:
            return jsonify({'message': 'Password cannot be empty'}), 400
        if len(new_password) < 5: # At least 5 characters
            return jsonify({'message': 'Password must be at least 5 characters long'}), 400
        if not re.search(r'[A-Z]', new_password): # At least one capital letter
            return jsonify({'message': 'Password must contain at least one capital letter'}), 400
        if not re.search(r'[a-z]', new_password): # At least one small letter
            return jsonify({'message': 'Password must contain at least one small letter'}), 400
        if not re.search(r'[0-9]', new_password): # At least one number
            return jsonify({'message': 'Password must contain at least one number'}), 400
        
        user.password_hash = new_password # Use the hybrid property setter
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

# Route to get clubs a user has joined (moved here for organization)
@user_bp.route('/<int:user_id>/clubs', methods=['GET'])
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

