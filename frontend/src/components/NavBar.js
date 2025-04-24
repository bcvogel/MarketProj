import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './NavBar.css';

function NavBar() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/"); // ✅ Redirect to login after clearing auth
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#91a68c' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <strong>Stocks For Us</strong>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Link to="/transaction">Cash Management</Link>
        <Link to="/transaction-history">Transaction History</Link>
        {role === "Administrator" && (
          <Link to="/admin">Admin Panel</Link>
        )}
      </div>

      <div
        style={{ position: 'relative' }}
        onMouseEnter={() => setDropdownVisible(true)}
        onMouseLeave={() => setDropdownVisible(false)}
      >
        <FaUserCircle
          size={28}
          style={{ cursor: 'pointer', color: 'white' }}
          onClick={() => navigate("/account")}
        />
        {dropdownVisible && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            width: '150px'
          }}>
            <Link to="/account" style={dropdownLinkStyle}>Account Info</Link>
            <div onClick={handleLogout} style={dropdownLinkStyle}>Logout</div>
          </div>
        )}
      </div>
    </nav>
  );
}

const dropdownLinkStyle = {
  display: 'block',
  padding: '10px',
  color: '#333',
  textDecoration: 'none',
  borderBottom: '1px solid #eee',
  cursor: 'pointer'
};

export default NavBar;
