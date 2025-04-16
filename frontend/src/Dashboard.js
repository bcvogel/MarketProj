import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Stocks For Us</h1>
        <nav className="dashboard-nav">
          <a href="/portfolio">Portfolio</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/transaction">Transaction</a>
          <div className="user-icon">👤</div>
        </nav>
      </header>

      {/* Main Body */}
      <div className="dashboard-body">
        {/* Left Section - Chart */}
        <div className="dashboard-left">
          <h2>Stock Name:</h2>
          <div className="dashboard-chart-container">
            <button className="arrow-button">&#8592;</button>
            <div className="chart-box">[Chart]</div>
            <button className="arrow-button">&#8594;</button>
          </div>
          <div className="popular-stocks-box">Popular stocks:</div>
        </div>

        {/* Right Section - Widgets */}
        <div className="dashboard-right">
          <div className="dashboard-widgets">
            <div className="widget">Your Wallet:</div>
            <div className="widget">Portfolio Performance: <button className="filter-button">Filters</button></div>
            <div className="widget">Income: $<br />Losses: $</div>
            <div className="widget">Weekly Stock Views:</div>
            <div className="widget">Buy Consensus:</div>
          </div>

          <div className="stock-amount-box">
            <label>Amount of Shares You have:</label>
            <input type="text" />
            <label>Amount of Shares:</label>
            <input type="text" placeholder="Enter Amount" />
            <div className="stock-buttons">
              <button className="buy-button">Buy</button>
              <button className="sell-button">Sell</button>
            </div>
          </div>

          <div className="list-section">
            <div className="list-header">
              <span>List:</span>
              <button className="filter-button">Filters</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
