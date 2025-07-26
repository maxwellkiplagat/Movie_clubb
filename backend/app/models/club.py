from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin
from datetime import datetime

class Club(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'clubs'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    creator = db.relationship('User', back_populates='clubs_created')
    members = db.relationship('ClubMember', back_populates='club', lazy=True, cascade='all, delete-orphan')
    # MODIFIED: Added cascade='all, delete-orphan' to the posts relationship
    posts = db.relationship('Post', back_populates='club', lazy=True, cascade='all, delete-orphan') 

    serialize_rules = (
        '-created_at', 
        '-updated_at',
        '-creator.password_hash', # Exclude password hash from creator
        '-members.club', # Prevent recursion
        '-posts.club',   # Prevent recursion when serializing posts
        'creator.username', # Include creator's username
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
            'created_by_user_id': self.created_by_user_id,
            'creator_username': self.creator.username if self.creator else None,
            'member_count': len(self.members) # Include member count
        }
        return data

    def __repr__(self):
        return f"<Club {self.name}>"
