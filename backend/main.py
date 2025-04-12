from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List
import random

app = FastAPI()

# CORS Configuration (Allow frontend to access API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulated in-memory database
users_db = {"testuser": {"password": "testpass", "balance": 10000, "stocks": {}}}
stocks_db = {
    "AAPL": {"name": "Apple Inc.", "price": random.uniform(100, 200)},
    "GOOGL": {"name": "Alphabet Inc.", "price": random.uniform(2000, 3000)},
    "AMZN": {"name": "Amazon.com Inc.", "price": random.uniform(3000, 4000)},
}

# OAuth2 for simple token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# User login request model
class UserLogin(BaseModel):
    username: str
    password: str

# User registration request model
class UserRegister(BaseModel):
    username: str
    password: str

# Stock transaction request model
class StockTransaction(BaseModel):
    stock: str
    amount: int
    user: str


@app.get("/")
def read_root():
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
        "stocks": {}
    }
    return {"message": f"User '{user.username}' registered successfully."}


@app.get("/stocks", response_model=List[dict])
def get_stocks():
    """Fetch stock prices"""
    return [{"ticker": ticker, "name": data["name"], "price": round(data["price"], 2)} for ticker, data in stocks_db.items()]


@app.post("/buy")
def buy_stock(transaction: StockTransaction):
    """Buy stocks for a user"""
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
    """Sell stocks for a user"""
    user = users_db.get(transaction.user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if transaction.stock not in user["stocks"] or user["stocks"][transaction.stock] < transaction.amount:
        raise HTTPException(status_code=400, detail="Not enough shares to sell")

    stock = stocks_db.get(transaction.stock)
    user["stocks"][transaction.stock] -= transaction.amount
    user["balance"] += transaction.amount * stock["price"]

    return {"message": f"Sold {transaction.amount} shares of {transaction.stock}", "new_balance": user["balance"]}
