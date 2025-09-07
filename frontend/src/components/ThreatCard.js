import React from "react";

function ThreatCard({ threat }) {
  return (
    <div className={`threat-card ${threat.severity.toLowerCase()}`}>
      <h3>{threat.title}</h3>
      <p>Severity: <strong>{threat.severity}</strong></p>
    </div>
  );
}

export default ThreatCard;
