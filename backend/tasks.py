import asyncio
import random
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Stock
from datetime import datetime


async def update_stock_prices():
    while True:
        db: Session = SessionLocal()

        try:
            stocks = db.query(Stock).all()

            for stock in stocks:
                # Simulate a small market change: ±0.5% to ±2%
                percent_change = random.uniform(-0.02, 0.02)
                new_price = round(stock.current_price * (1 + percent_change), 2)
                new_price = max(1.0, new_price)  # Ensure price never drops below $1

                # Update stock price
                stock.current_price = new_price

                # Update daily high/low
                if new_price > stock.daily_high:
                    stock.daily_high = new_price
                if new_price < stock.daily_low:
                    stock.daily_low = new_price

                db.add(stock)

                print(f"[{datetime.now().strftime('%H:%M:%S')}] {stock.ticker} updated to ${new_price} | High: ${stock.daily_high}, Low: ${stock.daily_low}")

            db.commit()

        except Exception as e:
            print(f"[ERROR updating stock prices]: {e}")
            db.rollback()

        finally:
            db.close()

        await asyncio.sleep(60)