import React from "react";
import "./AccountInfo.css"; // we will create this file

const AccountInfo = () => {
  return (
    <div className="accountinfo-container">
      {/* Header */}
      <header>
        <h1>Stock Trading System</h1>
        <div className="user-icon">👤</div>
      </header>

      {/* Account Information Section */}
      <div className="accountinfo-section">
        <h2 className="section-title">Account Information:</h2>

        {/* Personal Info Card */}
        <div className="info-card">
          <div className="info-buttons">
            <button className="save-button">Save Changes</button>
            <button className="password-button">Create New Password</button>
          </div>
          <p><strong>Username:</strong></p>
          <p><strong>First Name:</strong></p>
          <p><strong>Last Name:</strong></p>
          <p><strong>Account Type:</strong></p>
          <p><strong>Account Created:</strong></p>
        </div>

        {/* Bank Info Card */}
        <div className="info-card">
          <p><strong>Account Number:</strong></p>
          <p><strong>Routing Number:</strong></p>
          <p><strong>Bank Name:</strong></p>
        </div>

      </div>
    </div>
  );
};

export default AccountInfo;
