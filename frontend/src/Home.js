import React from "react";
import { Link } from "react-router-dom";


const Home = ({stocks}) => {
    return (
        <div>
            <h1>Stock Market App</h1>
            <ul>
                {stocks.map(stock => (
                    <li key={stock.ticker}>{stock.name} - ${stock.price}</li>
                ))}
            </ul>
            <Link to="/login">Login here</Link>
            <br></br>
            <Link to="/createprofile">Don't have an account?</Link>
        </div>
    );
};

export default Home;
