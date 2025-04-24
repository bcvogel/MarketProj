import React, { useEffect, useState } from "react";
import "./main.css";
import "./AccountInfo.css";

const AccountInfo = () => {
  const [account, setAccount] = useState(null);
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (username) {
      fetch(`http://localhost:8000/account/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setAccount(data))
        .catch((err) => console.error("Failed to load account info:", err));
    }
  }, [username]);

  return (
    <div className="accountinfo-container">
      <div className="accountinfo-section">
        <h2 className="section-title">Account Information:</h2>

        <div className="info-card">
          <div className="info-buttons">
            <button className="edit">Edit</button>
          </div>
          <p><strong>Username:</strong> {account?.username || "Loading..."}</p>
          <p><strong>Full Name:</strong> {account?.full_name || "Loading..."}</p>
          <p><strong>Role:</strong> {account?.role || "Loading..."}</p>
          <p><strong>Email:</strong> {account?.email || "Loading..."}</p>
          <p><strong>Account Created:</strong> {account?.created_at ? new Date(account.created_at).toLocaleString() : "Unknown"}</p>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
