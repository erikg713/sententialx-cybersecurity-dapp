import React, { useState } from "react";

function KYCForm() {
  const [form, setForm] = useState({ name: "", idNumber: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`KYC Submitted for ${form.name}`);
    setForm({ name: "", idNumber: "" });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
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
      <button type="submit" className="btn">Submit KYC</button>
    </form>
  );
}

export default KYCForm;
