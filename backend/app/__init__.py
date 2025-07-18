import os
from flask import Flask, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

# Initialize extensions
db = SQLAlchemy()
api = Api()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET_KEY')
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

    # Initialize extensions with app
    db.init_app(app)
    api.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Import and register blueprints
    from .models.user import User
    from .models.club import Club
    from .models.movie import Movie
    #from .models.post import Post
    #from .models.review import Review
    #from .models.watchlist import Watchlist # Assuming this is the correct name for watchlist.py's model
    #from .models.follow import Follow # Assuming this is the correct name for follow.py's model')
    from .routes.auth_routes import UserRegistration, UserLogin, CheckSession

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return make_response(jsonify({'errors': ['Not Found']}), 404)

    @app.errorhandler(400)
    def bad_request(error):
        return make_response(jsonify({'errors': ['Bad Request']}), 400)

    @app.errorhandler(Exception)
    def handle_exception(e):
        db.session.rollback()
        return make_response(jsonify({'message': f'Unexpected error: {str(e)}'}), 500)

     # Simple root route
    @app.route('/')
    def index():
        return jsonify(message="Welcome to the TV Series & Movies Club API!")
    
    api.add_resource(UserRegistration, '/register')
    api.add_resource(UserLogin, '/login')
    api.add_resource(CheckSession, '/check_session')

    return app