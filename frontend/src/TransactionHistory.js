import React, { useEffect, useState } from "react";
import "./main.css";
import "./TransactionHistory.css";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Replace with your real API endpoint
    fetch("http://localhost:8000/transactions", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error("Failed to fetch transactions", err));
  }, []);

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Stock</th>
            <th>Qty</th>
            <th>Price/Share</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{new Date(txn.timestamp).toLocaleDateString()}</td>
                <td>{txn.transaction_type}</td>
                <td>{txn.stock_ticker}</td>
                <td>{txn.quantity}</td>
                <td>${txn.price_per_share.toFixed(2)}</td>
                <td>${txn.total_amount.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No transactions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;