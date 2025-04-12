import React, { useState, useEffect } from "react";
import { fetchStocks } from "../api";

const StockList = () => {
    const [stocks, setStocks] = useState([]);

    useEffect(() => {
        fetchStocks().then((data) => setStocks(data));
    }, []);

    return (
        <div>
            <h2>Stock Market</h2>
            <table>
                <thead>
                    <tr>
                        <th>Ticker</th>
                        <th>Company</th>
                        <th>Price</th>
                        <th>Volume</th>
                    </tr>
                </thead>
                <tbody>
                    {stocks.map((stock) => (
                        <tr key={stock.id}>
                            <td>{stock.ticker}</td>
                            <td>{stock.company_name}</td>
                            <td>${stock.price.toFixed(2)}</td>
                            <td>{stock.volume}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockList;