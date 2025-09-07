import React from "react";
import KYCForm from "../components/KYCForm";
import React from "react";
import KYC from "../components/KYC";

const KYCPage = () => {
  return (
    <div className="page">
      <h2>Verify Your Identity</h2>
      <KYC />
    </div>
  );
};

export default KYCPage;

function KYCPage() {
  return (
    <div className="page-container">
      <h2>🧾 KYC Verification</h2>
      <KYCForm />
    </div>
  );
}

export default KYCPage;
