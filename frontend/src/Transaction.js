import React from "react";
import "./main.css";
import "./Transaction.css";

const Transaction = () => {
  return (
    <div className="transaction-container">
     

      {/* Content */}
      <div className="transaction-body">
        {/* Left Form Section */}
        <div className="left-box">
          <h2>Transaction:</h2>
          <div className="transaction-box">
            <label>Account Amount:</label>
            <input type="text" placeholder="Enter amount" />
            <label>Bank Account:</label>
            <input type="text" placeholder="Enter bank info" />
          </div>

          <div className="transfer-box">
            <div className="transfer-side">
              <label>Stock Account Amount:</label>
              <input type="text" placeholder="Enter Amount:" />
            </div>
            <div className="transfer-arrows">
              <span>&larr;</span>
              <span>&rarr;</span>
            </div>
            <div className="transfer-side">
              <label>Bank Account Amount:</label>
              <input type="text" placeholder="Enter Amount:" />
            </div>
          </div>
        </div>

        {/* Right History Section */}
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
