import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function DashboardPage() {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <Sidebar />
      <main className="content">
        <h2>📊 Dashboard</h2>
        <p>Welcome to Sentenial-X — monitor, analyze, and defend.</p>
      </main>
    </div>
  );
}

export default DashboardPage;
