import React, { useState } from "react";

/**
 * PaymentForm
 *
 * Controlled, accessible payment form with validation, currency formatting,
 * and optional async submission handler.
 *
 * Props:
 * - onSubmit(amount: number) => void | Promise<void>
 *     Optional. Called with the numeric amount when the form is submitted.
 *     If it returns a promise, the form will show a loading state until it resolves.
 *
 * - currency (string)
 *     Optional. ISO 4217 currency code (e.g. "USD"). Defaults to "USD".
 *
 * - locale (string)
 *     Optional. Locale for number formatting (e.g. "en-US"). Defaults to browser locale.
 */
function PaymentForm({ onSubmit, currency = "USD", locale = undefined }) {
  const [rawValue, setRawValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Format a numeric value as currency for display
  const formatCurrency = (value) => {
    if (value === "" || Number.isNaN(Number(value))) return "";
    try {
      const formatter = new Intl.NumberFormat(locale || undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return formatter.format(Number(value));
    } catch {
      // Fallback to simple formatting
      return `${currency} ${Number(value).toFixed(2)}`;
    }
  };

  // Normalize input to a plain number string (accepts commas and spaces)
  const normalizeInput = (input) => input.replace(/[, ]+/g, "").trim();

  const handleChange = (e) => {
    // Allow empty or numeric-like values (digits, decimal point)
    const next = e.target.value;
    // Allow the user to type intermediate states like "." or "0."
    if (next === "" || /^[0-9]*[.,]?[0-9]*$/.test(next)) {
      setRawValue(next);
      setError("");
    }
  };

  const getNumericAmount = () => {
    const normalized = normalizeInput(rawValue).replace(",", ".");
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const amount = getNumericAmount();

    if (Number.isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    // Optional: enforce two decimal places
    const rounded = Math.round(amount * 100) / 100;

    try {
      setLoading(true);
      if (onSubmit && typeof onSubmit === "function") {
        // Support synchronous or async handlers
        await onSubmit(rounded);
      } else {
        // Default behavior: simulate processing (replace with real API call)
        await new Promise((res) => setTimeout(res, 700));
        // eslint-disable-next-line no-alert
        alert(`Processed payment of ${formatCurrency(rounded)}`);
      }
      // Reset on success
      setRawValue("");
    } catch (err) {
      console.error("Payment submission failed", err);
      setError(
        (err && err.message) || "An error occurred while processing the payment."
      );
    } finally {
      setLoading(false);
    }
  };

  // Displayed value uses localized formatting when input is a valid number,
  // but preserves user's raw typing otherwise for a smooth UX.
  const displayValue = (() => {
    const numeric = getNumericAmount();
    if (!Number.isNaN(numeric) && rawValue !== "" && !rawValue.endsWith(".")) {
      return formatCurrency(numeric);
    }
    return rawValue;
  })();

  return (
    <form className="form" onSubmit={handleSubmit} noValidate aria-live="polite">
      <label htmlFor="payment-amount" className="sr-only">
        Payment amount
      </label>
      <input
        id="payment-amount"
        name="amount"
        inputMode="decimal"
        type="text"
        placeholder={currency === "USD" ? "Enter amount (e.g. 12.34)" : "Enter amount"}
        value={displayValue}
        onChange={handleChange}
        aria-invalid={!!error}
        aria-describedby={error ? "payment-error" : undefined}
        className="input"
        autoComplete="off"
        disabled={loading}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
        <button
          type="submit"
          className="btn"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Processing…" : "Pay Now"}
        </button>
        <div style={{ color: "#666", fontSize: 14 }}>
          {rawValue && !error ? formatCurrency(getNumericAmount()) : null}
        </div>
      </div>

      {error && (
        <p id="payment-error" role="alert" style={{ color: "var(--danger, #c53030)", marginTop: 8 }}>
          {error}
        </p>
      )}
    </form>
  );
}

export default PaymentForm;
