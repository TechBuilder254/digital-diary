import React, { useEffect, useState } from 'react';
import './Dashboard.css'; // Import the dashboard styling

const Dashboard = () => {
  const [username, setUsername] = useState('User');

  useEffect(() => {
    // Fetch username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <div className="dashboard-content">
      {/* MAIN HEADER */}
      <header className="dashboard-header">
        <h2>Welcome, {username}! 👋</h2>
      </header>

      {/* MAIN BODY */}
      <section className="dashboard-actions">
        <h3>What would you like to do today?</h3>
        <ul>
          <li>
            <a href="/todo">To-Do</a>
          </li>
          <li>
            <a href="/notes">Notes</a>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;
