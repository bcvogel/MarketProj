import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
    const location = useLocation();
    const path = location.pathname;

    let navStyle = {
        backgroundColor: "#91AC8F",
        color: "#fff",
        padding: "1rem",
        display: "flex",
        alignItems: "center:",
        justifyContent: "left",
    };

    let links = [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/portfolio", label: "Portfolio" },
        { to: "/transaction", label: "Transactions" },
        { to: "/account", label: "Account Info" },
        { to: "/", label: "Logout"}
    ];

    // Example: custom appearance for login/register pages
    if (path === "/login" || path === "/create-user" || path === "/") {
        navStyle = {
           // Empty to make sure the user has no access to 
        };
        links = links.filter(link =>
            link.to === "/login" || link.to === "/create-user"
        );
    }

    return (
        <nav style={navStyle}>
            <div style={{ display: "flex", gap: "2rem"}}>
                <Link to="/dashboard" style={{ color: "white", textDecoration: "none", fontWeight: "bold", fontSize: "1.2rem" }}>
                    Stocks For Us
                </Link>
                {links.map(link => (
                    <Link key={link.to} to={link.to} style={{ margin: "0 1rem", color: "white" }}>
                        {link.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default NavBar;