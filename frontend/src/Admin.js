import React, { useState } from "react";
import "./main.css";
import "./Admin.css";

const AdminPage = () => {
  const [stocks, setStocks] = useState([]);
  const [stockName, setStockName] = useState("");
  const [tradingHours, setTradingHours] = useState("");
  const [holiday, setHoliday] = useState("");

  const addStock = () => {
    if (stockName && tradingHours) {
      const newStock = {
        name: stockName,
        hours: tradingHours
      };
      setStocks([...stocks, newStock]);
      setStockName("");
      setTradingHours("");
    }
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <div className="user-icon">👤</div>
      </header>

      <div className="admin-content">
        {/* Create Stock Section */}
        <div className="admin-section">
          <h2>Create Stock</h2>
          <input
            type="text"
            placeholder="Stock Name"
            value={stockName}
            onChange={(e) => setStockName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Trading Hours (e.g. 9AM - 4PM)"
            value={tradingHours}
            onChange={(e) => setTradingHours(e.target.value)}
          />
          <button onClick={addStock}>Add Stock</button>
        </div>

        {/* Holiday Section */}
        <div className="admin-section">
          <h2>Set Holiday</h2>
          <input
            type="text"
            placeholder="Holiday Date (YYYY-MM-DD)"
            value={holiday}
            onChange={(e) => setHoliday(e.target.value)}
          />
          <button>Set Holiday</button>
        </div>

        {/* Stock List */}
        <div className="admin-section">
          <h2>Created Stocks</h2>
          <ul className="stock-list">
            {stocks.map((stock, index) => (
              <li key={index}>
                <strong>{stock.name}</strong> - {stock.hours}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
