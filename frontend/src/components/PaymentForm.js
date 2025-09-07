import React, { useState } from "react";

function PaymentForm() {
  const [amount, setAmount] = useState("");

  const handlePayment = (e) => {
    e.preventDefault();
    alert(`Processing payment of $${amount}`);
    setAmount("");
  };

  return (
    <form className="form" onSubmit={handlePayment}>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="input"
      />
      <button type="submit" className="btn">Pay Now</button>
    </form>
  );
}

export default PaymentForm;
