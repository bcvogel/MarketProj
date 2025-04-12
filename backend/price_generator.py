import time
import random
from database import SessionLocal
from models import Stock

def update_stock_prices():
    db = SessionLocal()
    stocks = db.query(Stock).all()

    for stock in stocks:
        change = random.uniform(-0.05, 0.05)  # +/-5% fluctuation
        stock.price = max(1, stock.price * (1 + change))
        db.commit()

    db.close()

if __name__ == "__main__":
    while True:
        update_stock_prices()
        time.sleep(60)  # Update every minute