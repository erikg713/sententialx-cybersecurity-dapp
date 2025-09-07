import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <ul>
        <li><Link to="/dashboard">📊 Dashboard</Link></li>
        <li><Link to="/threats">⚠️ Threat Feed</Link></li>
        <li><Link to="/payments">💳 Payments</Link></li>
        <li><Link to="/kyc">🧾 KYC</Link></li>
      </ul>
    </aside>
  );
}

export default Sidebar;
