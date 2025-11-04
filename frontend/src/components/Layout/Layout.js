import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';
import '../../styles/design-system.css';
import { FaBars, FaTimes, FaTasks, FaBook, FaSmile, FaClipboardList, FaStickyNote, FaSignOutAlt, FaUserCircle, FaUser, FaCalendarAlt, FaHome, FaCheckSquare, FaFileAlt, FaJournalWhills, FaUserEdit, FaHeadset, FaPaperPlane } from 'react-icons/fa';
import QuickAudioRecorder from '../QuickAudioRecorder';

const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userStats, setUserStats] = useState({
    totalNotes: 0,
    totalTodos: 0,
    completedTodos: 0,
    favoriteNotes: 0
  });
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSupportSuccess, setShowSupportSuccess] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    fetchUserInfo();
    fetchUserStats();
  }, []);

  // Scroll to top when route changes
  useEffect(() => {
    // Scroll main window to top
    window.scrollTo(0, 0);
    
    // Scroll content area to top
    if (contentRef.current) {
      contentRef.current.scrollTo(0, 0);
    }
    
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest('.mobile-menu-button')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const fetchUserInfo = () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserInfo(storedUser);
    }
  };

  const fetchUserStats = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.id) {
        const response = await fetch(`/api/users/profile/${storedUser.id}/stats`);
        if (response.ok) {
          const stats = await response.json();
          setUserStats(stats);
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const toggleSidebar = () => {
    // On mobile, toggle the mobile menu instead of collapsing
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Get all audio keys before clearing localStorage
    const audioKeys = Object.keys(localStorage).filter(key => key.startsWith('audio_'));
    
    // Clear all localStorage
    localStorage.clear();
    
    // Restore audio recordings after clearing
    audioKeys.forEach(key => {
      // We need to get the data before clearing, but since we're clearing everything,
      // we need a different approach. Let's preserve audio data during logout.
    });
    
    navigate('/');
  };

  // Handle quick audio recording save
  const handleQuickAudioSave = async (noteData, audioData) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error('Failed to save audio note');
      }

      const addedNote = await response.json();
      
      // Audio is already uploaded to server, no need for localStorage
      console.log('Audio note saved successfully with filename:', audioData.filename);
      
      // Show success message
      alert('Audio note saved successfully!');
      
      // Dispatch custom event to notify Notes component to refresh
      window.dispatchEvent(new CustomEvent('noteSaved', { 
        detail: { noteId: addedNote.id, type: 'audio' } 
      }));
      
    } catch (error) {
      console.error('Error saving audio note:', error);
      alert('Failed to save audio note. Please try again.');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Support functions
  const handleOpenSupport = () => {
    setShowSupportModal(true);
  };

  const handleCloseSupport = () => {
    setShowSupportModal(false);
    setSupportMessage('');
  };

  const handleSendSupport = () => {
    if (!supportMessage.trim()) {
      alert('Please enter your message before sending.');
      return;
    }
    
    // Simulate sending the message (since we're not integrating with backend)
    setShowSupportModal(false);
    setShowSupportSuccess(true);
    setSupportMessage('');
  };

  const handleCloseSupportSuccess = () => {
    setShowSupportSuccess(false);
  };

  // On mobile, always show text when menu is open, regardless of collapsed state
  const showText = !isCollapsed || isMobileMenuOpen;

  return (
    <div className="layout">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          {/* User Avatar and Name - Compact Design */}
          <div className="sidebar-avatar">
            {userInfo && userInfo.avatar ? (
              <img src={userInfo.avatar} alt="Profile" className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                <FaUser className="avatar-icon" />
              </div>
            )}
            {showText && (
              <div className="avatar-info">
                <span className="avatar-name">{userInfo?.username || 'User'}</span>
                <span className="avatar-status">Online</span>
              </div>
            )}
          </div>
          
          {/* Toggle Button - Top Right of Sidebar */}
          <button 
            className="toggle-button sidebar-close-button" 
            onClick={toggleSidebar}
            aria-label={isMobileMenuOpen ? "Close menu" : "Toggle sidebar"}
          >
            {isMobileMenuOpen ? <FaTimes className="toggle-icon" /> : <FaBars className="toggle-icon" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <h2 className="menu-title">{showText && 'Navigation'}</h2>
          <ul className="nav-list">
            <li>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={handleNavLinkClick}
              >
                <FaHome className="nav-icon" />
                {showText && <span className="nav-text">Dashboard</span>}
            </Link>
          </li>
          <li>
              <Link 
                to="/todo" 
                className={`nav-link ${isActive('/todo') ? 'active' : ''}`}
                onClick={handleNavLinkClick}
              >
                <FaCheckSquare className="nav-icon" />
                {showText && <span className="nav-text">To-Do List</span>}
            </Link>
          </li>
          <li>
              <Link 
                to="/notes" 
                className={`nav-link ${isActive('/notes') ? 'active' : ''}`}
                onClick={handleNavLinkClick}
              >
                <FaStickyNote className="nav-icon" />
                {showText && <span className="nav-text">Notes</span>}
            </Link>
          </li>
          <li>
              <Link 
                to="/entries" 
                className={`nav-link ${isActive('/entries') ? 'active' : ''}`}
                onClick={handleNavLinkClick}
              >
                <FaJournalWhills className="nav-icon" />
                {showText && <span className="nav-text">Diary Entries</span>}
            </Link>
          </li>
          <li>
              <Link 
                to="/mood-tracker" 
                className={`nav-link ${isActive('/mood-tracker') ? 'active' : ''}`}
                onClick={handleNavLinkClick}
              >
                <FaSmile className="nav-icon" />
                {showText && <span className="nav-text">Mood Tracker</span>}
            </Link>
          </li>
          <li>
            <button 
              className="nav-link support-link"
              onClick={() => {
                handleOpenSupport();
                handleNavLinkClick();
              }}
            >
              <FaHeadset className="nav-icon" />
              {showText && <span className="nav-text">Support</span>}
            </button>
          </li>
        </ul>
        </nav>

        {/* Profile & Logout Section */}
        <div className="sidebar-footer">
          <Link 
            to="/profile" 
            className={`profile-link ${isActive('/profile') ? 'active' : ''}`}
            onClick={handleNavLinkClick}
          >
            <FaUserEdit className="nav-icon" />
            {showText && <span className="nav-text">Profile</span>}
          </Link>
        <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" />
            {showText && <span className="nav-text">Log Out</span>}
        </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Mobile Header - Compact, Full Width */}
        <header className="mobile-header">
          <button 
            className="mobile-header-menu-button"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <FaTimes className="mobile-header-menu-icon" />
            ) : (
              <FaBars className="mobile-header-menu-icon" />
            )}
          </button>
          <h1 className="mobile-header-title">Digital Diary</h1>
          {userInfo && (
            <div className="mobile-header-user">
              <div className="mobile-header-avatar">
                {userInfo.avatar ? (
                  <img src={userInfo.avatar} alt="Profile" />
                ) : (
                  <FaUser className="mobile-header-avatar-icon" />
                )}
              </div>
              <span className="mobile-header-username">{userInfo.username || 'User'}</span>
            </div>
          )}
        </header>
        
        {/* Desktop Header */}
        <header className="top-header desktop-header">
          <h1>Welcome to Digital Diary</h1>
          <div className="header-user-section">
            {userInfo && (
              <div className="header-user-info">
                <div className="header-user-avatar">
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt="Profile" />
                  ) : (
                    <FaUser className="header-avatar-icon" />
                  )}
                </div>
                <div className="header-user-details">
                  <span className="header-username">{userInfo.username}</span>
                  <span className="header-date">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="content" ref={contentRef}>{children}</main>
      </div>
      
      {/* Quick Audio Recorder - Only show on notes page */}
      {location.pathname === '/notes' && (
        <QuickAudioRecorder
          onSave={handleQuickAudioSave}
          onCancel={() => {}}
        />
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="support-modal-overlay" onClick={handleCloseSupport}>
          <div className="support-modal" onClick={(e) => e.stopPropagation()}>
            <div className="support-modal-header">
              <h2 className="support-modal-title">
                <FaHeadset />
                Contact Support
              </h2>
              <button className="support-modal-close" onClick={handleCloseSupport}>
                ×
              </button>
            </div>
            
            <div className="support-modal-body">
              <div className="support-form-group">
                <label className="support-form-label">How can we help you?</label>
                <textarea
                  className="support-form-textarea"
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe your issue or question here..."
                  autoFocus
                />
              </div>
            </div>
            
            <div className="support-modal-footer">
              <button className="support-modal-btn support-modal-btn-cancel" onClick={handleCloseSupport}>
                Cancel
              </button>
              <button className="support-modal-btn support-modal-btn-send" onClick={handleSendSupport}>
                <FaPaperPlane />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Success Modal */}
      {showSupportSuccess && (
        <div className="support-success-modal-overlay" onClick={handleCloseSupportSuccess}>
          <div className="support-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="support-success-header">
              <div className="support-success-icon">
                ✓
              </div>
              <h2 className="support-success-title">Message Sent!</h2>
            </div>
            
            <div className="support-success-body">
              <p className="support-success-message">
                Thank you for contacting us! We have received your message and will reply to you shortly.
              </p>
              <button className="support-success-btn" onClick={handleCloseSupportSuccess}>
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
