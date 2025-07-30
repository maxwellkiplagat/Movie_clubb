from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin # Assuming BaseModelMixin is used

class Watchlist(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'watchlists'

    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=False)

    
    __table_args__ = (db.UniqueConstraint('user_id', 'movie_id', name='_user_movie_watchlist_uc'),)

    # Relationships
    user = db.relationship('User', back_populates='watchlists', foreign_keys=[user_id])
    movie = db.relationship('Movie', back_populates='watchlists', foreign_keys=[movie_id])
    
    serialize_rules = (
        '-created_at',
        '-updated_at',
        '-user.watchlists', # FIX: Changed from '-user.watchlist_entries' to '-user.watchlists'
        '-movie.watchlists', # Exclude recursion from movie back to watchlist
        'user.username',     # Include username of the user
        'movie.title',       # Include title of the movie
    )

    def __repr__(self):
        return f'<Watchlist User:{self.user_id} Movie:{self.movie_id}>'
