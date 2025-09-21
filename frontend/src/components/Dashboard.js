import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTasks, FaStickyNote, FaBook, FaSmile, FaClipboardList, FaChartLine, FaCalendarAlt, FaBell } from 'react-icons/fa';
import './Dashboard.css';
import '../styles/design-system.css';
import AIAssistant from './AIAssistant';

const Dashboard = () => {
  const [username, setUsername] = useState('User');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
    totalEntries: 0,
    totalMoods: 0,
    todayMood: 'Not set'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [aiData, setAiData] = useState({
    userStats: null,
    recentMoods: [],
    recentTodos: []
  });

  useEffect(() => {
    // Fetch username from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUsername(userData.username || 'User');
    }

    // Fetch dashboard statistics
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      console.log('Dashboard: Starting to fetch data...');
      
      // Fetch all data in parallel
      const [tasksResponse, todosResponse, notesResponse, entriesResponse, moodsResponse] = await Promise.allSettled([
        fetch('http://localhost:5000/api/tasks'),
        fetch('http://localhost:5000/api/todo'),
        fetch('http://localhost:5000/api/notes'),
        fetch('http://localhost:5000/api/entries'),
        fetch('http://localhost:5000/api/moods')
      ]);

      // Process each response
      const tasks = tasksResponse.status === 'fulfilled' ? await tasksResponse.value.json() : [];
      const todos = todosResponse.status === 'fulfilled' ? await todosResponse.value.json() : [];
      const notes = notesResponse.status === 'fulfilled' ? await notesResponse.value.json() : [];
      const entries = entriesResponse.status === 'fulfilled' ? await entriesResponse.value.json() : [];
      const moods = moodsResponse.status === 'fulfilled' ? await moodsResponse.value.json() : [];

      console.log('Dashboard: Data fetched:', {
        tasks: tasks.length,
        todos: todos.length,
        notes: notes.length,
        entries: entries.length,
        moods: moods.length
      });

      // Get today's mood
      const today = new Date().toDateString();
      const todayMoodEntry = moods.find(mood => new Date(mood.date).toDateString() === today);

      const totalTasks = tasks.length + todos.length;
      const completedTasks = tasks.filter(task => task.is_completed).length + todos.filter(todo => todo.completed).length;
      
      console.log('Dashboard: Calculated stats:', {
        totalTasks,
        completedTasks,
        totalNotes: notes.length,
        totalEntries: entries.length,
        totalMoods: moods.length
      });

      setStats({
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        totalNotes: notes.length || 0,
        totalEntries: entries.length || 0,
        totalMoods: moods.length || 0,
        todayMood: todayMoodEntry ? todayMoodEntry.mood : 'Not set'
      });

      // Generate recent activity
      generateRecentActivity(tasks, todos, notes, entries, moods);
      
      // Prepare data for AI Assistant
      setAiData({
        userStats: {
          totalTodos: (tasks.length + todos.length),
          completedTodos: (tasks.filter(task => task.is_completed).length + todos.filter(todo => todo.completed).length),
          totalNotes: notes.length,
          totalMoods: moods.length
        },
        recentMoods: moods.slice(0, 7).map(mood => ({
          rating: getMoodRating(mood.mood),
          date: mood.date
        })),
        recentTodos: [...tasks, ...todos].slice(0, 10)
      });
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert mood text to rating
  const getMoodRating = (moodText) => {
    const moodMap = {
      'Very Happy': 5,
      'Happy': 4,
      'Neutral': 3,
      'Sad': 2,
      'Very Sad': 1,
      'Excited': 5,
      'Content': 4,
      'Okay': 3,
      'Down': 2,
      'Depressed': 1
    };
    return moodMap[moodText] || 3;
  };

  const generateRecentActivity = (tasks, todos, notes, entries, moods) => {
    const activities = [];
    
    // Add recent tasks
    const recentTasks = tasks.slice(0, 2);
    recentTasks.forEach(task => {
      activities.push({
        type: 'task',
        text: `Task: ${task.title}`,
        time: new Date(task.created_at || task.deadline).toLocaleDateString(),
        icon: FaTasks
      });
    });

    // Add recent todos
    const recentTodos = todos.slice(0, 2);
    recentTodos.forEach(todo => {
      activities.push({
        type: 'task',
        text: `Todo: ${todo.text}`,
        time: new Date(todo.created_at || todo.expiry_date).toLocaleDateString(),
        icon: FaTasks
      });
    });

    // Add recent notes
    const recentNotes = notes.slice(0, 2);
    recentNotes.forEach(note => {
      activities.push({
        type: 'note',
        text: `Note: ${note.title}`,
        time: new Date(note.created_at).toLocaleDateString(),
        icon: FaStickyNote
      });
    });

    // Add recent entries
    const recentEntries = entries.slice(0, 2);
    recentEntries.forEach(entry => {
      activities.push({
        type: 'entry',
        text: `Diary Entry: ${entry.title}`,
        time: new Date(entry.created_at).toLocaleDateString(),
        icon: FaBook
      });
    });

    // Add recent moods
    const recentMoods = moods.slice(0, 2);
    recentMoods.forEach(mood => {
      activities.push({
        type: 'mood',
        text: `Mood: ${mood.mood}`,
        time: new Date(mood.date).toLocaleDateString(),
        icon: FaSmile
      });
    });

    // Sort by date and take the most recent 4
    setRecentActivity(activities.slice(0, 4));
  };

  const quickActions = [
    {
      title: 'Tasks',
      description: 'Manage your daily tasks',
      icon: FaTasks,
      link: '/tasks',
      color: 'var(--primary-500)',
      gradient: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
    },
    {
      title: 'Notes',
      description: 'Quick notes and thoughts',
      icon: FaStickyNote,
      link: '/notes',
      color: 'var(--accent-500)',
      gradient: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))'
    },
    {
      title: 'Diary Entries',
      description: 'Personal diary entries',
      icon: FaBook,
      link: '/entries',
      color: 'var(--success-500)',
      gradient: 'linear-gradient(135deg, var(--success-500), var(--success-600))'
    },
    {
      title: 'Mood Tracker',
      description: 'Track your daily mood',
      icon: FaSmile,
      link: '/mood-tracker',
      color: 'var(--warning-500)',
      gradient: 'linear-gradient(135deg, var(--warning-500), var(--warning-600))'
    },
    {
      title: 'To-Do List',
      description: 'Simple to-do items',
      icon: FaClipboardList,
      link: '/todo',
      color: 'var(--secondary-500)',
      gradient: 'linear-gradient(135deg, var(--secondary-500), var(--secondary-600))'
    }
  ];

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: FaTasks,
      color: 'var(--primary-500)',
      bgColor: 'var(--primary-50)'
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: FaChartLine,
      color: 'var(--success-500)',
      bgColor: 'var(--success-50)'
    },
    {
      title: 'Notes',
      value: stats.totalNotes,
      icon: FaStickyNote,
      color: 'var(--accent-500)',
      bgColor: 'var(--accent-50)'
    },
    {
      title: 'Diary Entries',
      value: stats.totalEntries,
      icon: FaBook,
      color: 'var(--warning-500)',
      bgColor: 'var(--warning-50)'
    },
    {
      title: 'Mood Entries',
      value: stats.totalMoods,
      icon: FaSmile,
      color: 'var(--pink-500)',
      bgColor: 'var(--pink-50)'
    }
  ];

  return (
    <div className="dashboard-content">
      {/* Welcome Header */}
      <div className="welcome-section animate-fade-in">
        <div className="welcome-content">
          <h1 className="welcome-title">
            Welcome back, <span className="username-highlight">{username}</span>! 👋
          </h1>
          <p className="welcome-subtitle">
            Ready to make today productive? Let's get started with your digital diary.
          </p>
        </div>
        <div className="welcome-illustration">
          <div className="floating-elements">
            <div className="floating-icon" style={{ '--delay': '0s' }}>📝</div>
            <div className="floating-icon" style={{ '--delay': '1s' }}>✅</div>
            <div className="floating-icon" style={{ '--delay': '2s' }}>📊</div>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant 
        userStats={aiData.userStats}
        recentMoods={aiData.recentMoods}
        recentTodos={aiData.recentTodos}
      />

      {/* Statistics Cards */}
      <div className="stats-grid animate-fade-in" style={{ '--delay': '0.2s' }}>
        {statCards.map((stat, index) => (
          <div key={stat.title} className="stat-card" style={{ '--delay': `${index * 0.1}s` }}>
            <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
              <stat.icon />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section animate-fade-in" style={{ '--delay': '0.4s' }}>
        <h2 className="section-title">Quick Actions</h2>
        <p className="section-subtitle">What would you like to do today?</p>
        
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <Link
              key={action.title}
              to={action.link}
              className="action-card"
              style={{ '--delay': `${index * 0.1}s` }}
            >
              <div className="action-icon" style={{ background: action.gradient }}>
                <action.icon />
              </div>
              <div className="action-content">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-description">{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity animate-fade-in" style={{ '--delay': '0.6s' }}>
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-card">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading recent activity...</p>
            </div>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  <activity.icon />
                </div>
                <div className="activity-content">
                  <p className="activity-text">{activity.text}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3 className="empty-title">No recent activity</h3>
              <p className="empty-description">Start by creating your first task, note, or diary entry!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
