import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";
import "./main.css";
import "./Dashboard.css";

const Dashboard = () => {
  const [account, setAccount] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [viewMode, setViewMode] = useState("Your Stocks");
  const [selectedTicker, setSelectedTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  const fetchAccountInfo = () => {
    axios.get(`http://localhost:8000/account/${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setAccount(res.data)).catch(console.error);
  };

  const fetchPortfolio = () => {
    axios.get(`http://localhost:8000/portfolio/${username}`).then(res => setPortfolio(res.data)).catch(console.error);
  };

  const fetchStocks = () => {
    axios.get("http://localhost:8000/stocks").then(res => setStocks(res.data)).catch(console.error);
  };

  useEffect(() => {
    if (username) {
      fetchAccountInfo();
      fetchPortfolio();
      fetchStocks();
    }
  }, [username]);

  const getPortfolioValue = () => {
    return portfolio.reduce((sum, item) => sum + item.current_value, 0).toFixed(2);
  };

  const chartData = {
    labels: portfolio.map(stock => stock.ticker),
    datasets: [{
      label: "Portfolio Value",
      data: portfolio.map(stock => stock.current_value),
      borderColor: "#4caf50",
      backgroundColor: "rgba(76, 175, 80, 0.3)",
      fill: true
    }]
  };

  const weeklyViewsData = {
    labels: Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`),
    datasets: [{
      label: "Views",
      data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000)),
      borderColor: "#8884d8",
      backgroundColor: "rgba(136, 132, 216, 0.3)",
      fill: true
    }]
  };

  const buyConsensusData = {
    labels: ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"],
    datasets: [{
      data: [25, 30, 20, 15, 10],
      backgroundColor: ["#36A2EB", "#4BC0C0", "#FFCE56", "#FF6384", "#9966FF"],
      hoverOffset: 4
    }]
  };

  const leastExpensiveStocks = [...stocks].sort((a, b) => a.current_price - b.current_price).slice(0, 3);

  const handleTransaction = async (type) => {
    if (!selectedTicker || !quantity) return;

    const stock = stocks.find(s => s.ticker === selectedTicker);
    const estimatedTotal = stock ? (stock.current_price * quantity).toFixed(2) : 0;

    const confirm = window.confirm(
      `Are you sure you want to ${type.toLowerCase()} ${quantity} share(s) of ${selectedTicker} for ~$${estimatedTotal}?`
    );
    if (!confirm) return;

    try {
      await axios.post(`http://localhost:8000/${type.toLowerCase()}`, {
        username,
        stock: selectedTicker,
        amount: parseInt(quantity)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`${type} successful!`);
      setQuantity("");
      fetchAccountInfo();
      fetchPortfolio();
    } catch (err) {
      console.error(`${type} failed`, err);
      alert(`${type} failed.`);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome to your dashboard{account?.full_name ? `, ${account.full_name}` : ""}!</h2>
      </div>

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

          <div className="popular-stocks-box">
            <h4>Least Expensive Stocks:</h4>
            <ul>
              {leastExpensiveStocks.map((stock) => (
                <li key={stock.ticker}>
                  {stock.company_name} ({stock.ticker}) – ${stock.current_price ? stock.current_price.toFixed(2) : "0.00"}
                </li>
              ))}
            </ul>
          </div>

          <div className="stock-amount-box">
            <label>Select Stock:</label>
            <select value={selectedTicker} onChange={(e) => setSelectedTicker(e.target.value)}>
              <option value="">--Select--</option>
              {stocks.map(stock => (
                <option key={stock.ticker} value={stock.ticker}>{stock.ticker}</option>
              ))}
            </select>
            <label>Amount:</label>
            <input
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <div className="stock-buttons">
              <button className="buy-button" onClick={() => handleTransaction("buy")}>Buy</button>
              <button className="sell-button" onClick={() => handleTransaction("sell")}>Sell</button>
            </div>
          </div>

          <div className="available-stocks-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4>Available Stocks:</h4>
              <button className="refresh-button" onClick={fetchStocks}>🔄 Refresh Prices</button>
            </div>
            <table className="available-stocks-table">
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Price</th>
                  <th>Volume</th>
                  <th>Market Cap</th>
                  <th>Opening Price</th>
                  <th>High</th>
                  <th>Low</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.ticker}>
                    <td>{stock.ticker}</td>
                    <td>${stock.current_price ? stock.current_price.toFixed(2) : "N/A"}</td>
                    <td>{stock.volume ?? "N/A"}</td>
                    <td>${stock.volume && stock.current_price ? (stock.volume * stock.current_price).toLocaleString() : "N/A"}</td>
                    <td>${stock.initial_price ? stock.initial_price.toFixed(2) : "N/A"}</td>
                    <td>${stock.daily_high ? stock.daily_high.toFixed(2) : "N/A"}</td>
                    <td>${stock.daily_low ? stock.daily_low.toFixed(2) : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                        {stock.ticker} - {stock.quantity} shares @ ${stock.current_value ? stock.current_value.toFixed(2) : "0.00"}
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