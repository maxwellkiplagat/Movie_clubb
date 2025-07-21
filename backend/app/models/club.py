from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin 

class Club(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'clubs'

    # Columns
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    genre = db.Column(db.String(100))
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    creator = db.relationship('User', backref='clubs_created', foreign_keys=[created_by_user_id])
    posts = db.relationship('Post', backref='club', lazy=True, cascade='all, delete-orphan')

    # Many-to-Many relationship with User through ClubMember for club members
    members = db.relationship(
        'ClubMember',
        backref='club',
        lazy=True,
        cascade='all, delete-orphan' 
    )

    # Define serialization rules to avoid recursion and include necessary fields
    serialize_rules = (
        '-created_at',
        '-updated_at',
        '-posts.club', 
        '-members.club', 
        'creator.username',         
    )

    def __repr__(self):
        return f'<Club {self.name}>'

