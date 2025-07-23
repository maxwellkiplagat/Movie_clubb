from sqlalchemy.ext.hybrid import hybrid_property
from .. import db
from .__init__ import BaseModelMixin
from .. import bcrypt

# User class no longer inherits from SerializerMixin
class User(BaseModelMixin, db.Model):
    __tablename__= 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)

    # Relationships
    posts = db.relationship('Post', back_populates='author', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('Review', back_populates='user', lazy=True, cascade='all, delete-orphan')
    clubs_created = db.relationship('Club', back_populates='creator', lazy=True, cascade='all, delete-orphan')
    club_memberships = db.relationship('ClubMember', back_populates='user', lazy=True, cascade='all, delete-orphan')
    
    # For user-to-user following
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

    # Removed: serialize_rules attribute as SerializerMixin is no longer used

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

    # Custom to_dict method to handle all serialization explicitly
    def to_dict(self, include_relationships=True):
        # Manually include basic user attributes
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            # Do NOT include _password_hash directly
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_relationships:
            # Manually serialize club_memberships to include specific club details
            data['club_memberships'] = [
                {
                    'id': cm.club.id,
                    'name': cm.club.name,
                    'description': cm.club.description,
                    'genre': cm.club.genre
                }
                for cm in self.club_memberships
            ]

            # Manually serialize clubs_created to include specific club details
            data['clubs_created'] = [
                {
                    'id': club.id,
                    'name': club.name,
                    'description': club.description,
                    'genre': club.genre
                }
                for club in self.clubs_created
            ]
            
            # Manually serialize followers and following
            # data['posts'] = [{'id': post.id, 'movie_title': post.movie_title} for post in self.posts]
            # data['reviews'] = [{'id': review.id, 'rating': review.rating, 'movie_title': review.movie.title} for review in self.reviews]
            # data['watchlists'] = [{'id': wl.id, 'movie_id': wl.movie_id, 'status': wl.status} for wl in self.watchlists]

        return data

