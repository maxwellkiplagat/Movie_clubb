from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.club import Club
from ..models.club_member import ClubMember
from ..models.user import User 

club_bp = Blueprint('club_bp', __name__)


@club_bp.route('/', methods=['GET'])
def get_all_clubs():
    """
    Retrieves a list of all clubs.
    """
    clubs = Club.query.all()
    return jsonify([club.to_dict() for club in clubs]), 200

@club_bp.route('/<int:club_id>/join', methods=['POST'])
@jwt_required()
def join_club(club_id):
    """
    Allows an authenticated user to join a specific club.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    club = Club.query.get(club_id)

    if not user or not club:
        return jsonify({"message": "User or Club not found"}), 404

    # Check if already a member
    existing_member = ClubMember.query.filter_by(user_id=user.id, club_id=club.id).first()
    if existing_member:
        return jsonify({"message": "Already a member of this club"}), 409 # Conflict

    # Add member 
    new_member = ClubMember(user_id=user.id, club_id=club.id)
    db.session.add(new_member)
    db.session.commit()
    return jsonify({"message": f"Successfully joined {club.name}"}), 200

# NEW ROUTE: Leave a club
@club_bp.route('/<int:club_id>/leave', methods=['POST'])
@jwt_required()
def leave_club(club_id):
    """
    Allows the authenticated user to leave a specific club.
    Deletes the ClubMember entry.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    club = Club.query.get(club_id)

    if not user or not club:
        return jsonify({"message": "User or Club not found"}), 404

    # Find the membership to delete
    membership_to_delete = ClubMember.query.filter_by(
        user_id=user.id, 
        club_id=club.id
    ).first()

    if not membership_to_delete:
        # If the user is not a member, return a 404 or 400
        return jsonify({"message": "You are not a member of this club"}), 404 

    try:
        db.session.delete(membership_to_delete)
        db.session.commit()
        return jsonify({"message": f"Successfully left {club.name}"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error leaving club: {e}") # Log the actual error for debugging
        return jsonify({"message": "An error occurred while leaving the club"}), 500


@club_bp.route('/<int:club_id>', methods=['GET'])
def get_club_details(club_id):
    """
    Retrieves details for a single club by its ID.
    """
    club = Club.query.get(club_id)
    if not club:
        return jsonify({"message": "Club not found"}), 404
    return jsonify(club.to_dict()), 200
