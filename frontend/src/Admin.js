import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "./api";
import "./main.css";
import "./Admin.css";

const Admin = () => {
  const [marketStatus, setMarketStatus] = useState(true);
  const [openTime, setOpenTime] = useState("09:30");
  const [closeTime, setCloseTime] = useState("16:00");
  const [holidayDate, setHolidayDate] = useState("");
  const [stockData, setStockData] = useState({
    company_name: "",
    ticker: "",
    volume: "",
    initial_price: "",
  });
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "Administrator") {
      navigate("/dashboard");
    }
  }, [role, navigate]);

  const toggleMarket = async () => {
    try {
      const res = await fetch("http://localhost:8000/market/toggle", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: !marketStatus }),
      });
      const data = await res.json();
      setMarketStatus(!marketStatus);
      setMessage(data.message);
    } catch (err) {
      setMessage("Error toggling market status.");
    }
  };

  const updateMarketHours = async () => {
    try {
      const res = await fetch("http://localhost:8000/market/hours", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ open_time: openTime, close_time: closeTime }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Error updating market hours.");
    }
  };

  const addHoliday = async () => {
    try {
      const res = await fetch("http://localhost:8000/market/holiday", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: holidayDate }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Error adding holiday.");
    }
  };

  const createStock = async () => {
    try {
      const res = await fetch("http://localhost:8000/stocks", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...stockData,
          volume: parseInt(stockData.volume),
          initial_price: parseFloat(stockData.initial_price),
        }),
      });
      const data = await res.json();
      setMessage(`Stock created: ${data.ticker || stockData.ticker}`);
    } catch (err) {
      setMessage("Error creating stock.");
    }
  };

  return (
    <div className="admin-container">
      <h2>Admin Panel</h2>
      {message && <p className="admin-message">{message}</p>}

      <div className="admin-section">
        <h3>Market Toggle</h3>
        <button onClick={toggleMarket}>
          {marketStatus ? "Close Market" : "Open Market"}
        </button>
      </div>

      <div className="admin-section">
        <h3>Market Hours</h3>
        <input
          type="time"
          value={openTime}
          onChange={(e) => setOpenTime(e.target.value)}
        />
        <input
          type="time"
          value={closeTime}
          onChange={(e) => setCloseTime(e.target.value)}
        />
        <button onClick={updateMarketHours}>Set Market Hours</button>
      </div>

      <div className="admin-section">
        <h3>Add Market Holiday</h3>
        <input
          type="date"
          value={holidayDate}
          onChange={(e) => setHolidayDate(e.target.value)}
        />
        <button onClick={addHoliday}>Add Holiday</button>
      </div>

      <div className="admin-section">
        <h3>Create New Stock</h3>
        <input
          type="text"
          placeholder="Company Name"
          value={stockData.company_name}
          onChange={(e) =>
            setStockData({ ...stockData, company_name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Ticker"
          value={stockData.ticker}
          onChange={(e) =>
            setStockData({ ...stockData, ticker: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Volume"
          value={stockData.volume}
          onChange={(e) =>
            setStockData({ ...stockData, volume: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Initial Price"
          step="0.01"
          value={stockData.initial_price}
          onChange={(e) =>
            setStockData({ ...stockData, initial_price: e.target.value })
          }
        />
        <button onClick={createStock}>Create Stock</button>
      </div>
    </div>
  );
};

export default Admin;
