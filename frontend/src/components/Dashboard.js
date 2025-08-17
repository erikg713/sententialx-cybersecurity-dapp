import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '10:00', attacks: 3, defenses: 3 },
  { time: '11:00', attacks: 5, defenses: 5 },
  { time: '12:00', attacks: 2, defenses: 2 },
  { time: '13:00', attacks: 8, defenses: 7 },
  { time: '14:00', attacks: 4, defenses: 4 }
];

export default function Dashboard() {
  return (
    <section className="dashboard">
      <h2>Threat Dashboard</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#444" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="attacks" stroke="#ff4d4d" />
          <Line type="monotone" dataKey="defenses" stroke="#38bdf8" />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
