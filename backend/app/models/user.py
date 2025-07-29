from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime, timedelta

from .. import db, bcrypt # Assuming db and bcrypt are initialized in app.py or __init__.py

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    _password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # New fields for password reset functionality
    reset_token = db.Column(db.String(128), unique=True, nullable=True)
    reset_token_expires_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    posts = db.relationship('Post', backref='user', lazy=True, cascade='all, delete-orphan')
    likes = db.relationship('Like', back_populates='user', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('Comment', back_populates='user', lazy=True, cascade='all, delete-orphan')
    club_memberships = db.relationship('ClubMember', back_populates='user', lazy=True, cascade='all, delete-orphan')
    
    following = db.relationship(
        'Follow',
        foreign_keys='Follow.follower_id',
        back_populates='follower',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    followers = db.relationship(
        'Follow',
        foreign_keys='Follow.followed_id',
        back_populates='followed',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    watchlists = db.relationship('Watchlist', back_populates='user', lazy=True, cascade='all, delete-orphan')

    # REMOVED: clubs_created relationship
    # clubs_created = db.relationship('Club', back_populates='creator', lazy=True, cascade='all, delete-orphan')

    # Serialization rules to prevent sensitive data exposure
    serialize_rules = (
        '-_password_hash', 'created_at', 'updated_at',
        '-reset_token', '-reset_token_expires_at', # Do not serialize these
        'posts.user', # Avoid circular reference
        'likes.user',
        'comments.user',
        'club_memberships.user',
        'following.follower',
        'followers.followed',
        'watchlists.user',
        # REMOVED: 'clubs_created.creator', # No longer serialize this
    )

    def __repr__(self):
        return f'<User {self.username}>'

    @hybrid_property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, password):
        self._password_hash = bcrypt.generate_password_hash(password.encode('utf-8')).decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

    # Method to generate a password reset token
    def generate_reset_token(self):
        import secrets
        self.reset_token = secrets.token_urlsafe(32)
        self.reset_token_expires_at = datetime.utcnow() + timedelta(hours=1) # Token valid for 1 hour
        db.session.add(self)
        db.session.commit()
        return self.reset_token

    # Method to verify a password reset token
    @classmethod
    def verify_reset_token(cls, token):
        user = cls.query.filter_by(reset_token=token).first()
        if user and user.reset_token_expires_at and user.reset_token_expires_at > datetime.utcnow():
            return user
        return None

