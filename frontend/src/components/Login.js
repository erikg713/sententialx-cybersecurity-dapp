import React, { useState } from 'react';
import { apiLogin } from '../api';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');

  const handleLogin = async () => {
    const res = await apiLogin(userId);
    setStatus(res.message);
  };

  return (
    <section className="login">
      <h2>Login with Pi</h2>
      <input
        type="text"
        placeholder="Enter User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={handleLogin}>Login via Pi</button>
      {status && <p>{status}</p>}
    </section>
  );
      }
