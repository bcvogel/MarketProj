from fastapi import FastAPI, HTTPException, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from models import Stock, User as DBUser, Transaction, Portfolio, CashAccount
from pydantic import BaseModel
from typing import List
from datetime import datetime, time, timedelta
import asyncio
from passlib.hash import bcrypt
from jose import JWTError, jwt

app = FastAPI()

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

market_schedule = {
    "open_time": time(9, 30),
    "close_time": time(16, 0),
    "holidays": set(),
    "is_open": True
}

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
            "daily_high": s.daily_high,
            "daily_low": s.daily_low
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
        "role": user.role
    }

@app.get("/portfolio/{username}")
def get_portfolio(username: str, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter_by(username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    portfolio = db.query(Portfolio).filter_by(user_id=user.id).all()
    return [
        {
            "stock_id": p.stock_id,
            "quantity": p.quantity,
            "purchase_price": p.purchase_price,
            "current_value": p.current_value
        } for p in portfolio
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

@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(update_stock_prices())
