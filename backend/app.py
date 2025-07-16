from flask import Flask, make_response, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from datetime import timedelta

load_dotenv()
app = Flask(__name__)

# configurations
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

#extensions
db = SQLAlchemy(app)
api = Api(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# error handler
@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'errors': ['Not Found']}), 404)

@app.errorhandler(400)
def bad_request(error):
    return make_response(jsonify({'errors': ['Bad Request']}), 400)

@app.errorhandler(Exception)
def handle_exception(e):
    db.session.rollback()# Rollback the session in case of an exception or database error
    return make_response(jsonify({'message': f'An unexpected error occurred: {str(e)}'}), 500)

# import routes



@app.route('/')
def index():
    return jsonify(message="Welcome to the TV Series & Movies Club API!")