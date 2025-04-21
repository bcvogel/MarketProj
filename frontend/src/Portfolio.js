import React from "react";
import "./main.css";
import "./Portfolio.css";

const Portfolio = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <div className="portfolio-performance">Portfolio Performance:</div>
        <div className="your-stocks">Your Stocks:</div>

        <div className="stat portfolio-value">Portfolio Value:</div>
        <div className="stat yield-ratio">Yield Cost Ratio:</div>
        <div className="stat total-dividends">Total Annual Dividends:</div>
        <div className="stat unrealized-gains">Unrealized Gains:</div>

        <div className="bank-info">
          <p><strong>Bank Information:</strong></p>
          <p>Account Number:</p>
          <input type="text" />
          <p>Routing Number:</p>
          <input type="text" />
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
