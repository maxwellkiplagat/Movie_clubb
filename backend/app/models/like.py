# backend/app/models/like.py
from app import db
from datetime import datetime

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # NEW: Define the relationships with User and Post models
    # 'user' here matches the back_populates='user' in the User model
    user = db.relationship('User', back_populates='likes')
    # 'post' here matches the back_populates='post' in the Post model
    post = db.relationship('Post', back_populates='likes')

    # Ensure a user can like a post only once
    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='_user_post_uc'),)

    def __repr__(self):
        return f'<Like User:{self.user_id} Post:{self.post_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'post_id': self.post_id,
            'created_at': self.created_at.isoformat()
        }
