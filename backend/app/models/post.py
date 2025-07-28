# backend/app/models/post.py
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

    author = db.relationship('User', back_populates='posts', foreign_keys=[user_id])
    club = db.relationship('Club', back_populates='posts')

    # NEW: Relationships for Likes and Comments
    # 'post' here refers to the back_populates name defined in the Like and Comment models.
    likes = db.relationship('Like', back_populates='post', lazy=True, cascade="all, delete-orphan")
    comments = db.relationship('Comment', back_populates='post', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        # Manually construct the dictionary to avoid recursion
        data = {
            'id': self.id,
            'movie_title': self.movie_title,
            'content': self.content,
            'user_id': self.user_id,
            'club_id': self.club_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        # Add author_username AND author_id directly
        if self.author:
            data['author_username'] = self.author.username
            data['author_id'] = self.author.id
        else:
            data['author_username'] = 'Unknown'
            data['author_id'] = None

        # NEW: Include likes count
        data['likes_count'] = len(self.likes)

        # NEW: Prepare comments to be included in the post dict
        comments_data = [{
            'id': comment.id,
            'user_id': comment.user_id,
            'username': comment.user.username if comment.user else 'Unknown', # Access username via backref from Comment model
            'content': comment.content,
            'created_at': comment.created_at.isoformat()
        } for comment in self.comments]
        data['comments'] = comments_data

        return data

    def __repr__(self):
        return f'<Post {self.movie_title} in Club {self.club_id}>'
