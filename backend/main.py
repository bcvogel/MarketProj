from fastapi import FastAPI, HTTPException, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from models import Stock, User as DBUser, Transaction, Portfolio, CashAccount, MarketSchedule
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
from pytz import timezone, utc
from contextlib import asynccontextmanager
import asyncio
from passlib.hash import bcrypt
from jose import JWTError, jwt

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(update_stock_prices())
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "your-super-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(DBUser).filter_by(username=username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

from datetime import datetime, time
from pytz import timezone, utc
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models import MarketSchedule

def check_market_open(db: Session):
    local_tz = timezone("America/New_York")
    now = datetime.now(utc).astimezone(local_tz)

    current_time = now.time()
    today = now.date().strftime("%Y-%m-%d")

    schedule = db.query(MarketSchedule).first()
    if not schedule:
        raise HTTPException(status_code=503, detail="Market schedule not configured.")

    # **NEW!** Check manual override first
    if schedule.force_open:
        print("[Market Check] Market manually forced open.")
        return  # Market is open no matter what

    # Continue normal checks...
    def parse_time(value):
        return datetime.strptime(value, "%H:%M" if len(value) == 5 else "%H:%M:%S").time() if isinstance(value, str) else value

    open_time = parse_time(schedule.open_time)
    close_time = parse_time(schedule.close_time)
    holiday_list = set(schedule.holidays.split(",")) if schedule.holidays else set()

    print(f"[Market Check] Now: {current_time}, Open: {open_time}, Close: {close_time}, Today: {today}")
    print(f"[Market Check] is_open: {schedule.is_open}, Holidays: {holiday_list}")
    print(f"Types: open_time={type(open_time)}, close_time={type(close_time)}, now={type(current_time)}")

    if not schedule.is_open:
        raise HTTPException(status_code=403, detail="Market is currently closed by administrator.")
    if now.weekday() >= 5:
        raise HTTPException(status_code=403, detail="Market is closed on weekends.")
    if today in holiday_list:
        raise HTTPException(status_code=403, detail="Market is closed for a holiday.")
    if not (open_time <= current_time <= close_time):
        raise HTTPException(status_code=403, detail="Market is currently closed (outside market hours).")

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

class CashTransaction(BaseModel):
    username: str
    amount: float

class MarketToggleRequest(BaseModel):
    status: bool

class HolidayRequest(BaseModel):
    date: str

def require_admin(user: DBUser):
    if user.role != "Administrator":
        raise HTTPException(status_code=403, detail="Admin privileges required.")

