import React, { useEffect, lazy, Suspense, memo } from "react";

/**
 * Lazy-load PaymentForm to reduce initial bundle size.
 * PaymentForm is wrapped in Suspense with a small accessible fallback.
 */
const PaymentForm = lazy(() => import("../components/PaymentForm"));

/**
 * Simple accessible spinner/fallback shown while PaymentForm loads.
 * Kept intentionally small so it can be inlined without pulling in extra dependencies.
 */
function LoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="payments-loading"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "1rem 0",
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#555"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
          transform="rotate(-90 25 25)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="0.9s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      <span style={{ color: "#333", fontSize: 14 }}>Loading payment form…</span>
    </div>
  );
}

/**
 * Payments page - container for the payment form.
 * Uses document.title side-effect for better UX and accessibility.
 */
function PaymentsPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Payments — Sentential X";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="page-container payments-page" aria-labelledby="paymentsHeading">
      <header style={{ marginBottom: 12 }}>
        <h1 id="paymentsHeading" style={{ fontSize: "1.5rem", margin: 0 }}>
          💳 Payments
        </h1>
        <p style={{ margin: "6px 0 0", color: "#555" }}>
          Manage billing and payment methods securely.
        </p>
      </header>

      <section aria-label="Payment form">
        <Suspense fallback={<LoadingFallback />}>
          <PaymentForm />
        </Suspense>
      </section>
    </main>
  );
}

export default memo(PaymentsPage);
