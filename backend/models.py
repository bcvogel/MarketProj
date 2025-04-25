from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, CheckConstraint, Boolean, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)  # 'Customer' or 'Administrator'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    balance = Column(Float, default=0.0)
    transactions = relationship("Transaction", back_populates="user")
    portfolio = relationship("Portfolio", back_populates="user")
    cash_account = relationship("CashAccount", uselist=False, back_populates="user")


class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    ticker = Column(String, unique=True, index=True, nullable=False)
    price = Column(Float)
    volume = Column(Integer, CheckConstraint("volume >= 0"), nullable=False)
    current_price = Column(Float, CheckConstraint("current_price >= 0"), nullable=False)
    initial_price = Column(Float, CheckConstraint("initial_price >= 0"), nullable=False)
    daily_high = Column(Float, CheckConstraint("daily_high >= 0"), nullable=False)
    daily_low = Column(Float, CheckConstraint("daily_low >= 0"), nullable=False)
    market_cap = Column(Float, CheckConstraint("market_cap >= 0"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transactions = relationship("Transaction", back_populates="stock")
    portfolio = relationship("Portfolio", back_populates="stock")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    transaction_type = Column(String, nullable=False)  # 'BUY' or 'SELL'
    quantity = Column(Integer, CheckConstraint("quantity > 0"), nullable=False)
    price_per_share = Column(Float, CheckConstraint("price_per_share >= 0"), nullable=False)
    total_amount = Column(Float, CheckConstraint("total_amount >= 0"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="transactions")
    stock = relationship("Stock", back_populates="transactions")


class Portfolio(Base):
    __tablename__ = "portfolio"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    quantity = Column(Integer, CheckConstraint("quantity >= 0"), nullable=False)
    purchase_price = Column(Float, CheckConstraint("purchase_price >= 0"), nullable=False)
    current_value = Column(Float, CheckConstraint("current_value >= 0"), nullable=False)

    user = relationship("User", back_populates="portfolio")
    stock = relationship("Stock", back_populates="portfolio")


class CashAccount(Base):
    __tablename__ = "cash_account"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    balance = Column(Float, CheckConstraint("balance >= 0"), nullable=False)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="cash_account")

class MarketSchedule(Base):
    __tablename__ = "market_schedule"

    id = Column(Integer, primary_key=True, index=True)
    is_open = Column(Boolean, default=True, nullable=False)  # Admin toggle
    open_time = Column(String, default="09:30", nullable=False)  # Stored as HH:MM
    close_time = Column(String, default="16:00", nullable=False)
    holidays = Column(Text, default="", nullable=True)  # Comma-separated YYYY-MM-DD strings
