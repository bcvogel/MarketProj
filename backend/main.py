from fastapi import FastAPI, HTTPException, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from models import Stock, User as DBUser, Transaction, Portfolio
from pydantic import BaseModel
from typing import List
from datetime import datetime, time
import asyncio
from passlib.hash import bcrypt

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Market settings
market_schedule = {
    "open_time": time(9, 30),
    "close_time": time(16, 0),
    "holidays": set(),
    "is_open": True
}

# Models
class StockTransaction(BaseModel):
    stock: str
    amount: int
    username: str

class CreateStockRequest(BaseModel):
    company_name: str
    ticker: str
    volume: int
    initial_price: float

class MarketHoursRequest(BaseModel):
    open_time: str
    close_time: str

class UserRegister(BaseModel):
    full_name: str
    username: str
    password: str
    email: str

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    user = db.query(DBUser).filter_by(username=form_data.username).first()
    db.close()
    if not user or not bcrypt.verify(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"access_token": user.username, "token_type": "bearer"}

@app.post("/register")
def register_user(user: UserRegister):
    db = SessionLocal()
    existing_user = db.query(DBUser).filter_by(username=user.username).first()
    if existing_user:
        db.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    new_user = DBUser(
        full_name=user.full_name,
        username=user.username,
        password_hash=bcrypt.hash(user.password),
        email=user.email,
        role="Customer",
        balance=10000.0
    )
    db.add(new_user)
    db.commit()
    db.close()
    return {"message": f"User '{user.username}' registered successfully."}

def get_current_user(token: str = Depends(oauth2_scheme)):
    db = SessionLocal()
    user = db.query(DBUser).filter_by(username=token).first()
    db.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

def admin_required(current_user: DBUser = Depends(get_current_user)):
    if current_user.role != "Administrator":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def is_market_open():
    now = datetime.now()
    current_time = now.time()
    if now.weekday() >= 5 or now.date() in market_schedule["holidays"]:
        return False
    if not market_schedule["is_open"]:
        return False
    if not (market_schedule["open_time"] <= current_time <= market_schedule["close_time"]):
        return False
    return True

@app.get("/")
def read_root():
    return {"message": "Stock Trading App API is running!"}

@app.get("/stocks")
def get_stocks(db: Session = Depends(get_db)):
    stocks = db.query(Stock).all()
    return [
        {
            "ticker": s.ticker,
            "name": s.company_name,
            "price": round(s.current_price, 2),
            "high": round(s.daily_high, 2),
            "low": round(s.daily_low, 2)
        } for s in stocks
    ]

@app.get("/account/{username}")
def get_account_info(username: str, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at,
        "balance": user.balance
    }

