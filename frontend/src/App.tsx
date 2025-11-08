import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import ProLoginPage from './components/auth/ProLoginPage';
import LoginSuccess from './components/auth/LoginSuccess';

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<ProLoginPage />} />
      <Route path="/login-success" element={<LoginSuccess />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default App;
