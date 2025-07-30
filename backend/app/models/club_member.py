from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin

class ClubMember(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'club_members'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'), nullable=False)

    # Ensure a user can only be a member of a club once
    __table_args__ = (db.UniqueConstraint('user_id', 'club_id', name='_user_club_uc'),)

    # Relationships
    user = db.relationship('User', back_populates='club_memberships', foreign_keys=[user_id])
    club = db.relationship('Club', back_populates='members', foreign_keys=[club_id]) 

    # FIX: Drastically simplify serialize_rules to prevent ALL recursion.
    # Only include direct attributes. Frontend should fetch user/club details separately.
    serialize_rules = (
        '-created_at',
        '-updated_at',
        # Explicitly exclude ALL relationships to prevent ANY recursion or unexpected serialization issues.
        '-user', # Exclude the user object
        '-club', # Exclude the club object
    )

    def __repr__(self):
        return f'<ClubMember User:{self.user_id} Club:{self.club_id}>'
