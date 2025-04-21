import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./main.css";
import "./CreateUser.css";

const CreateUser = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerStatus, setRegisterStatus] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setRegisterStatus("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          username,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRegisterStatus("Account created successfully!");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setRegisterStatus(data.detail || "Registration failed.");
      }
    } catch (error) {
      setRegisterStatus("Error creating account.");
    }
  };

  return (
    <div className="createuser-container">
      <div className="createuser-form-container">
        <h2 className="createuser-title">Create Account</h2>
        <form className="createuser-form" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="createuser-button">Create Account</button>
        </form>
        <p className="register-status">{registerStatus}</p>
        <div className="login-link">
          <a href="/">Already have an account? Login</a>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
