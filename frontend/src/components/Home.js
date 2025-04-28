import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('auth');
    console.log('Auth state:', isAuthenticated); // Log the auth state for debugging
    if (!isAuthenticated) {
      alert('You are not logged in. Redirecting to login page.');
      navigate('/'); // Redirect to login if not authenticated
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('auth'); // Remove auth state on logout
    alert('You have been logged out.');
    navigate('/'); // Redirect to login after logout
  };

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;