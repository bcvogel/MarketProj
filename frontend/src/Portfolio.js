import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import "./main.css";
import "./Portfolio.css";

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`http://localhost:8000/portfolio/${username}`);
        if (!res.ok) {
          throw new Error("Failed to fetch portfolio");
        }
        const data = await res.json();
        setPortfolio(data);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }
    };

    if (username) {
      fetchPortfolio();
    }
  }, [username]);

  const portfolioValue = portfolio.reduce((sum, stock) => sum + stock.current_value, 0).toFixed(2);

  const chartData = {
    labels: portfolio.map((stock) => stock.ticker),
    datasets: [
      {
        label: "Current Value",
        data: portfolio.map((stock) => stock.current_value),
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        fill: true,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <div className="portfolio-performance">
          <h3>Portfolio Performance:</h3>
          <Line data={chartData} options={{ responsive: true }} />
        </div>

        <div className="your-stocks">
          <h3>Your Stocks:</h3>
          {portfolio.length === 0 ? (
            <p>No stocks found in your portfolio.</p>
          ) : (
            <table className="portfolio-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Ticker</th>
                  <th>Quantity</th>
                  <th>Purchase Price</th>
                  <th>Current Value</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((stock, index) => (
                  <tr key={index}>
                    <td>{stock.stock_name ?? "N/A"}</td>
                    <td>{stock.ticker}</td>
                    <td>{stock.quantity}</td>
                    <td>{stock.purchase_price?.toFixed(2) ?? "N/A"}</td>
                    <td>{stock.current_value?.toFixed(2) ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="stat portfolio-value">
          <strong>Portfolio Value:</strong> ${portfolioValue}
        </div>
        <div className="stat yield-ratio">
          <strong>Yield Cost Ratio:</strong> {portfolio.length > 0 ? (portfolioValue / portfolio.length).toFixed(2) : "0.00"}
        </div>
        <div className="stat total-dividends">
          <strong>Total Annual Dividends:</strong> $0.00
        </div>
        <div className="stat unrealized-gains">
          <strong>Unrealized Gains:</strong> $0.00
        </div>

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
