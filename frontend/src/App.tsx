import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Entries from './components/Entries';
import MoodTracker from './components/moods';
import Tasks from './components/Tasks';
import ToDo from './components/ToDo';
import Profile from './components/Profile';
import Layout from './components/Layout/Layout';
import Notes from './components/Notes/Notes';

// ScrollToTop component to scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Don't interfere with landing page
    if (pathname === '/') {
      return;
    }

    // Scroll main window to top immediately (instant, not smooth)
    window.scrollTo(0, 0);
    
    // Also scroll document.documentElement and document.body
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Scroll any content containers to top immediately
    const contentElements = document.querySelectorAll('.content, .main-content, .page-content, main, [role="main"]');
    contentElements.forEach(element => {
      if (element.scrollTo) {
        element.scrollTo(0, 0);
      } else {
        (element as HTMLElement).scrollTop = 0;
      }
    });

    // Force scroll to top immediately to ensure it works
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [pathname]);

  return null;
};

interface User {
  id: string;
  username: string;
  email: string;
}

const App: React.FC = () => {
  // State to store the logged-in user's information
  const [userName, setUserName] = useState<string>("");

  // Function to handle login (called from the Login component)
  const handleLogin = (user: User): void => {
    setUserName(user.username);
  };

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Root Route - Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Login Route */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

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


