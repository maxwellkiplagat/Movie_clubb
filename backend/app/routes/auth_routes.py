from flask_restful import Resource
from flask import request, make_response, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from .. import db, bcrypt
from ..models.user import User

class UserRegistration(Resource):
    """
    API Resource for user registration.
    Handles POST requests to create a new user account.
    """
    def post(self):
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        #basic validation
        if not username or not email or not password:
            return {'message': 'Username, email, and password are required'}, 400 
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return {'message': 'Username already exists'}, 409
        if User.query.filter_by(email=email).first():
            return {'message': 'Email already exists'}, 409
        
        try:
            new_user = User(username=username, email=email)
            new_user.password_hash = password  
            db.session.add(new_user)
            db.session.commit()

            access_token = create_access_token(identity=new_user.id)
            return make_response(jsonify({
                'message': 'User registered successfully',
                'user_id': new_user.id,
                'username': new_user.username,
                'access_token': access_token
            }), 201) #new user created successfully
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error registering user: {str(e)}'}, 500 
        
class UserLogin(Resource):
    """
    API Resource for user login.
    Handles POST requests to authenticate a user and issue a JWT.
    """
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(username=username).first()

        if user and user.authenticate(password):
            access_token = create_access_token(identity=user.id)
            return make_response(jsonify({
                'message': 'Login successful',
                'user_id': user.id,
                'username': user.username,
                'access_token': access_token
            }), 200)
        else:
            return {'message': 'Invalid username or password'}, 401
        
class CheckSession(Resource):
    """
    API Resource to check if a user's session is active (i.e., if their JWT is valid).
    Handles GET requests and requires a valid JWT in the Authorization header.
    """
    @jwt_required() 
    def get(self):
            
        current_user_id = get_jwt_identity()
           
        user = User.query.get(current_user_id)

        if user:
                
            return make_response(jsonify({
                'message': 'Session active',
                'user_id': user.id,
                'username': user.username,
                'email': user.email 
            }), 200) 
        else:
                
            return {'message': 'User not found'}, 404     