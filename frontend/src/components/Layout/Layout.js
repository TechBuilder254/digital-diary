import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Layout.css';
import { FaBars, FaTasks, FaBook, FaSmile, FaClipboardList, FaStickyNote, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <button className="toggle-button" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h2 className="menu-title">{!isCollapsed && 'Menu'}</h2>
        <ul>
          <li>
            <Link to="/dashboard">
              <FaTasks /> {!isCollapsed && 'Dashboard'}
            </Link>
          </li>
          <li>
            <Link to="/tasks">
              <FaClipboardList /> {!isCollapsed && 'Tasks'}
            </Link>
          </li>
          <li>
            <Link to="/entries">
              <FaBook /> {!isCollapsed && 'Diary Entries'}
            </Link>
          </li>
          <li>
            <Link to="/mood-tracker">
              <FaSmile /> {!isCollapsed && 'Mood Tracker'}
            </Link>
          </li>
          <li>
            <Link to="/todo">
              <FaClipboardList /> {!isCollapsed && 'To-Do'}
            </Link>
          </li>
          <li>
            <Link to="/notes">
              <FaStickyNote /> {!isCollapsed && 'Notes'}
            </Link>
          </li>
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> {!isCollapsed && 'Log Out'}
        </button>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="top-header">
          <h1>Welcome to Digital Diary</h1>
          <div className="user-info">
            <Link to="/profile" className="profile-link">
              <FaUserCircle /> Profile
            </Link>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
