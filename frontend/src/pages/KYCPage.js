import React, { useEffect, memo } from "react";
import KYCForm from "../components/KYCForm";

/**
 * KYCPage
 * - Single responsibility page that renders the KYCForm.
 * - Sets a descriptive document title while mounted.
 * - Wrapped in React.memo for a minor render optimization.
 */
const KYCPage = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "KYC Verification — Sentenial-X";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="kyc-page" role="main" aria-labelledby="kyc-heading">
      <div className="kyc-page__container">
        <h1 id="kyc-heading">KYC Verification</h1>
        <p className="kyc-page__subtitle">
          To continue, please complete identity verification. Your information is handled securely.
        </p>

        <section aria-label="KYC form" className="kyc-page__form">
          <KYCForm />
        </section>
      </div>
    </main>
  );
};

export default memo(KYCPage);
