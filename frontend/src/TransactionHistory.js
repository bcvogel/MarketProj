import React, { useEffect, useState } from "react";
import axios from "axios";
import "./main.css";
import "./TransactionHistory.css";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`http://localhost:8000/transactions/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setTransactions(sorted);
        console.log("Fetched transactions:", sorted); // for debugging
      })
      .catch((err) => console.error("Failed to fetch transactions", err));
  }, [username]);

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
                <td>{txn.timestamp ? new Date(txn.timestamp).toLocaleString() : "N/A"}</td>
                <td>{txn.transaction_type?.toUpperCase() ?? "N/A"}</td>
                <td>{txn.stock_ticker ?? "N/A"}</td>
                <td>{txn.quantity ?? 0}</td>
                <td>${txn.price_per_share?.toFixed(2) ?? "0.00"}</td>
                <td>${txn.total_amount?.toFixed(2) ?? "0.00"}</td>
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