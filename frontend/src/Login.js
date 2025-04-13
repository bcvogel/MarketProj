import React from "react";
import { Link } from "react-router-dom";
import "./Login.css"; // make sure you create this!

const Login = () => {
  return (
    <div className="login-container">
      {/* Header */}
      <header>
        <h1>Stock Trading System</h1>
        <div className="user-icon">👤</div>
      </header>

      {/* Login Form Section */}
      <div className="login-form-container">
        <h2 className="login-title">Login</h2>
        <form className="login-form">
          <input type="text" placeholder="Username" required />
          <input type="password" placeholder="Password" required />
          
          <Link to="/portfolio">
            <button type="button" className="login-button">Login</button>
          </Link>
        </form>

        <div className="register-link">
          <Link to="/createprofile">Don't have an account?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
