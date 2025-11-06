import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { FaSmile, FaHeart, FaCalendarAlt, FaChartLine, FaFire, FaTrash } from 'react-icons/fa';

interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

interface MoodEntry {
  id: number;
  mood: string;
  date: string;
}

interface MoodStats {
  totalEntries: number;
  mostCommonMood: string;
  todayMood: string;
  streak: number;
}

const MoodTracker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const moodOptions: MoodOption[] = [
    { id: 'happy', label: 'Happy', emoji: '😊', color: '#10b981', bgColor: '#ecfdf5' },
    { id: 'excited', label: 'Excited', emoji: '🤩', color: '#f59e0b', bgColor: '#fffbeb' },
    { id: 'content', label: 'Content', emoji: '😌', color: '#8b5cf6', bgColor: '#faf5ff' },
    { id: 'neutral', label: 'Neutral', emoji: '😐', color: '#6b7280', bgColor: '#f9fafb' },
    { id: 'sad', label: 'Sad', emoji: '😔', color: '#3b82f6', bgColor: '#eff6ff' },
    { id: 'angry', label: 'Angry', emoji: '😡', color: '#ef4444', bgColor: '#fef2f2' },
    { id: 'anxious', label: 'Anxious', emoji: '😰', color: '#f97316', bgColor: '#fff7ed' },
    { id: 'tired', label: 'Tired', emoji: '😴', color: '#6366f1', bgColor: '#eef2ff' }
  ];

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async (): Promise<void> => {
    try {
      const response = await axios.get<MoodEntry[]>('/moods');
      setMoodHistory(response.data);
    } catch (error) {
      console.error('Error fetching mood history:', error);
      alert('Failed to fetch mood history. Please try again later.');
    }
  };

  const handleDeleteMood = async (moodId: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this mood entry?')) {
      return;
    }

    try {
      await axios.delete(`/moods/${moodId}`);
      setMoodHistory(moodHistory.filter(mood => mood.id !== moodId));
      alert('Mood entry deleted successfully!');
    } catch (error) {
      console.error('Error deleting mood:', error);
      alert('Failed to delete mood entry. Please try again.');
    }
  };

  const handleMoodSubmit = async (): Promise<void> => {
    if (!selectedMood) {
      alert('Please select a mood!');
      return;
    }

    try {
      const response = await axios.post<MoodEntry>('/moods', {
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

  const calculateStreak = (history: MoodEntry[]): number => {
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

  const getMoodStats = (): MoodStats | null => {
    if (moodHistory.length === 0) return null;
    
    const moodCounts: Record<string, number> = {};
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

  const stats = getMoodStats();

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-xl p-4 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1 flex items-center gap-2">
              <FaSmile className="text-base" />
              Mood Tracker
            </h1>
            <p className="text-white/90 text-sm">Track your daily emotions and discover patterns</p>
          </div>
          {stats && (
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-xl font-bold">{stats.streak}</div>
                <div className="text-xs text-white/80">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{stats.totalEntries}</div>
                <div className="text-xs text-white/80">Total Entries</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg text-sm">
          <FaHeart />
          <span>Mood saved successfully! 🎉</span>
        </div>
      )}

      {/* Today's Mood Section */}
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <FaCalendarAlt className="text-indigo-600 text-sm" />
          How are you feeling today?
        </h2>
        
        {stats?.todayMood && stats.todayMood !== 'Not set' && (
          <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
            <span className="text-gray-700 font-medium text-sm">Today's mood: </span>
            <span className="text-base font-bold text-indigo-600">
              {moodOptions.find(m => m.id === stats.todayMood.toLowerCase())?.emoji} {stats.todayMood}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {moodOptions.map((moodOption) => (
            <div
              key={moodOption.id}
              className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                selectedMood === moodOption.id
                  ? 'border-indigo-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedMood(moodOption.id)}
              style={{
                backgroundColor: selectedMood === moodOption.id ? moodOption.bgColor : 'white'
              }}
            >
              <div className="text-2xl mb-1 text-center">{moodOption.emoji}</div>
              <div className="text-center font-semibold text-gray-800 text-xs">{moodOption.label}</div>
            </div>
          ))}
        </div>

        <button 
          className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
            selectedMood
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-105'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          onClick={handleMoodSubmit}
          disabled={!selectedMood}
        >
          <FaHeart className="inline mr-2" />
          Save My Mood
        </button>
      </div>

      {/* Mood Statistics */}
      {stats && (
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FaChartLine className="text-indigo-600 text-sm" />
            Your Mood Insights
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-xl">
                  {moodOptions.find(m => m.id === stats.mostCommonMood.toLowerCase())?.emoji || '😊'}
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-medium">Most Common Mood</div>
                  <div className="text-lg font-bold text-gray-900">{stats.mostCommonMood}</div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white text-base">
                  <FaFire />
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-medium">Current Streak</div>
                  <div className="text-lg font-bold text-gray-900">{stats.streak} days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mood History */}
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <FaCalendarAlt className="text-indigo-600 text-sm" />
          Recent Mood History
        </h2>
        
        {moodHistory.length > 0 ? (
          <div className="space-y-2">
            {moodHistory.slice(0, 10).map((entry, index) => {
              const moodOption = moodOptions.find(m => m.id === entry.mood.toLowerCase());
              return (
                <div key={entry.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">{moodOption?.emoji || '😊'}</div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{entry.mood}</div>
                      <div className="text-xs text-gray-600 flex items-center gap-2">
                        <FaCalendarAlt />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                        <span className="text-gray-400">•</span>
                        <span>{new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={() => handleDeleteMood(entry.id)}
                    title="Delete this mood entry"
                  >
                    <FaTrash />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">😊</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No mood entries yet</h3>
            <p className="text-gray-600 text-sm">Start tracking your daily moods to see your emotional patterns.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;


