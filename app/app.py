from flask import Flask, make_response, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from dotenv import load_dotenv
import os
from datetime import timedelta
       
load_dotenv()
      
app = Flask(__name__)

#configuration     
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET_KEY') 
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24) # Token expires in 24 hours

# Initialize extensions
db = SQLAlchemy(app)
api = Api(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

migrate = Migrate(app, db)

# Imports models after initializing db to avoid circular imports
from models.user import User
from models.club import Club
from models.movie import Movie
from models.post import Post
from models.review import Review
from models.club_member import ClubMember
from models.follower import Follower

# error handling   
@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'errors': ['Not Found']}), 404)

@app.errorhandler(400)
def bad_request(error):
    return make_response(jsonify({'errors': ['Bad Request']}), 400)

@app.errorhandler(Exception)
def handle_exception(e):      
    db.session.rollback() # Rollback the session in case of a database error
    return make_response(jsonify({'message': f'An unexpected error occurred: {str(e)}'}), 500)

        
#simple root route for testing
@app.route('/')
def index():
    return jsonify(message="Welcome to the TV Series & Movies Club API!")

        