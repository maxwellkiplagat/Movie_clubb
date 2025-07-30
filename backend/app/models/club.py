from sqlalchemy.ext.hybrid import hybrid_property # Keep if used elsewhere, otherwise can remove
from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin # Assuming BaseModelMixin is still relevant
from datetime import datetime

class Club(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'clubs'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # REMOVED: created_by_user_id column
    # created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    # REMOVED: creator relationship
    # creator = db.relationship('User', back_populates='clubs_created')
    members = db.relationship('ClubMember', back_populates='club', lazy=True, cascade='all, delete-orphan')
    posts = db.relationship('Post', back_populates='club', lazy=True, cascade='all, delete-orphan') 

    serialize_rules = (
        '-created_at', 
        '-updated_at',
        # REMOVED: '-creator.password_hash',
        '-members.club', # Prevent recursion
        '-posts.club',   # Prevent recursion when serializing posts
        # REMOVED: 'creator.username', # No longer include creator's username
    )

    def to_dict(self):
        # Manually construct the dictionary to avoid recursion and include specific related data
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'genre': self.genre,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            # REMOVED: 'created_by_user_id': self.created_by_user_id,
            # REMOVED: 'creator_username': self.creator.username if self.creator else None,
            'member_count': len(self.members) # Include member count
        }
        return data

    def __repr__(self):
        return f"<Club {self.name}>"
