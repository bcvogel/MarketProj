import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
    const [stocks, setStocks] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8000/stocks") // Adjust URL based on your API
            .then(response => setStocks(response.data))
            .catch(error => console.error("Error fetching stocks:", error));
    }, []);

    return (
        <div>
            <h1>Stock Market</h1>
            <ul>
                {stocks.map(stock => (
                    <li key={stock.ticker}>{stock.name} - ${stock.price}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;