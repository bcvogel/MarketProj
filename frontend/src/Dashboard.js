import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";
import "./main.css";
import "./Dashboard.css";

const Dashboard = () => {
  const [cashAccount, setCashAccount] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [viewMode, setViewMode] = useState("Your Stocks");
  const [selectedTicker, setSelectedTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stockPrice, setStockPrice] = useState(null);
  const [filterRange, setFilterRange] = useState("1 Week");
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [account, setAccount] = useState(null);
  const [marketSchedule, setMarketSchedule] = useState(null);

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  const generateRandomChartData = (days) => ({
    labels: Array.from({ length: days }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "Portfolio Value",
        data: Array.from({ length: days }, () => Math.floor(Math.random() * 10000)),
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.3)",
        fill: true,
      },
    ],
  });

  const fetchAccountInfo = () => {
    axios
      .get(`http://localhost:8000/account/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCashAccount(res.data);
        setAccount(res.data);
      })
      .catch(console.error);
  };

  const fetchPortfolio = () => {
    axios
      .get(`http://localhost:8000/portfolio/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPortfolio(res.data))
      .catch(console.error);
  };

  const fetchStocks = () => {
    axios
      .get("http://localhost:8000/stocks")
      .then((res) => setStocks(res.data))
      .catch(console.error);
  };

  const fetchMarketSchedule = () => {
    axios
      .get("http://localhost:8000/market/schedule")
      .then((res) => setMarketSchedule(res.data))
      .catch(console.error);
  };

  const fetchStockPrice = async (ticker) => {
    try {
      const res = await axios.get("http://localhost:8000/stocks");
      const stock = res.data.find((s) => s.ticker === ticker);
      if (stock) setStockPrice(stock.current_price);
    } catch (err) {
      console.error("Error fetching stock price", err);
    }
  };

  const refreshData = async () => {
    try {
      const cashRes = await axios.get(`http://localhost:8000/cash/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCashAccount(cashRes.data);

      const portRes = await axios.get(`http://localhost:8000/portfolio/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPortfolio(portRes.data);
    } catch (err) {
      console.error("Refresh failed", err);
    }
  };

  useEffect(() => {
    if (username) {
      fetchAccountInfo();
      fetchPortfolio();
      fetchStocks();
      fetchMarketSchedule();
    }
  }, [username]);

  useEffect(() => {
    setChartData(generateRandomChartData({ "1 Week": 7, "3 Months": 90, "6 Months": 180 }[filterRange]));
  }, [filterRange]);

  const handleTransaction = async (type) => {
    if (!selectedTicker || !quantity) return;

    const stock = stocks.find((s) => s.ticker === selectedTicker);
    const estimatedTotal = stock ? (stock.current_price * quantity).toFixed(2) : 0;

    const confirm = window.confirm(
      `Are you sure you want to ${type.toLowerCase()} ${quantity} share(s) of ${selectedTicker} for ~$${estimatedTotal}?`
    );
    if (!confirm) return;

    try {
      await axios.post(
        `http://localhost:8000/${type.toLowerCase()}`,
        {
          username,
          stock: selectedTicker,
          amount: parseInt(quantity),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`${type} successful!`);
      setQuantity("");
      fetchAccountInfo();
      fetchPortfolio();
    } catch (err) {
      console.error(`${type} failed`, err);
      alert(`${type} failed.`);
    }
  };

  const weeklyViewsData = {
    labels: Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "Views",
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000)),
        borderColor: "#8884d8",
        backgroundColor: "rgba(136, 132, 216, 0.3)",
        fill: true,
      },
    ],
  };

  const buyConsensusData = {
    labels: ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"],
    datasets: [
      {
        data: [25, 30, 20, 15, 10],
        backgroundColor: ["#36A2EB", "#4BC0C0", "#FFCE56", "#FF6384", "#9966FF"],
        hoverOffset: 4,
      },
    ],
  };

  const leastExpensiveStocks = [...stocks].sort((a, b) => a.current_price - b.current_price).slice(0, 3);

  const renderMarketStatusCard = () => {
    if (!marketSchedule) return null;

    const now = new Date();
    const day = now.getDay();
    const time = now.getHours() + now.getMinutes() / 60;
    const open = parseFloat(marketSchedule.open_time.split(":")[0]) + parseFloat(marketSchedule.open_time.split(":")[1]) / 60;
    const close = parseFloat(marketSchedule.close_time.split(":")[0]) + parseFloat(marketSchedule.close_time.split(":")[1]) / 60;
    const today = now.toISOString().split("T")[0];
    const isOpen = marketSchedule.is_open && day < 6 && !marketSchedule.holidays.includes(today) && time >= open && time <= close;

    return (
      <div className="dashboard-chart-container info-card">
        <h3 style={{ textAlign: "center" }}>
          The Market is Currently: {isOpen ? "🟢 Open" : "🔴 Closed"}
        </h3>
        <p style={{ textAlign: "center", marginTop: "0.5rem" }}>
          {isOpen ? "Market is open during regular trading hours." : "Market is currently closed."}
        </p>
        <table className="market-hours-table" style={{ width: "100%", marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Day</th>
              <th>Status</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayName, i) => (
              <tr key={dayName}>
                <td>{dayName}</td>
                <td>{i < 5 ? "Open" : "Closed"}</td>
                <td>{i < 5 ? `${marketSchedule.open_time} - ${marketSchedule.close_time}` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome to your dashboard!</h2>
        {account?.full_name && <h3>{account.full_name}!</h3>}
      </div>

      <div className="dashboard-body three-column-layout">
        <div className="dashboard-left">
          {renderMarketStatusCard()}

          <div className="popular-stocks-box">
            <h4>Least Expensive Stocks:</h4>
            <ul>
              {leastExpensiveStocks.map((stock) => (
                <li key={stock.ticker}>
                  {stock.company_name} ({stock.ticker}) – ${stock.current_price?.toFixed(2) ?? "0.00"}
                </li>
              ))}
            </ul>
          </div>

          <div className="stock-amount-box">
            <label>Select Stock:</label>
            <select
              value={selectedTicker}
              onChange={(e) => {
                setSelectedTicker(e.target.value);
                fetchStockPrice(e.target.value);
              }}
            >
              <option value="">--Select--</option>
              {stocks.map((stock) => (
                <option key={stock.ticker} value={stock.ticker}>
                  {stock.ticker}
                </option>
              ))}
            </select>

            {stockPrice && <p>Current Price: ${stockPrice.toFixed(2)}</p>}

            <label>Amount:</label>
            <input
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <div className="stock-buttons">
              <button className="buy-button" onClick={() => handleTransaction("buy")}>
                Buy
              </button>
              <button className="sell-button" onClick={() => handleTransaction("sell")}>
                Sell
              </button>
            </div>
          </div>

          <div className="info-card available-stocks-box">
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
                    <td>${stock.current_price?.toFixed(2) ?? "N/A"}</td>
                    <td>{stock.volume ?? "N/A"}</td>
                    <td>${stock.volume && stock.current_price ? (stock.volume * stock.current_price).toLocaleString() : "N/A"}</td>
                    <td>${stock.initial_price?.toFixed(2) ?? "N/A"}</td>
                    <td>${stock.daily_high?.toFixed(2) ?? "N/A"}</td>
                    <td>${stock.daily_low?.toFixed(2) ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-center">
          <div className="dashboard-widgets">
            <div className="widget">
              <p>{account?.full_name ? `${account.full_name.split(" ")[0]}'s Wallet:` : "Wallet:"}</p>
              <p style={{ color: "green", fontWeight: "bold", fontSize: "1.2rem" }}>
                ${cashAccount ? cashAccount.balance.toFixed(2) : "0.00"}
              </p>
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
                        {stock.ticker} - {stock.quantity} shares @ ${stock.current_value?.toFixed(2) ?? "0.00"}
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