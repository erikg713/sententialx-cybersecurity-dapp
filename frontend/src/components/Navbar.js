import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h1>🛡️ Sentenial-X</h1>
      <div>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/threats">Threats</Link>
        <Link to="/payments">Payments</Link>
        <Link to="/kyc">KYC</Link>
      </div>
    </nav>
  );
}

export default Navbar;
