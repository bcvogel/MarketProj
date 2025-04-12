from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Stock
import random

router = APIRouter()

@router.get("/stocks")
def get_stocks(db: Session = Depends(get_db)):
    return db.query(Stock).all()

@router.post("/buy")
def buy_stock(user_id: int, stock_id: int, quantity: int, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.id == stock_id).first()
    if not stock:
        return {"error": "Stock not found"}

    user = db.query(User).filter(User.id == user_id).first()
    cost = stock.price * quantity
    if user.balance < cost:
        return {"error": "Insufficient balance"}

    user.balance -= cost
    transaction = Transaction(user_id=user.id, stock_id=stock.id, transaction_type="buy", amount=cost)
    db.add(transaction)
    db.commit()

    return {"message": "Stock purchased successfully"}