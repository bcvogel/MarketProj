import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./main.css";
import "./Transaction.css";

const Transaction = () => {
  const [amount, setAmount] = useState("");
  const [cashBalance, setCashBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const username = localStorage.getItem("username");

  useEffect(() => {
    fetchCashBalance();
    fetchRecentTransactions();
  }, []);

  const fetchCashBalance = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/cash/${username}`);
      setCashBalance(res.data.balance);
    } catch (err) {
      console.error("Failed to fetch cash balance", err);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const res = await axios.get("http://localhost:8000/transactions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
      });
      setHistory(res.data.slice(0, 5)); // Show only the latest 5
    } catch (err) {
      console.error("Failed to fetch transaction history", err);
    }
  };

  const deposit = async () => {
    try {
      await axios.post("http://localhost:8000/cash/deposit", {
        username,
        amount: parseFloat(amount),
      });
      fetchCashBalance();
      setAmount("");
    } catch (err) {
      console.error("Deposit failed", err);
    }
  };

  const withdraw = async () => {
    try {
      await axios.post("http://localhost:8000/cash/withdraw", {
        username,
        amount: parseFloat(amount),
      });
      fetchCashBalance();
      setAmount("");
    } catch (err) {
      console.error("Withdraw failed", err);
    }
  };

  return (
    <div className="transaction-container">
      <div className="transaction-body">

        {/* Left Form Section */}
        <div className="left-box">
          <h2>Transaction:</h2>
          <div className="transaction-box">
            <label>Cash Account Balance:</label>
            <input type="text" value={`$${cashBalance.toFixed(2)}`} disabled />
            <label>Enter Amount:</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="stock-buttons">
              <button className="buy-button" onClick={deposit}>Deposit</button>
              <button className="sell-button" onClick={withdraw}>Withdraw</button>
            </div>
          </div>
        </div>

        {/* Right History Section */}
        <div className="history-box">
          <div className="history-header">
            <h3>History</h3>
            <Link to="/transactionhistory">
              <button>See All</button>
            </Link>
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <p>No recent transactions.</p>
            ) : (
              <ul>
                {history.map((txn) => (
                  <li key={txn.id}>
                    <strong>{txn.transaction_type}</strong> {txn.quantity} {txn.stock_ticker} @ ${txn.price_per_share.toFixed(2)}<br />
                    <small>{new Date(txn.timestamp).toLocaleDateString()}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Transaction;
