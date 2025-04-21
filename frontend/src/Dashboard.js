import React from "react";
import "./main.css";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-body three-column-layout">
        {/* Left - Chart */}
        <div className="dashboard-left">
          <h2>Stock Name:</h2>
          <div className="dashboard-chart-container">
            <button className="arrow-button">&#8592;</button>
            <div className="chart-box">[Chart]</div>
            <button className="arrow-button">&#8594;</button>
          </div>
          <div className="popular-stocks-box">Popular stocks:</div>
        </div>

        {/* Center - Widgets */}
        <div className="dashboard-center">
          <div className="dashboard-widgets">
            <div className="widget">Your Wallet:</div>
            <div className="widget">
              Portfolio Performance: <button className="filter-button">Filters</button>
            </div>
            <div className="widget">
              Income: $<br />Losses: $
            </div>
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
        </div>

        {/* Right - List */}
        <div className="dashboard-list">
          <div className="list-section">
            <div className="list-header">
              <span>List:</span>
              <button className="filter-button">Filters</button>
            </div>
            <ul>
              <li>Stock 1</li>
              <li>Stock 2</li>
              <li>Stock 3</li>
              {/* Replace with dynamic stock items */}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
