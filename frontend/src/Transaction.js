import React from "react";
import { Link } from "react-router-dom";
import "./Transaction.css"; // We'll create this file next

const Transaction = () => {
  return (
    <div className="transaction-container">
      {/* Header */}
      <header>
        <h1>Stock Trading System</h1>
        <div className="user-icon">👤</div>
      </header>

      {/* Transaction Form Section */}
      <div className="transaction-form-container">
        <h2 className="transaction-title">Create Transaction</h2>
        <form className="transaction-form">
          <input type="text" placeholder="Stock Symbol (e.g. AAPL)" required />
          <input type="number" placeholder="Number of Shares" required />
          <input type="number" placeholder="Price per Share" required />
          <select required>
            <option value="">Select Transaction Type</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          
          <button type="submit" className="transaction-button">Submit Transaction</button>
        </form>

        <div className="back-link">
          <Link to="/portfolio">Back to Portfolio</Link>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
