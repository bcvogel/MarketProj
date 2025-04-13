import React from "react";
import { Link } from "react-router-dom";
import "./CreateUser.css"; // Link the CSS we'll create

const CreateUser = () => {
  return (
    <div className="createuser-container">
      {/* Header */}
      <header>
        <h1>Stock Trading System</h1>
        <div className="user-icon">👤</div>
      </header>

      {/* Create User Form */}
      <div className="createuser-form-container">
        <h2 className="createuser-title">Create Account</h2>
        <form className="createuser-form">
          <input type="email" placeholder="Email" required />
          <input type="text" placeholder="Username" required />
          <input type="password" placeholder="Password" required />
          <input type="password" placeholder="Confirm Password" required />
          
          <button type="submit" className="createuser-button">Create Account</button>
        </form>

        <div className="login-link">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
