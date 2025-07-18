from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin

class Club(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'clubs'

    # Columns
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    genre = db.Column(db.String(100))  # Assuming clubs can be genre-specific
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    # creator = db.relationship('User', backref='clubs_created')
    # club_members = db.relationship('ClubMember', backref='club', lazy=True) 
    # posts = db.relationship('Post', backref='club', lazy=True) 

    serialize_rules = ('-created_at', '-updated_at')

    def __repr__(self):
        return f'<Club {self.name}>'