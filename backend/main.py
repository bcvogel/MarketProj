from fastapi import FastAPI, HTTPException, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from models import Stock, User as DBUser, Transaction, Portfolio, CashAccount
from pydantic import BaseModel
from typing import List
from datetime import datetime, time
import asyncio
from passlib.hash import bcrypt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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
