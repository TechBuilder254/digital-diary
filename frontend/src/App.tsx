import React, { useCallback } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard';
import Entries from './components/Entries';
import Notes from './components/Notes/Notes';
import Tasks from './components/Tasks';
import ToDo from './components/ToDo';
import Profile from './components/Profile';
import Moods from './components/moods';

const App: React.FC = () => {
  const handleLogin = useCallback((_user: { id: string; username: string; email: string }) => {
    // Login component persists user session and handles navigation.
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Login onLogin={handleLogin} />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/entries" element={<Entries />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/todo" element={<ToDo />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mood-tracker" element={<Moods />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
