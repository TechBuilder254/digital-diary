import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Entries from './components/Entries';
import MoodTracker from './components/moods';
import Tasks from './components/Tasks';
import ToDo from './components/ToDo';
import Profile from './components/Profile';
import Layout from './components/Layout/Layout';
import Notes from './components/Notes/Notes'; // Import the Notes component

const App = () => {
  // State to store the logged-in user's username
  const [userName, setUserName] = useState("");

  // Function to handle login (called from the Login component)
  const handleLogin = (username) => {
    setUserName(username);
  };

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={<Login onLogin={handleLogin} />} />

        {/* Routes with Layout (only accessible after login) */}
        <Route
          path="/dashboard"
          element={
            <Layout userName={userName}>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/entries"
          element={
            <Layout userName={userName}>
              <Entries />
            </Layout>
          }
        />
        <Route
          path="/tasks"
          element={
            <Layout userName={userName}>
              <Tasks />
            </Layout>
          }
        />
        <Route
          path="/mood-tracker"
          element={
            <Layout userName={userName}>
              <MoodTracker />
            </Layout>
          }
        />
        <Route
          path="/todo"
          element={
            <Layout userName={userName}>
              <ToDo />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout userName={userName}>
              <Profile />
            </Layout>
          }
        />

        {/* Notes Route */}
        <Route
          path="/notes"
          element={
            <Layout userName={userName}>
              <Notes />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;