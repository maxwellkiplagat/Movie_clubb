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

    user = db.relationship('User', backref='club_memberships', foreign_keys=[user_id])

    serialize_rules = (
        '-created_at',
        '-updated_at',
        '-user.club_memberships', 
        '-club.members', 
        'user.username', 
        'club.name', 
    )
    def __repr__(self):
        return f'<ClubMember User:{self.user_id} Club:{self.club_id}>'

