from flask import Flask, jsonify

def create_app():
    app = Flask(__name__)

    @app.route("/")
    def index():
        return jsonify({"message": "Welcome to the TV Series & Movies Club API"})

   

    return app
