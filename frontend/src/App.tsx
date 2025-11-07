import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SimpleLogin from './components/auth/SimpleLogin';
import LoginSuccess from './components/auth/LoginSuccess';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleLogin />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;