@app.post("/market/toggle")
def toggle_market(req: MarketToggleRequest, current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    require_admin(current_user)
    schedule = db.query(MarketSchedule).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Market schedule not found")
    schedule.is_open = req.status
    db.commit()
    return {"message": f"Market is now {'open' if req.status else 'closed'}."}

@app.post("/market/force-open")
def force_open_market(current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    require_admin(current_user)
    schedule = db.query(MarketSchedule).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Market schedule not found")
    schedule.force_open = True
    db.commit()
    return {"message": "Market manually forced open."}

@app.post("/market/force-close")
def force_close_market(current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    require_admin(current_user)
    schedule = db.query(MarketSchedule).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Market schedule not found")
    schedule.force_open = False
    db.commit()
    return {"message": "Market manual override turned OFF. Market now follows normal schedule."}

@app.get("/market/schedule")
def get_market_schedule(db: Session = Depends(get_db)):
    schedule = db.query(MarketSchedule).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Market schedule not found")
    return {
        "is_open": schedule.is_open,
        "open_time": schedule.open_time,
        "close_time": schedule.close_time,
        "holidays": sorted(schedule.holidays.split(",")) if schedule.holidays else []
    }

@app.post("/market/hours")
def set_market_hours(hours: MarketHoursRequest, current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    require_admin(current_user)
    schedule = db.query(MarketSchedule).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Market schedule not found")
    try:
        datetime.strptime(hours.open_time, "%H:%M")
        datetime.strptime(hours.close_time, "%H:%M")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid time format (use HH:MM).")
    schedule.open_time = hours.open_time
    schedule.close_time = hours.close_time
    db.commit()
    return {"message": "Market hours updated successfully."}

@app.post("/market/holiday")
def add_market_holiday(holiday: HolidayRequest, current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    require_admin(current_user)
    schedule = db.query(MarketSchedule).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Market schedule not found")
    try:
        datetime.strptime(holiday.date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format (use YYYY-MM-DD).")
    holidays = set(schedule.holidays.split(",")) if schedule.holidays else set()
    holidays.add(holiday.date)
    schedule.holidays = ",".join(sorted(holidays))
    db.commit()
    return {"message": f"{holiday.date} added as a market holiday."}

@app.post("/stocks")
def create_stock(stock: CreateStockRequest, current_user: DBUser = Depends(get_current_user)):
    require_admin(current_user)
    db = SessionLocal()

    existing = db.query(Stock).filter_by(ticker=stock.ticker).first()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="Ticker already exists.")

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
    db.refresh(new_stock)
    db.close()

    return {"message": f"Stock '{new_stock.ticker}' created successfully."}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    user = db.query(DBUser).filter_by(username=form_data.username).first()
    if not user or not bcrypt.verify(form_data.password, user.password_hash):
        db.close()
        raise HTTPException(status_code=401, detail="Invalid username or password")
    access_token = create_access_token(data={"sub": user.username})
    db.close()
    return {"access_token": access_token, "token_type": "bearer"}

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
        role="Customer"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_cash = CashAccount(user_id=new_user.id, balance=10000.0)
    db.add(new_cash)
    db.commit()
    db.close()
    return {"message": f"User '{user.username}' registered successfully."}

@app.post("/buy")
def buy_stock(txn: StockTransaction, db: Session = Depends(get_db)):
    check_market_open(db)
    user = db.query(DBUser).filter_by(username=txn.username).first()
    stock = db.query(Stock).filter_by(ticker=txn.stock).first()
    if not user or not stock:
        raise HTTPException(status_code=404, detail="User or Stock not found")

    cost = stock.current_price * txn.amount
    if user.cash_account.balance < cost:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    user.cash_account.balance -= cost

    portfolio = db.query(Portfolio).filter_by(user_id=user.id, stock_id=stock.id).first()
    if portfolio:
        portfolio.quantity += txn.amount
        portfolio.current_value += cost
    else:
        new_entry = Portfolio(
            user_id=user.id,
            stock_id=stock.id,
            quantity=txn.amount,
            purchase_price=stock.current_price,
            current_value=cost
        )
        db.add(new_entry)

    txn_record = Transaction(
        user_id=user.id,
        stock_id=stock.id,
        transaction_type="Buy",
        quantity=txn.amount,
        price_per_share=stock.current_price,
        total_amount=cost
    )
    db.add(txn_record)
    db.commit()
    return {"message": f"Bought {txn.amount} shares of {txn.stock}"}

@app.post("/sell")
def sell_stock(txn: StockTransaction, db: Session = Depends(get_db)):
    check_market_open(db)
    user = db.query(DBUser).filter_by(username=txn.username).first()
    stock = db.query(Stock).filter_by(ticker=txn.stock).first()
    if not user or not stock:
        raise HTTPException(status_code=404, detail="User or Stock not found")

    portfolio = db.query(Portfolio).filter_by(user_id=user.id, stock_id=stock.id).first()
    if not portfolio or portfolio.quantity < txn.amount:
        raise HTTPException(status_code=400, detail="Not enough shares to sell")

    proceeds = stock.current_price * txn.amount
    portfolio.quantity -= txn.amount
    portfolio.current_value -= proceeds
    user.cash_account.balance += proceeds

    if portfolio.quantity == 0:
        db.delete(portfolio)

    txn_record = Transaction(
        user_id=user.id,
        stock_id=stock.id,
        transaction_type="Sell",
        quantity=txn.amount,
        price_per_share=stock.current_price,
        total_amount=proceeds
    )
    db.add(txn_record)
    db.commit()
    return {"message": f"Sold {txn.amount} shares of {txn.stock}"}

@app.get("/users/me")
def read_users_me(current_user: DBUser = Depends(get_current_user)):
    if not current_user.cash_account:
        return {"username": current_user.username, "balance": 0.0}
    return {
        "username": current_user.username,
        "balance": round(current_user.cash_account.balance, 2)
    }

@app.get("/stocks")
def get_all_stocks(db: Session = Depends(get_db)):
    stocks = db.query(Stock).all()
    return [
        {
            "id": s.id,
            "company_name": s.company_name,
            "ticker": s.ticker,
            "current_price": s.current_price,
            "volume": s.volume,
            "initial_price": s.initial_price,
            "daily_high": s.daily_high,
            "daily_low": s.daily_low,
            "market_cap": s.volume * s.current_price if s.volume and s.current_price else None
        } for s in stocks
    ]

@app.get("/account/{username}")
def get_account(username: str, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter_by(username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "full_name": user.full_name,
        "username": user.username,
        "email": user.email,
        "balance": round(user.cash_account.balance, 2) if user.cash_account else 0.0,
        "role": user.role,
        "created_at": user.created_at.isoformat()
    }

@app.get("/portfolio/{username}")
def get_portfolio(username: str, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter_by(username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    portfolio = (
        db.query(Portfolio, Stock)
        .join(Stock, Portfolio.stock_id == Stock.id)
        .filter(Portfolio.user_id == user.id)
        .all()
    )

    return [
        {
            "stock_name": stock.company_name,
            "ticker": stock.ticker,
            "quantity": p.quantity,
            "purchase_price": p.purchase_price,
            "current_value": p.current_value
        } for p, stock in portfolio
    ]

@app.get("/cash/{username}")
def get_cash_balance(username: str):
    db = SessionLocal()
    user = db.query(DBUser).filter_by(username=username).first()
    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")
    cash = user.cash_account
    db.close()
    if not cash:
        return {"balance": 0.0}
    return {"balance": round(cash.balance, 2)}

@app.get("/transactions/{username}")
def get_user_transactions(username: str, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter_by(username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    transactions = (
        db.query(Transaction, Stock)
        .join(Stock, Stock.id == Transaction.stock_id)
        .filter(Transaction.user_id == user.id)
        .all()
    )

    return [
        {
            "id": t.id,
            "transaction_type": t.transaction_type,
            "quantity": t.quantity,
            "price_per_share": t.price_per_share,
            "total_amount": t.total_amount,
            "timestamp": t.timestamp,
            "stock_ticker": s.ticker,
        }
        for t, s in transactions
    ]

@app.post("/cash/deposit")
def deposit_cash(txn: CashTransaction):
    db = SessionLocal()
    user = db.query(DBUser).filter_by(username=txn.username).first()
    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")
    if user.cash_account:
        user.cash_account.balance += txn.amount
    else:
        user.cash_account = CashAccount(user_id=user.id, balance=txn.amount)
    db.commit()
    db.close()
    return {"message": f"${txn.amount:.2f} deposited successfully"}

@app.post("/cash/withdraw")
def withdraw_cash(txn: CashTransaction):
    db = SessionLocal()
    user = db.query(DBUser).filter_by(username=txn.username).first()
    if not user or not user.cash_account:
        db.close()
        raise HTTPException(status_code=404, detail="Cash account not found")
    if user.cash_account.balance < txn.amount:
        db.close()
        raise HTTPException(status_code=400, detail="Insufficient funds")
    user.cash_account.balance -= txn.amount
    db.commit()
    db.close()
    return {"message": f"${txn.amount:.2f} withdrawn successfully"}

from tasks import update_stock_prices