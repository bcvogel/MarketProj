import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import CreateUser from './CreateUser';
import Portfolio from "./Portfolio";
import './App.css'; 

function App() {
    const [stocks, setStocks] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8000/stocks") // Adjust URL based on your API
            .then(response => setStocks(response.data))
            .catch(error => console.error("Error fetching stocks:", error));
    }, []);
    

    return (
        <Router>
            <div>
                <h1>Stock Trading App</h1>
                <ul>
                    {stocks.map((stock, index) => (
                    <li key={index}>{stock.name} - ${stock.price}</li>
                    ))}
                </ul>
            <Routes>
                <Route path="/" element={<Home stocks={stocks}/>} />
                <Route path="/login" element={<Login />} />
                <Route path="/createprofile" element={<CreateUser />} />
                <Route path="/portfolio" element={<Portfolio stocks={stocks}/>} />
                <Route path="/transaction" element={<transaction stocks={stocks}/>} />
            </Routes>
          </div>
        </Router>
      );
}

export default App;