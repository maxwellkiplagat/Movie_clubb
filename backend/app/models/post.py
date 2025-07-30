from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin
from datetime import datetime

class Post(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    movie_title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'), nullable=False)

    # Relationships
    # Ensure back_populates matches the relationship name in User ('posts')
    author = db.relationship('User', back_populates='posts', foreign_keys=[user_id])
    club = db.relationship('Club', back_populates='posts')

    likes = db.relationship('Like', back_populates='post', lazy=True, cascade="all, delete-orphan")
    comments = db.relationship('Comment', back_populates='post', lazy=True, cascade="all, delete-orphan")

    # FIX: Add serialize_rules to prevent recursion and control what SerializerMixin does.
    # We explicitly exclude all relationships here and rely on to_dict() for nested data.
    serialize_rules = (
        '-created_at',
        '-updated_at',
        '-author',   # Exclude the 'author' relationship
        '-club',     # Exclude the 'club' relationship
        '-likes',    # Exclude the 'likes' relationship (we'll handle it manually in to_dict)
        '-comments', # Exclude the 'comments' relationship
    )

    def to_dict(self):
        # Manually construct the dictionary to control what's included and avoid recursion
        data = {
            'id': self.id,
            'movie_title': self.movie_title,
            'content': self.content,
            'user_id': self.user_id,
            'club_id': self.club_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if self.author:
            data['author_username'] = self.author.username
            data['author_id'] = self.author.id
        else:
            data['author_username'] = 'Unknown'
            data['author_id'] = None

        # Include likes count
        data['likes_count'] = len(self.likes)

        # NEW: Include the list of likes with user_id and username
        data['likes'] = [
            {'user_id': like.user_id, 'username': like.user.username if like.user else 'Unknown'}
            for like in self.likes
        ]

        # Prepare comments to be included in the post dict (using Comment's to_dict)
        comments_data = [comment.to_dict() for comment in self.comments]
        data['comments'] = comments_data

        return data

    def __repr__(self):
        return f'<Post {self.movie_title} in Club {self.club_id}>'
