//#region Import necessary components
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
//#endregion

//#region Import pages for routing
import Login from './Login';
import CreateUser from './CreateUser';
import Dashboard from "./Dashboard";
import Portfolio from "./Portfolio";
import Transaction from "./Transaction";
import AccountInfo from "./AccountInfo";
//#endregion

//#region Import designs and components
import NavBar from "./components/NavBar";
//#endregion


function App() {
    const [stocks, setStocks] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8000/stocks") // Adjust URL based on your API
            .then(response => setStocks(response.data))
            .catch(error => console.error("Error fetching stocks:", error));
    }, []);
    
//#region Creates File paths for url
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/createprofile" element={<CreateUser />} />
                <Route path="/dashboard" element={<Dashboard stocks={stocks}/>} />
                <Route path="/portfolio" element={<Portfolio stocks={stocks}/>} />
                <Route path="/transaction" element={<Transaction stocks={stocks}/>} />
                <Route path="/account" element={<AccountInfo/>} />
            </Routes>
        </Router>
      );
//#endregion

}

export default App;