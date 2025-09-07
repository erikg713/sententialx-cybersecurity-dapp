// frontend/src/components/KYCForm.js
import React, { useState } from "react";
import axios from "axios";

const KYCForm = () => {
  const [formData, setFormData] = useState({ fullName: "", idNumber: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post("/api/kyc", formData); // Backend endpoint
      if (response.data.success) {
        setMessage({ type: "success", text: "KYC submitted successfully!" });
        setFormData({ fullName: "", idNumber: "" });
      } else {
        setMessage({ type: "error", text: response.data.message || "Submission failed." });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Server error during KYC submission.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kyc-form-wrapper">
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="input"
        />
        <input
          type="text"
          name="idNumber"
          placeholder="Government ID Number"
          value={formData.idNumber}
          onChange={handleChange}
          required
          className="input"
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit KYC"}
        </button>
      </form>

      {message && (
        <div className={`status-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default KYCForm;
