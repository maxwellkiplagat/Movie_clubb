from app import app, db
from flask_migrate import Migrate
# from models.user import User
# from models.club import Club
# from models.movie import Movie
# from models.post import Post
# from models.review import Review
# from models.club_member import ClubMember
# from models.follower import Follower

migrate = Migrate(app, db)

if __name__ == '__main__':
    app.run(port=5555, debug=True)  