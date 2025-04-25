from sqlalchemy.orm import Session 
from database import SessionLocal, engine
from models import Base, User, Stock, Portfolio, Transaction, CashAccount, MarketSchedule
from passlib.hash import bcrypt

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def seed_data():
    db: Session = SessionLocal()

    # Step 1: Insert users one-by-one only if they don't already exist
    sample_users = [
        {
            "full_name": "Admin User",
            "username": "Admin",
            "password": "Password123",
            "email": "admin@example.com",
            "role": "Administrator",
            "balance": 999999.0
        },
        {
            "full_name": "Broc Vogel",
            "username": "broc",
            "password": "password123",
            "email": "broc@example.com",
            "role": "Customer",
            "balance": 10000.0
        },
        {
            "full_name": "John Doe",
            "username": "john_doe",
            "password": "password456",
            "email": "john@example.com",
            "role": "Customer",
            "balance": 15000.0
        }
    ]

    for user_data in sample_users:
        existing_user = db.query(User).filter_by(username=user_data["username"]).first()
        if not existing_user:
            new_user = User(
                full_name=user_data["full_name"],
                username=user_data["username"],
                password_hash=bcrypt.hash(user_data["password"]),
                email=user_data["email"],
                role=user_data["role"],
                balance=user_data["balance"]
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            # Add cash account only for new users
            db.add(CashAccount(user_id=new_user.id, balance=new_user.balance))
            db.commit()

    # Step 2: Add stocks if missing
    existing_tickers = {s.ticker for s in db.query(Stock).all()}
    stock_data = [
        ("AAPL", "Apple Inc.", 150.0, 145.0, 155.0, 140.0, 2_000_000_000_000.0, 10000),
        ("TSLA", "Tesla Inc.", 900.0, 850.0, 920.0, 840.0, 800_000_000_000.0, 5000),
        ("AMZN", "Amazon.com Inc.", 3200.0, 3100.0, 3250.0, 3000.0, 1_700_000_000_000.0, 3000),
        ("GOOGL", "Alphabet Inc.", 2800.0, 2750.0, 2850.0, 2700.0, 1_500_000_000_000.0, 4000)
    ]

    for ticker, name, current, initial, high, low, cap, volume in stock_data:
        if ticker not in existing_tickers:
            stock = Stock(
                ticker=ticker,
                company_name=name,
                current_price=current,
                initial_price=initial,
                daily_high=high,
                daily_low=low,
                market_cap=cap,
                volume=volume
            )
            db.add(stock)
    db.commit()

    if not db.query(MarketSchedule).first():
        default_schedule = MarketSchedule(
        is_open=True,
        open_time="09:30",
        close_time="16:00",
        holidays="2025-12-25,2025-07-04"
    )
    db.add(default_schedule)
    db.commit()

    # Step 3: Add Broc's portfolio and transactions
    broc = db.query(User).filter_by(username="broc").first()
    aapl = db.query(Stock).filter_by(ticker="AAPL").first()
    tsla = db.query(Stock).filter_by(ticker="TSLA").first()

    if not db.query(Portfolio).filter_by(user_id=broc.id).first():
        db.add_all([
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
        ])
        db.commit()

    if not db.query(Transaction).filter_by(user_id=broc.id).first():
        db.add_all([
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
        ])
        db.commit()

    db.close()
    print("Database initialized with sample data!")

if __name__ == "__main__":
    seed_data()
