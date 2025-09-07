import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("user", username);
      navigate("/dashboard");
    }
  };

  return (
    <div className="page-container">
      <h1>🔐 Sentenial-X Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input"
        />
        <button type="submit" className="btn">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
