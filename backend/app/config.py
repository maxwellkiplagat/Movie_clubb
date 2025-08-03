import os
SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///movies.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
