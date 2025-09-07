// frontend/src/components/Payments.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const Payments = () => {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Fetch past payments on load
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get("/api/payments/history");
        setPaymentHistory(res.data.payments || []);
      } catch (err) {
        console.error("Error fetching payments:", err);
      }
    };
    fetchPayments();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await axios.post("/api/payments", { amount });
      if (response.data.success) {
        setStatus({ type: "success", message: "Payment successful!" });
        setPaymentHistory([...paymentHistory, response.data.payment]);
        setAmount("");
      } else {
        setStatus({ type: "error", message: response.data.message || "Payment failed." });
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Server error during payment.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payments-wrapper">
      <form className="form" onSubmit={handlePayment}>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="input"
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </form>

      {status && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}

      <div className="payment-history">
        <h3>Payment History</h3>
        {paymentHistory.length === 0 ? (
          <p>No payments yet.</p>
        ) : (
          <ul>
            {paymentHistory.map((p, index) => (
              <li key={index}>
                ${p.amount} — {new Date(p.date).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Payments; 
