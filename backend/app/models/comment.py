# backend/app/models/comment.py
from app import db
from datetime import datetime

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # NEW: Define the relationships with User and Post models
    # 'user' here matches the back_populates='comments' in the User model
    user = db.relationship('User', back_populates='comments')
    # 'post' here matches the back_populates='comments' in the Post model
    post = db.relationship('Post', back_populates='comments')

    def __repr__(self):
        return f'<Comment User:{self.user_id} Post:{self.post_id}>'

    def to_dict(self):
        # Eagerly load username for display
        username = self.user.username if self.user else 'Unknown'
        return {
            'id': self.id,
            'content': self.content,
            'user_id': self.user_id,
            'username': username, 
            'post_id': self.post_id,
            'created_at': self.created_at.isoformat()
        }
