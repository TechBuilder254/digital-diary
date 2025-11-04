import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSmile, FaFrown, FaAngry, FaMeh, FaHeart, FaCalendarAlt, FaChartLine, FaFire, FaRegSmile, FaRegFrown, FaTrash } from 'react-icons/fa';
import './the.css';
import '../styles/design-system.css';

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Define mood options with emojis and colors
  const moodOptions = [
    { id: 'happy', label: 'Happy', emoji: '😊', color: '#10b981', bgColor: '#ecfdf5' },
    { id: 'excited', label: 'Excited', emoji: '🤩', color: '#f59e0b', bgColor: '#fffbeb' },
    { id: 'content', label: 'Content', emoji: '😌', color: '#8b5cf6', bgColor: '#faf5ff' },
    { id: 'neutral', label: 'Neutral', emoji: '😐', color: '#6b7280', bgColor: '#f9fafb' },
    { id: 'sad', label: 'Sad', emoji: '😔', color: '#3b82f6', bgColor: '#eff6ff' },
    { id: 'angry', label: 'Angry', emoji: '😡', color: '#ef4444', bgColor: '#fef2f2' },
    { id: 'anxious', label: 'Anxious', emoji: '😰', color: '#f97316', bgColor: '#fff7ed' },
    { id: 'tired', label: 'Tired', emoji: '😴', color: '#6366f1', bgColor: '#eef2ff' }
  ];

  // Fetch mood history from the backend
  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const response = await axios.get('/api/moods');
      setMoodHistory(response.data);
    } catch (error) {
      console.error('Error fetching mood history:', error);
      alert('Failed to fetch mood history. Please try again later.');
    }
  };

  const handleDeleteMood = async (moodId) => {
    if (!window.confirm('Are you sure you want to delete this mood entry?')) {
      return;
    }

    try {
      await axios.delete(`/api/moods/${moodId}`);
      // Remove the deleted mood from the local state
      setMoodHistory(moodHistory.filter(mood => mood.id !== moodId));
      alert('Mood entry deleted successfully!');
    } catch (error) {
      console.error('Error deleting mood:', error);
      alert('Failed to delete mood entry. Please try again.');
    }
  };

  const handleMoodSubmit = async () => {
    if (!selectedMood) {
      alert('Please select a mood!');
      return;
    }

    try {
      const response = await axios.post('/api/moods', {
        mood: selectedMood,
        date: new Date().toISOString(),
      });
      setMoodHistory((prevHistory) => [response.data, ...prevHistory]);
      setSelectedMood('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Failed to save mood. Please try again.');
    }
  };

  // Calculate mood statistics
  const getMoodStats = () => {
    if (moodHistory.length === 0) return null;
    
    const moodCounts = {};
    moodHistory.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );
    
    const todayMood = moodHistory.find(entry => 
      new Date(entry.date).toDateString() === new Date().toDateString()
    );
    
    return {
      totalEntries: moodHistory.length,
      mostCommonMood,
      todayMood: todayMood?.mood || 'Not set',
      streak: calculateStreak(moodHistory)
    };
  };

  const calculateStreak = (history) => {
    if (history.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasEntry = history.some(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });
      
      if (hasEntry) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const stats = getMoodStats();

  return (
    <div className="mood-tracker-container">
      {/* Header Section */}
      <div className="mood-header animate-fade-in">
        <div className="header-content">
          <h1 className="page-title">
            <FaSmile className="title-icon" />
            Mood Tracker
          </h1>
          <p className="page-subtitle">Track your daily emotions and discover patterns</p>
        </div>
        {stats && (
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.streak}</span>
              <span className="stat-label">Day Streak</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.totalEntries}</span>
              <span className="stat-label">Total Entries</span>
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="success-message animate-fade-in">
          <FaHeart className="success-icon" />
          <span>Mood saved successfully! 🎉</span>
        </div>
      )}

      {/* Today's Mood Section */}
      <div className="today-mood-section animate-fade-in" style={{ '--delay': '0.1s' }}>
        <h2 className="section-title">
          <FaCalendarAlt className="section-icon" />
          How are you feeling today?
        </h2>
        
        {stats?.todayMood && stats.todayMood !== 'Not set' && (
          <div className="today-mood-display">
            <span className="today-mood-text">Today's mood:</span>
            <span className="today-mood-value">
              {moodOptions.find(m => m.id === stats.todayMood.toLowerCase())?.emoji} {stats.todayMood}
            </span>
          </div>
        )}

        <div className="mood-grid">
          {moodOptions.map((moodOption) => (
            <div
              key={moodOption.id}
              className={`mood-option ${selectedMood === moodOption.id ? 'selected' : ''}`}
              onClick={() => setSelectedMood(moodOption.id)}
              style={{
                '--mood-color': moodOption.color,
                '--mood-bg': moodOption.bgColor
              }}
            >
              <div className="mood-emoji">{moodOption.emoji}</div>
              <div className="mood-label">{moodOption.label}</div>
            </div>
          ))}
        </div>

        <button 
          className={`save-mood-btn ${selectedMood ? 'active' : ''}`}
          onClick={handleMoodSubmit}
          disabled={!selectedMood}
        >
          <FaHeart className="btn-icon" />
          Save My Mood
        </button>
      </div>

      {/* Mood Statistics */}
      {stats && (
        <div className="mood-stats-section animate-fade-in" style={{ '--delay': '0.2s' }}>
          <h2 className="section-title">
            <FaChartLine className="section-icon" />
            Your Mood Insights
          </h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon most-common">
                {moodOptions.find(m => m.id === stats.mostCommonMood.toLowerCase())?.emoji || '😊'}
              </div>
              <div className="stat-content">
                <div className="stat-title">Most Common Mood</div>
                <div className="stat-value">{stats.mostCommonMood}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon streak">
                <FaFire />
              </div>
              <div className="stat-content">
                <div className="stat-title">Current Streak</div>
                <div className="stat-value">{stats.streak} days</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mood History */}
      <div className="mood-history-section animate-fade-in" style={{ '--delay': '0.3s' }}>
        <h2 className="section-title">
          <FaCalendarAlt className="section-icon" />
          Recent Mood History
        </h2>
        
        {moodHistory.length > 0 ? (
          <div className="mood-history-list">
            {moodHistory.slice(0, 10).map((entry, index) => {
              const moodOption = moodOptions.find(m => m.id === entry.mood.toLowerCase());
              return (
                <div key={entry.id || index} className="mood-history-item">
                  <div className="mood-history-date">
                    <FaCalendarAlt className="date-icon" />
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                    <span className="time">{new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="mood-history-mood">
                    <span className="mood-emoji">{moodOption?.emoji || '😊'}</span>
                    <span className="mood-name">{entry.mood}</span>
                  </div>
                  <button 
                    className="delete-mood-btn"
                    onClick={() => handleDeleteMood(entry.id)}
                    title="Delete this mood entry"
                  >
                    <FaTrash className="delete-icon" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">😊</div>
            <h3 className="empty-title">No mood entries yet</h3>
            <p className="empty-description">Start tracking your daily moods to see your emotional patterns.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
