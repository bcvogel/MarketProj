import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";
import "./main.css";
import "./Dashboard.css";

const Dashboard = () => {
  const [cashAccount, setCashAccount] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [viewMode, setViewMode] = useState("Your Stocks");
  const [filterRange, setFilterRange] = useState("1 Week");
  const [selectedTicker, setSelectedTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stockPrice, setStockPrice] = useState(null);
  const username = localStorage.getItem("username");

  const timeRanges = {
    "1 Week": 7,
    "3 Months": 90,
    "6 Months": 180
  };

  const generateRandomChartData = (days) => ({
    labels: Array.from({ length: days }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "Portfolio Value",
        data: Array.from({ length: days }, () => Math.floor(Math.random() * 10000)),
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.3)",
        fill: true
      }
    ]
  });

  const generateStockTrendData = () => ({
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "Stock Price",
        data: Array.from({ length: 30 }, () => (Math.random() * 500 + 100).toFixed(2)),
        borderColor: "#2196f3",
        backgroundColor: "rgba(33, 150, 243, 0.2)",
        fill: true
      }
    ]
  });

  const [chartData, setChartData] = useState(generateRandomChartData(timeRanges["1 Week"]));
  const [stockTrendData, setStockTrendData] = useState(generateStockTrendData());

  const refreshData = async () => {
    try {
      const cashRes = await axios.get(`http://localhost:8000/cash/${username}`);
      setCashAccount(cashRes.data);
      const portRes = await axios.get(`http://localhost:8000/portfolio/${username}`);
      setPortfolio(portRes.data);
    } catch (err) {
      console.error("Refresh failed", err);
    }
  };

  const fetchStockPrice = async (ticker) => {
    try {
      const res = await axios.get("http://localhost:8000/stocks");
      const stock = res.data.find((s) => s.ticker === ticker);
      if (stock) setStockPrice(stock.price);
    } catch (err) {
      console.error("Error fetching stock price", err);
    }
  };

  const handleBuy = async () => {
    try {
      await axios.post("http://localhost:8000/buy", {
        stock: selectedTicker,
        amount: parseInt(quantity),
        username,
      });
      await refreshData();
    } catch (err) {
      console.error("Buy failed", err);
    }
  };

  const handleSell = async () => {
    try {
      await axios.post("http://localhost:8000/sell", {
        stock: selectedTicker,
        amount: parseInt(quantity),
        username,
      });
      await refreshData();
    } catch (err) {
      console.error("Sell failed", err);
    }
  };

  useEffect(() => {
    setChartData(generateRandomChartData(timeRanges[filterRange]));
  }, [filterRange]);

  useEffect(() => {
    if (username) {
      refreshData();
    }
  }, [username]);

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

        {/* Left Section */}
        <div className="dashboard-left">
          <h2>Stock Name:</h2>
          <div className="dashboard-chart-container">
            <button className="arrow-button">←</button>
            <div className="chart-box">
              <p style={{ textAlign: "center", fontWeight: "600" }}>Stock Price Over Time</p>
              <Line data={stockTrendData} options={{ responsive: true }} />
            </div>
            <button className="arrow-button">→</button>
          </div>

          <div className="popular-stocks-box">Popular stocks:</div>

          <div className="stock-amount-box">
            <label>Select Ticker:</label>
            <select
              value={selectedTicker}
              onChange={(e) => {
                setSelectedTicker(e.target.value);
                fetchStockPrice(e.target.value);
              }}
            >
              <option value="">-- Choose Stock --</option>
              {portfolio.map((s, idx) => (
                <option key={idx} value={s.ticker}>
                  {s.ticker}
                </option>
              ))}
            </select>

            {stockPrice && <p>Current Price: ${stockPrice.toFixed(2)}</p>}

            <label>Amount of Shares:</label>
            <input
              type="number"
              placeholder="Enter Amount"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <div className="stock-buttons">
              <button className="buy-button" onClick={handleBuy}>Buy</button>
              <button className="sell-button" onClick={handleSell}>Sell</button>
            </div>
          </div>
        </div>

        {/* Center Section */}
        <div className="dashboard-center">
          <div className="dashboard-widgets">
            <div className="widget">
              Your Wallet: ${cashAccount ? cashAccount.balance.toFixed(2) : "0.00"}
            </div>
            <div className="widget">
              <p>Portfolio Performance:</p>
              <select
                className="filter-button"
                value={filterRange}
                onChange={(e) => setFilterRange(e.target.value)}
              >
                <option value="1 Week">1 Week</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
              </select>
              <Line data={chartData} options={{ responsive: true }} />
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

        {/* Right Section */}
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
