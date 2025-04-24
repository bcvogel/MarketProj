import React, { useState, useEffect } from "react";
import axios from "axios";
import "./main.css";
import "./AccountInfo.css";

const AccountInfo = () => {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  const [account, setAccount] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/account/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAccount(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error("Error fetching account info", err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:8000/account/${username}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAccount(formData);
      setEditMode(false);
    } catch (err) {
      console.error("Error updating account", err);
    }
  };

  if (!account) return <p>Loading...</p>;

  return (
    <div className="accountinfo-container">
      <div className="accountinfo-section">
        <h2 className="section-title">Account Information:</h2>

        <div className="info-card">
          <div className="info-buttons">
            {!editMode ? (
              <button className="edit" onClick={() => setEditMode(true)}>Edit</button>
            ) : (
              <button className="save-button" onClick={handleSave}>Save</button>
            )}
          </div>

          <p><strong>Username:</strong> {account.username}</p>

          <p><strong>Full Name:</strong>
            {editMode ? (
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
              />
            ) : (
              ` ${account.full_name}`
            )}
          </p>

          <p><strong>Email:</strong>
            {editMode ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            ) : (
              ` ${account.email}`
            )}
          </p>

          <p><strong>Role:</strong> {account.role}</p>
          <p><strong>Account Created:</strong> {new Date(account.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;

