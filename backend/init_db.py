from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, Stock, Portfolio, Transaction
from passlib.hash import bcrypt

# Create tables
Base.metadata.create_all(bind=engine)

def seed_data():
    db: Session = SessionLocal()

    # Add sample users
    users = [
        User(
            full_name="Admin User",
            username="Admin",
            password_hash=bcrypt.hash("Password123"),
            email="admin@example.com",
            role="Administrator",
            balance=999999.0
        ),
        User(
            full_name="Broc Vogel",
            username="broc",
            password_hash=bcrypt.hash("password123"),
            email="broc@example.com",
            role="Customer",
            balance=10000.0
        ),
        User(
            full_name="John Doe",
            username="john_doe",
            password_hash=bcrypt.hash("password456"),
            email="john@example.com",
            role="Customer",
            balance=15000.0
        )
    ]
    db.add_all(users)
    db.commit()  # Commit before querying for 'broc'

    # Add sample stocks
    stocks = [
        Stock(
            ticker="AAPL",
            company_name="Apple Inc.",
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
            current_price=2800.0,
            initial_price=2750.0,
            daily_high=2850.0,
            daily_low=2700.0,
            market_cap=1_500_000_000_000.0,
            volume=4000
        ),
    ]
    db.add_all(stocks)
    db.commit()  # Commit again before querying stocks

    # Now safe to query broc and the stocks
    broc = db.query(User).filter_by(username="broc").first()
    aapl = db.query(Stock).filter_by(ticker="AAPL").first()
    tsla = db.query(Stock).filter_by(ticker="TSLA").first()

    portfolio_entries = [
        Portfolio(
            user_id=broc.id,
            stock_id=aapl.id,
            quantity=5,
            purchase_price=aapl.current_price,
            current_value=5 * aapl.current_price
        ),
        Portfolio(
            user_id=broc.id,
            stock_id=tsla.id,
            quantity=3,
            purchase_price=tsla.current_price,
            current_value=3 * tsla.current_price
        )
    ]

    transactions = [
        Transaction(
            user_id=broc.id,
            stock_id=aapl.id,
            transaction_type="BUY",
            quantity=5,
            price_per_share=aapl.current_price,
            total_amount=5 * aapl.current_price
        ),
        Transaction(
            user_id=broc.id,
            stock_id=tsla.id,
            transaction_type="BUY",
            quantity=3,
            price_per_share=tsla.current_price,
            total_amount=3 * tsla.current_price
        )
    ]

    db.add_all(portfolio_entries)
    db.add_all(transactions)

    db.commit()
    db.close()
    print("Database initialized with sample data!")

if __name__ == "__main__":
    seed_data()

