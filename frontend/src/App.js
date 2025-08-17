 import React from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Sentenial X</h1>
        <p>The Ultimate Cyber Guardian</p>
      </header>
      <main>
        <Login />
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
