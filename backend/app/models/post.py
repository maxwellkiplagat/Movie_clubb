from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin 

class Post(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    movie_title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    club_id = db.Column(db.Integer, db.ForeignKey('clubs.id'), nullable=False)

    # Relationships
    author = db.relationship('User', backref='posts', foreign_keys=[user_id])
    serialize_rules = (
        '-created_at',
        '-updated_at',
        '-author.posts', 
        '-club.posts',  
        'author.username', 
    )

    def __repr__(self):
        return f'<Post {self.movie_title} in Club {self.club_id}>'

