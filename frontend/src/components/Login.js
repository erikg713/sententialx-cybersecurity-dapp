 import React from 'react';

export default function Login() {
  const handleLogin = () => {
    alert('Pi Authentication SDK login flow will go here.');
  };

  return (
    <section className="login">
      <h2>Login with Pi</h2>
      <button onClick={handleLogin}>Login via Pi</button>
    </section>
  );
}
