// frontend/src/components/ThreatFeed.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import ThreatCard from "./ThreatCard";

const ThreatFeed = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch threat data from backend API
  useEffect(() => {
    const fetchThreats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/threats");
        setThreats(response.data.threats || []);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching threats.");
      } finally {
        setLoading(false);
      }
    };

    fetchThreats();

    // Optional: Poll every 30 seconds for live feed
    const interval = setInterval(fetchThreats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading threats...</p>;
  if (error) return <p className="status-message error">{error}</p>;

  return (
    <div className="threat-feed">
      {threats.length === 0 ? (
        <p>No threats detected.</p>
      ) : (
        threats.map((threat) => <ThreatCard key={threat.id} threat={threat} />)
      )}
    </div>
  );
};

export default ThreatFeed; 
