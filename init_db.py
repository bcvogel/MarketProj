from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, Stock
import random

# Create tables
Base.metadata.create_all(bind=engine)

def seed_data():
    db: Session = SessionLocal()

    # Add sample users
    users = [
        User(username="broc", email="broc@example.com", balance=10000.0),
        User(username="john_doe", email="john@example.com", balance=15000.0),
    ]
    db.add_all(users)

    # Add sample stocks
    stocks = [
        Stock(ticker="AAPL", company_name="Apple Inc.", price=150.0, volume=10000),
        Stock(ticker="TSLA", company_name="Tesla Inc.", price=900.0, volume=5000),
        Stock(ticker="AMZN", company_name="Amazon.com Inc.", price=3200.0, volume=3000),
        Stock(ticker="GOOGL", company_name="Alphabet Inc.", price=2800.0, volume=4000),
    ]
    db.add_all(stocks)

    db.commit()
    db.close()
    print("Database initialized with sample data!")

if __name__ == "__main__":
    seed_data()