@app.get("/portfolio/{username}")
def get_portfolio(username: str, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    portfolio = []
    for entry in user.portfolio:
        stock = db.query(Stock).filter(Stock.id == entry.stock_id).first()
        if stock:
            portfolio.append({
                "stock_name": stock.company_name,
                "ticker": stock.ticker,
                "quantity": entry.quantity,
                "purchase_price": entry.purchase_price,
                "current_value": entry.current_value
            })
    return portfolio

@app.get("/transactions/{username}")
def get_user_transactions(username: str, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    txns = db.query(Transaction).filter(Transaction.user_id == user.id).order_by(Transaction.timestamp.desc()).all()
    return [
        {
            "transaction_type": txn.transaction_type,
            "ticker": db.query(Stock).filter(Stock.id == txn.stock_id).first().ticker,
            "quantity": txn.quantity,
            "price_per_share": txn.price_per_share,
            "total_amount": txn.total_amount,
            "timestamp": txn.timestamp
        } for txn in txns
    ]

@app.post("/buy")
def buy_stock(transaction: StockTransaction, db: Session = Depends(get_db)):
    if not is_market_open():
        raise HTTPException(status_code=403, detail="Market is currently closed.")
    user = db.query(DBUser).filter_by(username=transaction.username).first()
    stock = db.query(Stock).filter_by(ticker=transaction.stock).first()
    if not user or not stock:
        raise HTTPException(status_code=404, detail="User or stock not found")
    cost = transaction.amount * stock.current_price
    if user.balance < cost:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    user.balance -= cost
    portfolio_entry = db.query(Portfolio).filter_by(user_id=user.id, stock_id=stock.id).first()
    if portfolio_entry:
        portfolio_entry.quantity += transaction.amount
        portfolio_entry.current_value = portfolio_entry.quantity * stock.current_price
    else:
        portfolio_entry = Portfolio(
            user_id=user.id,
            stock_id=stock.id,
            quantity=transaction.amount,
            purchase_price=stock.current_price,
            current_value=transaction.amount * stock.current_price
        )
        db.add(portfolio_entry)
    txn = Transaction(
        user_id=user.id,
        stock_id=stock.id,
        transaction_type="BUY",
        quantity=transaction.amount,
        price_per_share=stock.current_price,
        total_amount=cost
    )
    db.add(txn)
    db.commit()
    return {"message": f"Bought {transaction.amount} shares of {transaction.stock}"}

@app.post("/sell")
def sell_stock(transaction: StockTransaction, db: Session = Depends(get_db)):
    if not is_market_open():
        raise HTTPException(status_code=403, detail="Market is currently closed.")
    user = db.query(DBUser).filter_by(username=transaction.username).first()
    stock = db.query(Stock).filter_by(ticker=transaction.stock).first()
    portfolio_entry = db.query(Portfolio).filter_by(user_id=user.id, stock_id=stock.id).first()
    if not user or not stock or not portfolio_entry:
        raise HTTPException(status_code=404, detail="Required data not found")
    if portfolio_entry.quantity < transaction.amount:
        raise HTTPException(status_code=400, detail="Not enough shares to sell")
    proceeds = transaction.amount * stock.current_price
    user.balance += proceeds
    portfolio_entry.quantity -= transaction.amount
    portfolio_entry.current_value = portfolio_entry.quantity * stock.current_price
    txn = Transaction(
        user_id=user.id,
        stock_id=stock.id,
        transaction_type="SELL",
        quantity=transaction.amount,
        price_per_share=stock.current_price,
        total_amount=proceeds
    )
    db.add(txn)
    db.commit()
    return {"message": f"Sold {transaction.amount} shares of {transaction.stock}"}

@app.post("/admin/create-stock")
def create_stock(stock: CreateStockRequest, user: DBUser = Depends(admin_required), db: Session = Depends(get_db)):
    existing = db.query(Stock).filter_by(ticker=stock.ticker).first()
    if existing:
        raise HTTPException(status_code=400, detail="Stock already exists")
    new_stock = Stock(
        company_name=stock.company_name,
        ticker=stock.ticker,
        volume=stock.volume,
        initial_price=stock.initial_price,
        current_price=stock.initial_price,
        daily_high=stock.initial_price,
        daily_low=stock.initial_price,
        market_cap=stock.volume * stock.initial_price
    )
    db.add(new_stock)
    db.commit()
    return {"message": f"Stock '{stock.ticker}' created successfully."}

@app.post("/admin/set-market-hours")
def set_market_hours(hours: MarketHoursRequest, user: DBUser = Depends(admin_required)):
    try:
        market_schedule["open_time"] = datetime.strptime(hours.open_time, "%H:%M").time()
        market_schedule["close_time"] = datetime.strptime(hours.close_time, "%H:%M").time()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid time format. Use HH:MM (24-hour clock).")
    return {"message": f"Market hours updated to {hours.open_time} - {hours.close_time}"}

@app.post("/admin/toggle-market")
def toggle_market(is_open: bool, user: DBUser = Depends(admin_required)):
    market_schedule["is_open"] = is_open
    return {"message": f"Market is now {'open' if is_open else 'closed'}."}

@app.post("/admin/add-holiday")
def add_holiday(holiday: str, user: DBUser = Depends(admin_required)):
    try:
        holiday_date = datetime.strptime(holiday, "%Y-%m-%d").date()
        market_schedule["holidays"].add(holiday_date)
        return {"message": f"Holiday {holiday_date} added."}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

from tasks import update_stock_prices

@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(update_stock_prices())
