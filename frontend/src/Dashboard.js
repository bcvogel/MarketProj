import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";
import "./main.css";
import "./Dashboard.css";

const Dashboard = () => {
  const [account, setAccount] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [viewMode, setViewMode] = useState("Your Stocks");
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (username) {
      axios.get(`http://localhost:8000/account/${username}`)
        .then(res => setAccount(res.data))
        .catch(err => console.error("Error fetching account info:", err));

      axios.get(`http://localhost:8000/portfolio/${username}`)
        .then(res => setPortfolio(res.data))
        .catch(err => console.error("Error fetching portfolio:", err));
    }
  }, [username]);

  const getPortfolioValue = () => {
    return portfolio.reduce((sum, item) => sum + item.current_value, 0).toFixed(2);
  };

  const chartData = {
    labels: portfolio.map(stock => stock.ticker),
    datasets: [
      {
        label: "Portfolio Value",
        data: portfolio.map(stock => stock.current_value),
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.3)",
        fill: true
      }
    ]
  };

  const weeklyViewsData = {
    labels: Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "Views",
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000)),
        borderColor: "#8884d8",
        backgroundColor: "rgba(136, 132, 216, 0.3)",
        fill: true
      }
    ]
  };

  const buyConsensusData = {
    labels: ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"],
    datasets: [
      {
        data: [25, 30, 20, 15, 10],
        backgroundColor: ["#36A2EB", "#4BC0C0", "#FFCE56", "#FF6384", "#9966FF"],
        hoverOffset: 4
      }
    ]
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-body three-column-layout">
        {/* Left - Chart */}
        <div className="dashboard-left">
          <h2>Stock Name:</h2>
          <div className="dashboard-chart-container">
            <button className="arrow-button">←</button>
            <div className="chart-box">
              <Line data={chartData} options={{ responsive: true }} />
            </div>
            <button className="arrow-button">→</button>
          </div>
          <div className="popular-stocks-box">Popular stocks:</div>
        </div>

        {/* Center - Widgets */}
        <div className="dashboard-center">
          <div className="dashboard-widgets">
            <div className="widget">
              Your Wallet: ${account ? account.balance.toFixed(2) : "0.00"}
            </div>
            <div className="widget">
              <p>Portfolio Performance:</p>
              <Line data={chartData} options={{ responsive: true }} />
              <button className="filter-button">Filters</button>
            </div>
            <div className="widget">
              <p>Weekly Stock Views:</p>
              <Line data={weeklyViewsData} options={{ responsive: true }} />
            </div>
            <div className="widget">
              <p>Buy Consensus:</p>
              <Doughnut data={buyConsensusData} />
            </div>
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
              <select className="filter-button" onChange={(e) => setViewMode(e.target.value)}>
                <option value="Your Stocks">Your Stocks</option>
                <option value="Recommended Stocks">Recommended Stocks</option>
              </select>
            </div>
            <ul>
              {viewMode === "Your Stocks"
                ? portfolio.length === 0
                  ? <li>No stocks found.</li>
                  : portfolio.map((stock, index) => (
                      <li key={index}>
                        {stock.ticker} - {stock.quantity} shares @ ${stock.current_value.toFixed(2)}
                      </li>
                    ))
                : ["AAPL", "TSLA", "AMZN"].map((ticker, index) => (
                    <li key={index}>{ticker} - Recommended</li>
                  ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;