import React, { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import { 
  FaTasks, 
  FaStickyNote, 
  FaBook, 
  FaSmile, 
  FaClipboardList, 
  FaChartLine, 
  FaRobot, 
  FaTimes 
} from 'react-icons/fa';
import AIAssistant from './AIAssistant';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  totalNotes: number;
  totalEntries: number;
  totalMoods: number;
  todayMood: string;
}

interface RecentActivity {
  type: string;
  text: string;
  time: string;
  icon: IconType;
}

interface AIData {
  userStats: {
    totalTodos: number;
    completedTodos: number;
    totalNotes: number;
    totalMoods: number;
  } | null;
  recentMoods: Array<{ rating: number; date: string }>;
  recentTodos: Array<any>;
}

const Dashboard: React.FC = () => {
  const [username, setUsername] = useState<string>('User');
  const [loading, setLoading] = useState<boolean>(true);
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
    totalEntries: 0,
    totalMoods: 0,
    todayMood: 'Not set'
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [aiData, setAiData] = useState<AIData>({
    userStats: null,
    recentMoods: [],
    recentTodos: []
  });
  const [aiPreviewMessage, setAiPreviewMessage] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUsername(userData.username || 'User');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && showAIModal) {
        setShowAIModal(false);
      }
    };

    if (showAIModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [showAIModal]);

  const fetchDashboardStats = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('Dashboard: Starting to fetch data...');
      
      const [tasksResponse, todosResponse, notesResponse, entriesResponse, moodsResponse] = await Promise.allSettled([
        axios.get('/tasks'),
        axios.get('/todo'),
        axios.get('/notes'),
        axios.get('/entries'),
        axios.get('/moods')
      ]);

      const tasks = tasksResponse.status === 'fulfilled' && tasksResponse.value?.data
        ? tasksResponse.value.data : [];
      const todos = todosResponse.status === 'fulfilled' && todosResponse.value?.data
        ? todosResponse.value.data : [];
      const notes = notesResponse.status === 'fulfilled' && notesResponse.value?.data
        ? notesResponse.value.data : [];
      const entries = entriesResponse.status === 'fulfilled' && entriesResponse.value?.data
        ? entriesResponse.value.data : [];
      const moods = moodsResponse.status === 'fulfilled' && moodsResponse.value?.data
        ? moodsResponse.value.data : [];
      
      const tasksArray = Array.isArray(tasks) ? tasks : [];
      const todosArray = Array.isArray(todos) ? todos : [];
      const notesArray = Array.isArray(notes) ? notes : [];
      const entriesArray = Array.isArray(entries) ? entries : [];
      const moodsArray = Array.isArray(moods) ? moods : [];

      const today = new Date().toDateString();
      const todayMoodEntry = moodsArray.find((mood: any) => new Date(mood.date).toDateString() === today);

      const totalTasks = tasksArray.length + todosArray.length;
      const completedTasks = tasksArray.filter((task: any) => task.is_completed).length + 
                           todosArray.filter((todo: any) => todo.completed).length;
      
      setStats({
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        totalNotes: notesArray.length || 0,
        totalEntries: entriesArray.length || 0,
        totalMoods: moodsArray.length || 0,
        todayMood: todayMoodEntry ? todayMoodEntry.mood : 'Not set'
      });

      generateRecentActivity(tasksArray, todosArray, notesArray, entriesArray, moodsArray);
      
      const aiDataObj: AIData = {
        userStats: {
          totalTodos: (tasksArray.length + todosArray.length),
          completedTodos: (tasksArray.filter((task: any) => task.is_completed).length + 
                          todosArray.filter((todo: any) => todo.completed).length),
          totalNotes: notesArray.length,
          totalMoods: moodsArray.length
        },
        recentMoods: moodsArray.slice(0, 7).map((mood: any) => ({
          rating: getMoodRating(mood.mood),
          date: mood.date
        })),
        recentTodos: [...tasksArray, ...todosArray].slice(0, 10)
      };
      
      setAiData(aiDataObj);
      
      const aiTotalTodos = aiDataObj.userStats?.totalTodos || 0;
      const aiCompletedTodos = aiDataObj.userStats?.completedTodos || 0;
      const completionRate = aiTotalTodos > 0 ? (aiCompletedTodos / aiTotalTodos) * 100 : 0;
      
      if (completionRate >= 80 && aiTotalTodos > 0) {
        setAiPreviewMessage("Great progress! You're doing amazing! 🎯");
      } else if (completionRate >= 50 && aiTotalTodos > 0) {
        setAiPreviewMessage("You're making steady progress! Keep it up! 📈");
      } else if (aiTotalTodos > 0) {
        setAiPreviewMessage("Ready to boost your productivity? Let's get started! 💪");
      } else if (moodsArray.length > 0) {
        setAiPreviewMessage("Your wellness journey looks great! Check your insights 🌟");
      } else {
        setAiPreviewMessage("Hi! I'm Samiya, your wellness companion. Tap to get started! 👋");
      }
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodRating = (moodText: string): number => {
    const moodMap: Record<string, number> = {
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

  const generateRecentActivity = (
    tasks: any[], 
    todos: any[], 
    notes: any[], 
    entries: any[], 
    moods: any[]
  ): void => {
    const activities: RecentActivity[] = [];
    
    tasks.slice(0, 2).forEach(task => {
      activities.push({
        type: 'task',
        text: `Task: ${task.title}`,
        time: new Date(task.created_at || task.deadline).toLocaleDateString(),
        icon: FaTasks
      });
    });

    todos.slice(0, 2).forEach(todo => {
      activities.push({
        type: 'task',
        text: `Todo: ${todo.text}`,
        time: new Date(todo.created_at || todo.expiry_date).toLocaleDateString(),
        icon: FaTasks
      });
    });

    notes.slice(0, 2).forEach(note => {
      activities.push({
        type: 'note',
        text: `Note: ${note.title}`,
        time: new Date(note.created_at).toLocaleDateString(),
        icon: FaStickyNote
      });
    });

    entries.slice(0, 2).forEach(entry => {
      activities.push({
        type: 'entry',
        text: `Diary Entry: ${entry.title}`,
        time: new Date(entry.created_at).toLocaleDateString(),
        icon: FaBook
      });
    });

    moods.slice(0, 2).forEach(mood => {
      activities.push({
        type: 'mood',
        text: `Mood: ${mood.mood}`,
        time: new Date(mood.date).toLocaleDateString(),
        icon: FaSmile
      });
    });

    setRecentActivity(activities.slice(0, 4));
  };

  const quickActions = [
    {
      title: 'Tasks',
      description: 'Manage your daily tasks',
      icon: FaTasks,
      link: '/tasks',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Notes',
      description: 'Quick notes and thoughts',
      icon: FaStickyNote,
      link: '/notes',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Diary Entries',
      description: 'Personal diary entries',
      icon: FaBook,
      link: '/entries',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Mood Tracker',
      description: 'Track your daily mood',
      icon: FaSmile,
      link: '/mood-tracker',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'To-Do List',
      description: 'Simple to-do items',
      icon: FaClipboardList,
      link: '/todo',
      gradient: 'from-pink-500 to-pink-600'
    }
  ];

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: FaTasks,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: FaChartLine,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Notes',
      value: stats.totalNotes,
      icon: FaStickyNote,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Diary Entries',
      value: stats.totalEntries,
      icon: FaBook,
      gradient: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Mood Entries',
      value: stats.totalMoods,
      icon: FaSmile,
      gradient: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-4 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1">
              Welcome back, <span className="text-yellow-300">{username}</span>! 👋
            </h1>
            <p className="text-white/90 text-sm">
              Ready to make today productive? Let's get started with your digital diary.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>📝</div>
            <div className="text-2xl animate-bounce" style={{ animationDelay: '1s' }}>✅</div>
            <div className="text-2xl animate-bounce" style={{ animationDelay: '2s' }}>📊</div>
          </div>
        </div>
      </div>

      {/* AI Assistant Teaser Card */}
      <div 
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-3 text-white shadow-lg 
                   cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        onClick={() => setShowAIModal(true)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <FaRobot className="text-lg" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm mb-0.5">Samiya AI Assistant</div>
            <div className="text-white/90 text-xs">{aiPreviewMessage || "Hi! I'm here to help with your wellness journey 👋"}</div>
          </div>
          <div className="text-lg">→</div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAIModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAIModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">AI Assistant</h2>
              <button 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setShowAIModal(false)}
                aria-label="Close AI Assistant"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <AIAssistant 
                userStats={aiData.userStats}
                recentMoods={aiData.recentMoods}
                recentTodos={aiData.recentTodos}
              />
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          let additionalInfo: string | null = null;
          if (stat.title === 'Total Tasks' && stats.totalTasks > 0) {
            const completionRate = stats.completedTasks > 0 
              ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
              : 0;
            additionalInfo = `${completionRate}% done`;
          } else if (stat.title === 'Completed' && stats.totalTasks > 0) {
            const remaining = stats.totalTasks - stats.completedTasks;
            additionalInfo = `${remaining} remaining`;
          } else if (stat.title === 'Notes' && stats.totalNotes > 0) {
            additionalInfo = 'Active';
          } else if (stat.title === 'Diary Entries' && stats.totalEntries > 0) {
            additionalInfo = 'Journals';
          } else if (stat.title === 'Mood Entries' && stats.totalMoods > 0) {
            additionalInfo = stats.todayMood !== 'Not set' ? `Today: ${stats.todayMood}` : 'Tracked';
          }
          
          return (
            <div key={stat.title} className={`${stat.bgColor} rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow`}>
              <div className={`w-8 h-8 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center mb-2`}>
                <stat.icon className="text-white text-sm" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-0.5">{stat.value}</h3>
                <p className="text-gray-600 font-medium text-sm">{stat.title}</p>
                {additionalInfo && (
                  <p className="text-xs text-gray-500 mt-0.5">{additionalInfo}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">Quick Actions</h2>
        <p className="text-gray-600 mb-3 text-sm">What would you like to do today?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="bg-white rounded-lg p-3 shadow-md hover:shadow-xl transition-all duration-300 
                       hover:scale-[1.02] flex items-center gap-3 group"
            >
              <div className={`w-10 h-10 bg-gradient-to-r ${action.gradient} rounded-lg flex items-center justify-center 
                            group-hover:scale-110 transition-transform`}>
                <action.icon className="text-white text-sm" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-0.5 text-sm">{action.title}</h3>
                <p className="text-xs text-gray-600">{action.description}</p>
              </div>
              <div className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all text-sm">→</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Recent Activity</h2>
        <div className="bg-white rounded-xl p-6 shadow-md">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading recent activity...</p>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <activity.icon className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{activity.text}</p>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No recent activity</h3>
              <p className="text-gray-600">Start by creating your first task, note, or diary entry!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

