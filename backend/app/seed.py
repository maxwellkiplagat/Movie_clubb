import os
from dotenv import load_dotenv
from app import app, db, bcrypt
# from models.user import User
# from models.club import Club
# from models.movie import Movie
from faker import Faker

load_dotenv()
fake = Faker()

def seed_database():
    with app.app_context():
        print("Clearing existing data...")
        # Delete all data from tables (order matters for foreign keys)
        # db.session.query(User).delete()
        # db.session.query(Club).delete()
        # db.session.query(Movie).delete()
        db.session.commit()
        print ("Database cleared.")

        print("Seeding users...")
        # users = []
        # for _ in range(5):
        #     user = User(
        #         username=fake.user_name(),
        #         email=fake.email(),
        #         _password_hash=bcrypt.generate_password_hash("password".encode('utf-8')).decode('utf-8')

        #     users.append(user) # Add user to list AFTER adding to session if you need its ID later
        #     db.session.add(user)
        # db.session.commit() # Commit in loop if you need IDs immediately, otherwise commit once outside
        # print(f"Seeded {len(users)} users.")

        print("Seeding clubs...")
        # clubs = []
        # genres = ["Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Thriller", "Fantasy"]
        # for _ in range(3):
        #     club = Club(
        #         name=f"{fake.word().capitalize()} {fake.word().capitalize()} Club",
        #         genre=fake.random_element(elements=genres),
        #         description=fake.paragraph(nb_sentences=3),
        #         created_by_user_id=fake.random_element(elements=[u.id for u in users]) # Requires users list
        #     )
        #     clubs.append(club)
        #     db.session.add(club)
        # db.session.commit()
        # print(f"Seeded {len(clubs)} clubs.")

        print("Seeding movies...")
        # movies = []
        # for _ in range(10):
        #     movie = Movie(
        #         title=fake.catch_phrase(),
        #         genre=fake.random_element(elements=genres),
        #         release_year=fake.year(),
        #         director=fake.name(),
        #         description=fake.paragraph(nb_sentences=2)
        #     )
        #     movies.append(movie)
        #     db.session.add(movie)
        # db.session.commit()
        # print(f"Seeded {len(movies)} movies.")

        print("Seeding completed successfully!")
if __name__ == "__main__":
    seed_database()