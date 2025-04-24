import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import "./main.css";
import "./Portfolio.css";
import { getAuthHeaders } from "./api";

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [cashAccount, setCashAccount] = useState(null);
  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfolioRes, cashRes] = await Promise.all([
          fetch(`http://localhost:8000/portfolio/${username}`, {
            headers: getAuthHeaders(),
          }),
          fetch(`http://localhost:8000/cash/${username}`, {
            headers: getAuthHeaders(),
          }),
        ]);

        if (!portfolioRes.ok || !cashRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const portfolioData = await portfolioRes.json();
        const cashData = await cashRes.json();
        setPortfolio(portfolioData);
        setCashAccount({ balance: cashData.balance });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username]);

  const portfolioValue = portfolio.reduce(
    (sum, stock) => sum + (stock.current_value || 0),
    0
  );

  const chartData = {
    labels: portfolio.map((stock) => stock.ticker),
    datasets: [
      {
        label: "Current Value",
        data: portfolio.map((stock) => stock.current_value),
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <div className="portfolio-performance widget">
          <h3>Portfolio Performance</h3>
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>

        <div className="your-stocks">
          <h3>Your Stocks</h3>
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
          <strong>Portfolio Value (Cash Account):</strong>{" "}
          {cashAccount && typeof cashAccount.balance === "number"
            ? `$${cashAccount.balance.toFixed(2)}`
            : "Loading..."}
        </div>

        <div className="stat yield-ratio">
          <strong>Yield Cost Ratio:</strong>{" "}
          {portfolio.length > 0 && cashAccount && typeof cashAccount.balance === "number"
            ? (cashAccount.balance / portfolio.length).toFixed(2)
            : "0.00"}
        </div>

        <div className="stat total-dividends">
          <strong>Total Annual Dividends:</strong> $0.00
        </div>
        <div className="stat unrealized-gains">
          <strong>Unrealized Gains:</strong> $0.00
        </div>

        <div className="info-card">
          <p><strong>Total Portfolio Value:</strong> ${portfolioValue.toFixed(2)}</p>
          <p><strong>Total Stocks Held:</strong> {portfolio.length}</p>
          <p><strong>Average Stock Value:</strong> ${portfolio.length > 0 ? (portfolioValue / portfolio.length).toFixed(2) : "0.00"}</p>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
