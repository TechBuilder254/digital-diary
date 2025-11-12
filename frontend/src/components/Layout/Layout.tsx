import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import axios from '../../config/axios';
import { 
  FaBars, 
  FaTimes, 
  FaStickyNote, 
  FaSignOutAlt, 
  FaUser, 
  FaHome, 
  FaCheckSquare, 
  FaJournalWhills, 
  FaUserEdit, 
  FaHeadset, 
  FaPaperPlane, 
  FaSmile,
  FaMicrophone
} from 'react-icons/fa';
import QuickAudioRecorder from '../QuickAudioRecorder';

interface LayoutProps {
  children?: React.ReactNode;
  userName?: string;
}

interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface NoteData {
  title: string;
  content: string;
  category?: string;
}

interface AudioData {
  filename: string;
  duration: number;
  size: number;
  blob?: Blob;
}

const Layout: React.FC<LayoutProps> = ({ children, userName }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [showSupportSuccess, setShowSupportSuccess] = useState<boolean>(false);
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [showQuickAudioRecorder, setShowQuickAudioRecorder] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchUserInfo();
    fetchUserStats();
  }, []);

  const fetchUserStats = async (): Promise<void> => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser) as UserInfo;
        if (user.id) {
          const response = await fetch(`/api/users/profile/${user.id}/stats`);
          if (response.ok) {
            await response.json();
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Scroll to top when route changes - instant scroll
  useEffect(() => {
    // Scroll window immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Scroll main content container immediately
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
      contentRef.current.scrollTo(0, 0);
    }
    
    // Ensure scroll happens using requestAnimationFrame for immediate execution
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    });
    
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as HTMLElement;
      if (
        isMobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(target) &&
        !target.closest('.mobile-menu-button')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const fetchUserInfo = (): void => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser) as UserInfo);
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
  };

  const toggleSidebar = (): void => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavLinkClick = (): void => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = (): void => {
    localStorage.clear();
    navigate('/');
  };

  const handleQuickAudioSave = async (noteData: NoteData, audioData: AudioData): Promise<void> => {
    try {
      // Get user ID from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        alert('Please log in to save notes.');
        return;
      }
      
      const user = JSON.parse(storedUser);
      const userId = user.id ? parseInt(user.id, 10) : null;
      
      if (!userId) {
        alert('User ID not found. Please log in again.');
        return;
      }

      // Create note with audio metadata
      const noteWithAudio = {
        ...noteData,
        user_id: userId,
        audio_filename: audioData.filename,
        audio_duration: audioData.duration,
        audio_size: audioData.size,
        has_audio: true,
      };

      const response = await axios.post('/notes', noteWithAudio);
      const addedNote = response.data;
      console.log('Audio note saved successfully:', addedNote);
      
      // Close the recorder modal
      setShowQuickAudioRecorder(false);
      
      // Trigger refresh of notes list
      window.dispatchEvent(new CustomEvent('noteSaved'));
      
      // Show success message
      alert('Audio note saved successfully!');
    } catch (error) {
      console.error('Error saving audio note:', error);
      alert(error instanceof Error ? error.message : 'Failed to save audio note. Please try again.');
    }
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const handleOpenSupport = (): void => {
    setShowSupportModal(true);
  };

  const handleCloseSupport = (): void => {
    setShowSupportModal(false);
    setSupportMessage('');
  };

  const handleSendSupport = (): void => {
    if (!supportMessage.trim()) {
      alert('Please enter your message before sending.');
      return;
    }
    
    setShowSupportModal(false);
    setShowSupportSuccess(true);
    setSupportMessage('');
  };

  const handleCloseSupportSuccess = (): void => {
    setShowSupportSuccess(false);
  };

  const showText = !isCollapsed || isMobileMenuOpen;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 lg:w-64 transition-all duration-300 ease-in-out
          bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600
          shadow-xl lg:shadow-none
          ${isCollapsed && !isMobileMenuOpen ? 'lg:w-20' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-screen
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {userInfo?.avatar ? (
              <img 
                src={userInfo.avatar} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <FaUser className="text-white text-lg" />
              </div>
            )}
            {showText && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-white font-semibold text-sm truncate">
                  {userInfo?.username || userName || 'User'}
                </span>
                <span className="text-white/70 text-xs">Online</span>
              </div>
            )}
          </div>
          
          <button 
            className="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg transition-colors" 
            onClick={toggleSidebar}
            aria-label={isMobileMenuOpen ? "Close menu" : "Toggle sidebar"}
          >
            {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-2 lg:overflow-y-visible lg:py-2">
          {showText && (
            <h2 className="px-4 text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">
              Navigation
            </h2>
          )}
          <ul className="space-y-1 px-2">
            <li>
              <Link 
                to="/dashboard" 
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200
                  ${isActive('/dashboard') 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/80 hover:bg-white/10'
                  }
                `}
                onClick={handleNavLinkClick}
              >
                <FaHome className="text-xl flex-shrink-0" />
                {showText && <span className="font-medium">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/todo" 
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200
                  ${isActive('/todo') 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/80 hover:bg-white/10'
                  }
                `}
                onClick={handleNavLinkClick}
              >
                <FaCheckSquare className="text-xl flex-shrink-0" />
                {showText && <span className="font-medium">To-Do List</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/notes" 
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200
                  ${isActive('/notes') 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/80 hover:bg-white/10'
                  }
                `}
                onClick={handleNavLinkClick}
              >
                <FaStickyNote className="text-xl flex-shrink-0" />
                {showText && <span className="font-medium">Notes</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/entries" 
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200
                  ${isActive('/entries') 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/80 hover:bg-white/10'
                  }
                `}
                onClick={handleNavLinkClick}
              >
                <FaJournalWhills className="text-xl flex-shrink-0" />
                {showText && <span className="font-medium">Diary Entries</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/mood-tracker" 
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200
                  ${isActive('/mood-tracker') 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/80 hover:bg-white/10'
                  }
                `}
                onClick={handleNavLinkClick}
              >
                <FaSmile className="text-xl flex-shrink-0" />
                {showText && <span className="font-medium">Mood Tracker</span>}
              </Link>
            </li>
            <li>
              <button 
                className="w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200
                         text-white/80 hover:bg-white/10"
                onClick={() => {
                  handleOpenSupport();
                  handleNavLinkClick();
                }}
              >
                <FaHeadset className="text-xl flex-shrink-0" />
                {showText && <span className="font-medium">Support</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* Profile & Logout Section */}
        <div className="border-t border-white/20 p-3 space-y-2 flex-shrink-0">
          <Link 
            to="/profile" 
            className={`
              flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200
              ${isActive('/profile') 
                ? 'bg-white/20 text-white shadow-lg' 
                : 'text-white/80 hover:bg-white/10'
              }
            `}
            onClick={handleNavLinkClick}
          >
            <FaUserEdit className="text-xl flex-shrink-0" />
            {showText && <span className="font-medium">Profile</span>}
          </Link>
          <button 
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200
                     text-white/80 hover:bg-red-500/20 hover:text-white"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="text-xl flex-shrink-0" />
            {showText && <span className="font-medium">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 shadow-2xl border-b-4 border-cyan-300 px-4 py-3 flex items-center justify-between">
          <button 
            className="mobile-menu-button p-2 text-white hover:bg-white/30 rounded-lg transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-cyan-300/70"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-xl drop-shadow-2xl" />
            ) : (
              <FaBars className="text-xl drop-shadow-2xl" />
            )}
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-2xl tracking-wide px-3 py-1.5 rounded-lg bg-black/20 border-2 border-white/40 shadow-xl">
            Digital Diary
          </h1>
          {userInfo && (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-400 via-cyan-400 to-pink-400 flex items-center justify-center shadow-xl ring-3 ring-white/70 ring-offset-2 ring-offset-cyan-400 hover:scale-110 transition-transform duration-300">
                {userInfo.avatar ? (
                  <img src={userInfo.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white text-xs sm:text-sm font-bold drop-shadow-2xl">
                    {userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-bold text-white drop-shadow-2xl bg-black/30 px-3 py-1.5 rounded-full border border-white/40 shadow-xl hidden sm:block">
                {userInfo.username || 'User'}
              </span>
            </div>
          )}
        </header>
        
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 shadow-2xl border-b-4 border-cyan-300 rounded-tr-3xl relative overflow-hidden">
          {/* Title with background for visibility */}
          <div className="relative z-10">
            <h1 className="text-lg font-extrabold text-white drop-shadow-2xl tracking-wide px-3 py-2 rounded-lg bg-black/30 border-2 border-white/50 shadow-2xl">
              Welcome to Digital Diary
            </h1>
          </div>
          {userInfo && (
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-full border-2 border-white/50 shadow-2xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-cyan-400 to-pink-400 flex items-center justify-center shadow-xl ring-2 ring-white/70 ring-offset-1 ring-offset-cyan-400 hover:scale-110 transition-transform duration-300">
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-bold drop-shadow-2xl">
                      {userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white drop-shadow-2xl text-sm">{userInfo.username}</span>
                  <span className="text-xs text-white drop-shadow-xl">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </header>
        
        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8"
        >
          {children ?? <Outlet />}
        </main>
      </div>
      
      {/* Quick Audio Recorder - Only show on notes page when enabled */}
      {location.pathname === '/notes' && showQuickAudioRecorder && (
        <QuickAudioRecorder
          onSave={handleQuickAudioSave}
          onCancel={() => setShowQuickAudioRecorder(false)}
        />
      )}
      
      {/* Floating buttons for Notes page */}
      {location.pathname === '/notes' && (
        <>
          {/* Audio Recording Button - positioned above the notes button */}
          {!showQuickAudioRecorder && (
            <button
              onClick={() => setShowQuickAudioRecorder(true)}
              className="fixed bottom-28 right-6 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-30"
              title="Quick Audio Note"
              aria-label="Record quick audio note"
            >
              <FaMicrophone className="text-2xl" />
            </button>
          )}
        </>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseSupport}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaHeadset className="text-indigo-600" />
                Contact Support
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
                onClick={handleCloseSupport}
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                How can we help you?
              </label>
              <textarea
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 
                         focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none
                         text-gray-800 placeholder-gray-400"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe your issue or question here..."
                rows={6}
                autoFocus
              />
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button 
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl
                         hover:bg-gray-200 transition-colors"
                onClick={handleCloseSupport}
              >
                Cancel
              </button>
              <button 
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
                         font-semibold rounded-xl hover:shadow-lg transition-all flex items-center 
                         justify-center gap-2"
                onClick={handleSendSupport}
              >
                <FaPaperPlane />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Success Modal */}
      {showSupportSuccess && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseSupportSuccess}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-green-600 font-bold">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Message Sent!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Thank you for contacting us! We have received your message and will reply to you shortly.
            </p>
            <button 
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
                       font-semibold rounded-xl hover:shadow-lg transition-all"
              onClick={handleCloseSupportSuccess}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;

