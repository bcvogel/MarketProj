from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List
import random
from datetime import datetime, time, date

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database
users_db = {
    "Admin": {
        "password": "Password123",
        "balance": 999999,
        "stocks": {},
        "role": "Administrator"
    },
    "testuser": {
        "password": "testpass",
        "balance": 10000,
        "stocks": {},
        "role": "Customer"
    }
}

stocks_db = {
    "AAPL": {"name": "Apple Inc.", "price": random.uniform(100, 200)},
    "GOOGL": {"name": "Alphabet Inc.", "price": random.uniform(2000, 3000)},
    "AMZN": {"name": "Amazon.com Inc.", "price": random.uniform(3000, 4000)},
}

# Market schedule configuration
market_schedule = {
    "open_time": time(9, 30),
    "close_time": time(16, 0),
    "holidays": set(),
    "is_open": True
}

# Auth
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str

class StockTransaction(BaseModel):
    stock: str
    amount: int
    user: str

class CreateStockRequest(BaseModel):
    company_name: str
    ticker: str
    volume: int
    initial_price: float

class MarketHoursRequest(BaseModel):
    open_time: str  # "09:30"
    close_time: str  # "16:00"

# Auth dependencies
def get_current_user(token: str = Depends(oauth2_scheme)):
    user = users_db.get(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

def admin_required(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "Administrator":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Market logic
def is_market_open():
    now = datetime.now()
    current_time = now.time()
    if now.weekday() >= 5:
        return False
    if now.date() in market_schedule["holidays"]:
        return False
    if not market_schedule["is_open"]:
        return False
    if not (market_schedule["open_time"] <= current_time <= market_schedule["close_time"]):
        return False
    return True

# Routes
@app.get("/")
def read_root():
    print("Available users:", list(users_db.keys()))
    return {"message": "Stock Trading App API is running!"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_db.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"access_token": form_data.username, "token_type": "bearer"}

@app.post("/register")
def register_user(user: UserRegister):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")

    users_db[user.username] = {
        "password": user.password,
        "balance": 10000,
        "stocks": {},
        "role": "Customer"
    }
    return {"message": f"User '{user.username}' registered successfully."}

@app.get("/stocks", response_model=List[dict])
def get_stocks():
    return [{"ticker": ticker, "name": data["name"], "price": round(data["price"], 2)} for ticker, data in stocks_db.items()]

@app.post("/buy")
def buy_stock(transaction: StockTransaction):
    if not is_market_open():
        raise HTTPException(status_code=403, detail="Market is currently closed.")

    user = users_db.get(transaction.user)
    stock = stocks_db.get(transaction.stock)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    cost = transaction.amount * stock["price"]
    if user["balance"] < cost:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    user["balance"] -= cost
    user["stocks"][transaction.stock] = user["stocks"].get(transaction.stock, 0) + transaction.amount

    return {"message": f"Bought {transaction.amount} shares of {transaction.stock}", "remaining_balance": user["balance"]}

@app.post("/sell")
def sell_stock(transaction: StockTransaction):
    if not is_market_open():
        raise HTTPException(status_code=403, detail="Market is currently closed.")

    user = users_db.get(transaction.user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if transaction.stock not in user["stocks"] or user["stocks"][transaction.stock] < transaction.amount:
        raise HTTPException(status_code=400, detail="Not enough shares to sell")

    stock = stocks_db.get(transaction.stock)
    user["stocks"][transaction.stock] -= transaction.amount
    user["balance"] += transaction.amount * stock["price"]

    return {"message": f"Sold {transaction.amount} shares of {transaction.stock}", "new_balance": user["balance"]}

@app.post("/admin/create-stock")
def create_stock(stock: CreateStockRequest, user: dict = Depends(admin_required)):
    if stock.ticker in stocks_db:
        raise HTTPException(status_code=400, detail="Stock already exists")

    stocks_db[stock.ticker] = {
        "name": stock.company_name,
        "price": stock.initial_price,
        "volume": stock.volume
    }

    return {"message": f"Stock '{stock.ticker}' created successfully."}

@app.post("/admin/set-market-hours")
def set_market_hours(hours: MarketHoursRequest, user: dict = Depends(admin_required)):
    try:
        market_schedule["open_time"] = datetime.strptime(hours.open_time, "%H:%M").time()
        market_schedule["close_time"] = datetime.strptime(hours.close_time, "%H:%M").time()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid time format. Use HH:MM (24-hour clock).")

    return {"message": f"Market hours updated to {hours.open_time} - {hours.close_time}"}

@app.post("/admin/toggle-market")
def toggle_market(is_open: bool, user: dict = Depends(admin_required)):
    market_schedule["is_open"] = is_open
    return {"message": f"Market is now {'open' if is_open else 'closed'}."}

@app.post("/admin/add-holiday")
def add_holiday(holiday: str, user: dict = Depends(admin_required)):
    try:
        holiday_date = datetime.strptime(holiday, "%Y-%m-%d").date()
        market_schedule["holidays"].add(holiday_date)
        return {"message": f"Holiday {holiday_date} added."}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
