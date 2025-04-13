import React from "react";
import { Link } from "react-router-dom";
import "./Portfolio.css";

const Portfolio = ({ stocks }) => {
  return (
    <div className="container">
      {/* Header */}
      <header>
        <h1>Stock Trading System</h1>
        <div className="welcome-text">
          <span>Welcome Username!</span>
          <div className="user-icon">👤</div>
        </div>
      </header>

      {/* Stocks Section */}
      <section className="stocks-section">
        <h2 className="stocks-title">Stocks:</h2>
        <div className="stocks-carousel">
          <button>{`<`}</button>

          {stocks.map((stock, index) => (
            <div key={index} className="stock-card">
              <h3>{stock.ticker}</h3>
              <p>${stock.price}</p>
              <p>Up 5% vs last month</p>
              <div className="stock-chart">[Chart]</div>
              <button>Buy/Sell</button>
            </div>
          ))}

          <button>{`>`}</button>
        </div>

        {/* Filter & View More */}
        <div className="controls">
          <button>Filter</button>
          <button>View More</button>
        </div>
      </section>

      {/* Account Section */}
      <section className="account-section">
        <h2>Account Information:</h2>
        <div className="account-grid">
          <div className="account-card">
            <p><strong>Username:</strong></p>
            <p><strong>First Name:</strong></p>
            <p><strong>Last Name:</strong></p>
            <p><strong>Account Type:</strong></p>
            <p><strong>Account Created:</strong></p>
          </div>

          <div className="account-card">
            <p><strong>Account Number:</strong></p>
            <p><strong>Routing Number:</strong></p>
            <p><strong>Bank Name:</strong></p>
            <p><strong>Current Amount:</strong></p>
            <button>Create Transaction</button>
          </div>

          <div className="account-card">
            <p><strong>Transaction History:</strong></p>
            <button>View All</button>
          </div>
        </div>

        {/* Edit Information */}
        <div className="edit-info-button">
          <button>Edit Information</button>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
