from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin

class Movie(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'movies'

    #Columns
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    genre = db.Column(db.String(100), nullable=False)
    release_year = db.Column(db.Integer, nullable=False)
    director = db.Column(db.String(255))
    description = db.Column(db.Text)
    poster_url = db.Column(db.String(500))

    # Relationships (to be uncommented as other models are created)
    # reviews = db.relationship('Review', backref='movie', lazy=True)
    # watchlists = db.relationship('Watchlist', backref='movie', lazy=True)

    serialize_rules = ('-created_at', '-updated_at')
    def __repr__(self):
        return f'<Movie {self.title} ({self.release_year})>'
