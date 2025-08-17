 import React from 'react';

export default function Dashboard() {
  return (
    <section className="dashboard">
      <h2>Threat Dashboard</h2>
      <div className="stats">
        <p>Active Defenses: 12</p>
        <p>Intrusions Blocked: 245</p>
        <p>Countermeasures Executed: 57</p>
      </div>
    </section>
  );
}
