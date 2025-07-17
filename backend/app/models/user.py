from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin
from .. import bcrypt

class User(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__= 'users'

    #Columns
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False) #storing hashed password

    # Relationships(We will be uncommented as other models are created)
    # posts = db.relationship('Post', backref='user', lazy=True)
    # reviews = db.relationship('Review', backref='user', lazy=True)
    # clubs_created = db.relationship('Club', backref='creator', lazy=True)
    # club_memberships = db.relationship('ClubMember', backref='user', lazy=True) # Assuming a ClubMember join table
    # followers = db.relationship('Follow', foreign_keys='Follow.followed_id', backref='followed', lazy=True)
    # following = db.relationship('Follow', foreign_keys='Follow.follower_id', backref='follower', lazy=True)
    # watchlists = db.relationship('Watchlist', backref='user', lazy=True)

    serialize_rules = ('-created_at', '-updated_at', '-_password_hash')

    def __repr__(self):
        return f'<User {self.username}>'
    
    # Password hashing and verification
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
