from sqlalchemy.ext.hybrid import hybrid_property
from .. import db
from .__init__ import BaseModelMixin
from .. import bcrypt

class User(BaseModelMixin, db.Model):
    __tablename__= 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)

    posts = db.relationship('Post', back_populates='author', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('Review', back_populates='user', lazy=True, cascade='all, delete-orphan')
    clubs_created = db.relationship('Club', back_populates='creator', lazy=True, cascade='all, delete-orphan')
    club_memberships = db.relationship('ClubMember', back_populates='user', lazy=True, cascade='all, delete-orphan')
    
    followers = db.relationship(
        'Follow',
        foreign_keys='Follow.followed_id',
        back_populates='followed',
        lazy=True,
        cascade='all, delete-orphan'
    )
    following = db.relationship(
        'Follow',
        foreign_keys='Follow.follower_id',
        back_populates='follower',
        lazy=True,
        cascade='all, delete-orphan'
    )
    watchlists = db.relationship('Watchlist', back_populates='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'
    
    @hybrid_property
    def password_hash(self):
        raise AttributeError('Password hashes may not be viewed.')
    
    @password_hash.setter
    def password_hash(self, password): 
        self._password_hash = bcrypt.generate_password_hash(
            password.encode('utf-8')).decode('utf-8')
        
    def authenticate(self, password):
        return bcrypt.check_password_hash(
            self._password_hash, password.encode('utf-8'))

    def to_dict(self, include_relationships=True):
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_relationships:
            data['club_memberships'] = [
                {
                    'id': cm.club.id,
                    'name': cm.club.name,
                    'description': cm.club.description,
                    'genre': cm.club.genre
                }
                for cm in self.club_memberships
            ]

            data['clubs_created'] = [
                {
                    'id': club.id,
                    'name': club.name,
                    'description': club.description,
                    'genre': club.genre
                }
                for club in self.clubs_created
            ]
            
            # This is the crucial part for 'following'
            data['following'] = [
                {
                    'id': follow_obj.followed.id,
                    'username': follow_obj.followed.username,
                    'email': follow_obj.followed.email # Include email for display if desired
                }
                for follow_obj in self.following # Assumes 'following' relationship returns Follow objects
            ]
            # This is the crucial part for 'followers'
            data['followers'] = [
                {
                    'id': follow_obj.follower.id,
                    'username': follow_obj.follower.username,
                    'email': follow_obj.follower.email # Include email for display if desired
                }
                for follow_obj in self.followers # Assumes 'followers' relationship returns Follow objects
            ]

        return data
