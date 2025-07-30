from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime, timedelta

from .. import db, bcrypt
from .__init__ import BaseModelMixin # Ensure BaseModelMixin is imported

# FIX: Changed inheritance to only include BaseModelMixin (which already has db.Model) and SerializerMixin
class User(BaseModelMixin, SerializerMixin):
    __tablename__ = 'users'

    # id, created_at, updated_at are now inherited from BaseModelMixin
    # id = db.Column(db.Integer, primary_key=True) # REMOVED: Inherited from BaseModelMixin
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)
    bio = db.Column(db.Text, nullable=True)
    # created_at = db.Column(db.DateTime, default=datetime.utcnow) # REMOVED: Inherited from BaseModelMixin
    # updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) # REMOVED: Inherited from BaseModelMixin

    # New fields for password reset functionality
    reset_token = db.Column(db.String(128), unique=True, nullable=True)
    reset_token_expires_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    posts = db.relationship('Post', back_populates='author', lazy=True, cascade='all, delete-orphan')
    likes = db.relationship('Like', back_populates='user', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('Comment', back_populates='user', lazy=True, cascade='all, delete-orphan')
    club_memberships = db.relationship('ClubMember', back_populates='user', lazy=True, cascade='all, delete-orphan')
    
    following = db.relationship(
        'Follow',
        primaryjoin="User.id == Follow.follower_id",
        back_populates='follower',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    followers = db.relationship(
        'Follow',
        primaryjoin="User.id == Follow.followed_id",
        back_populates='followed',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    watchlists = db.relationship('Watchlist', back_populates='user', lazy=True, cascade='all, delete-orphan')
    
    reviews = db.relationship('Review', back_populates='user', lazy=True, cascade='all, delete-orphan')

    # Serialization rules (simplified to avoid recursion with SerializerMixin)
    serialize_rules = (
        '-_password_hash', 'created_at', 'updated_at',
        '-reset_token', '-reset_token_expires_at', 
        'bio',

        '-posts',
        '-likes',
        '-comments',
        '-club_memberships',
        '-following', 
        '-followers', 
        '-watchlists',
        '-reviews',
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
