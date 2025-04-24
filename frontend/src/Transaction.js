import React, { useEffect, useState } from "react";
import axios from "axios";
import "./main.css";
import "./Transaction.css";

const Transaction = () => {
  const [amount, setAmount] = useState("");
  const [cashBalance, setCashBalance] = useState(0);
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (username) {
      fetchCashBalance();
    }
  }, [username]);

  const fetchCashBalance = async () => {
    if (!username) return;
    try {
      const res = await axios.get(`http://localhost:8000/cash/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCashBalance(res.data.balance);
    } catch (err) {
      console.error("Failed to fetch cash balance", err);
    }
  };

  const deposit = async () => {
    if (!username || !amount) return;
    try {
      await axios.post(
        "http://localhost:8000/cash/deposit",
        {
          username,
          amount: parseFloat(amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchCashBalance();
      setAmount("");
    } catch (err) {
      console.error("Deposit failed", err);
    }
  };

  const withdraw = async () => {
    if (!username || !amount) return;
    try {
      await axios.post(
        "http://localhost:8000/cash/withdraw",
        {
          username,
          amount: parseFloat(amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchCashBalance();
      setAmount("");
    } catch (err) {
      console.error("Withdraw failed", err);
    }
  };

  return (
    <div className="transaction-container">
      <div className="transaction-body">
        <div className="left-box">
          <h2>Transaction:</h2>
          <div className="transaction-box">
            <label>Cash Account Balance:</label>
            <input
              type="text"
              value={`$${cashBalance.toFixed(2)}`}
              disabled
            />
            <label>Enter Amount:</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="stock-buttons">
              <button className="buy-button" onClick={deposit}>
                Deposit
              </button>
              <button className="sell-button" onClick={withdraw}>
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <div className="history-box">
          <div className="history-header">
            <h3>History</h3>
            <button>See All</button>
          </div>
          <div className="history-list">
            {/* Future transaction log entries go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
