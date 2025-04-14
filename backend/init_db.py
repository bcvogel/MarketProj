from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, Stock
import random

# Create tables
Base.metadata.create_all(bind=engine)

def seed_data():
    db: Session = SessionLocal()

    # Add sample users
    users = users = [
    User(
        full_name="Broc Vogel",
        username="broc",
        password_hash="hashedpassword123",  # Replace with a real hash if you use auth
        email="broc@example.com",
        role="Customer",
        balance=10000.0
    ),
    User(
        full_name="John Doe",
        username="john_doe",
        password_hash="hashedpassword456",
        email="john@example.com",
        role="Customer",
        balance=15000.0
    )
]
    db.add_all(users)

    # Add sample stocks
    stocks = [
        Stock(
            ticker="AAPL",
            company_name="Apple Inc.",
            price=150.0,
            current_price=150.0,
            initial_price=145.0,
            daily_high=155.0,
            daily_low=140.0,
            market_cap=2_000_000_000_000.0,
            volume=10000
        ),
        Stock(
            ticker="TSLA",
            company_name="Tesla Inc.",
            price=900.0,
            current_price=900.0,
            initial_price=850.0,
            daily_high=920.0,
            daily_low=840.0,
            market_cap=800_000_000_000.0,
            volume=5000
        ),
        Stock(
            ticker="AMZN",
            company_name="Amazon.com Inc.",
            price=3200.0,
            current_price=3200.0,
            initial_price=3100.0,
            daily_high=3250.0,
            daily_low=3000.0,
            market_cap=1_700_000_000_000.0,
            volume=3000
        ),
        Stock(
            ticker="GOOGL",
            company_name="Alphabet Inc.",
            price=2800.0,
            current_price=2800.0,
            initial_price=2750.0,
            daily_high=2850.0,
            daily_low=2700.0,
            market_cap=1_500_000_000_000.0,
            volume=4000
        ),
    ]

    db.add_all(stocks)

    db.commit()
    db.close()
    print("Database initialized with sample data!")

if __name__ == "__main__":
    seed_data()