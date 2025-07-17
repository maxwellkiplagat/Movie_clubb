from  ..import db
# from .user import User
# from .club import Club
# from .movie import Movie
# from .post import Post
# from .review import Review
# from .club_member import ClubMember
# from .follower import Follower

class BaseModelMixin(db.Model):
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())
