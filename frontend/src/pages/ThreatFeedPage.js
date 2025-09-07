import React from "react";
import ThreatCard from "../components/ThreatCard";

function ThreatFeedPage() {
  const mockThreats = [
    { id: 1, title: "WormGPT Attack Attempt", severity: "High" },
    { id: 2, title: "Phishing Domain Detected", severity: "Medium" },
  ];

  return (
    <div className="page-container">
      <h2>⚠️ Threat Feed</h2>
      {mockThreats.map((t) => (
        <ThreatCard key={t.id} threat={t} />
      ))}
    </div>
  );
}

export default ThreatFeedPage;
