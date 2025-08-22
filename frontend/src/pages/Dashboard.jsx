import React, { useEffect, useState } from 'react';
import AlertCard from '../components/AlertCard';
import { fetchAlerts } from '../services/api';

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts().then(setAlerts);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Live Threat Feed</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
