from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin
from .user import User # NEW: Import the User model

class Follow(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'follows'

    id = db.Column(db.Integer, primary_key=True)
    # Foreign Keys
    follower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    followed_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    __table_args__ = (db.UniqueConstraint('follower_id', 'followed_id', name='_follower_followed_uc'),)

    # FIX: Corrected remote_side to explicitly refer to User.id
    follower = db.relationship(
        'User',
        back_populates='following', 
        foreign_keys=[follower_id],
        remote_side=[User.id] # FIX: Use User.id (the column object)
    )
    # FIX: Corrected remote_side to explicitly refer to User.id
    followed = db.relationship(
        'User',
        back_populates='followers',
        foreign_keys=[followed_id],
        remote_side=[User.id] # FIX: Use User.id (the column object)
    )
    
    # Relationships
    serialize_rules = (
        '-created_at',
        '-updated_at',
        # These are fine as they only pull specific attributes, not the full object recursively
        'follower.username',
        'followed.username',
        # Explicitly exclude the full relationship objects to prevent recursion
        '-follower.following', 
        '-followed.followers', 
    )

    def __repr__(self):
        return f'<Follower:{self.follower_id} Followed:{self.followed_id}>'
