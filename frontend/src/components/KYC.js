// frontend/src/components/KYC.js
import React, { useState } from "react";
import axios from "axios";

const KYC = () => {
  const [form, setForm] = useState({ fullName: "", idNumber: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await axios.post("/api/kyc", form); // backend route
      if (response.data.success) {
        setStatus({ type: "success", message: "KYC submitted successfully!" });
        setForm({ fullName: "", idNumber: "" });
      } else {
        setStatus({ type: "error", message: response.data.message || "Submission failed." });
      }
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Server error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kyc-form-container">
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
          className="input"
        />
        <input
          type="text"
          name="idNumber"
          placeholder="Government ID Number"
          value={form.idNumber}
          onChange={handleChange}
          required
          className="input"
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit KYC"}
        </button>
      </form>

      {status && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

export default KYC; 
