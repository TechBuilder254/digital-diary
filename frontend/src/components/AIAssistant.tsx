import React, { useState, useEffect } from 'react';
import { FaRobot, FaLightbulb, FaHeart, FaChartLine } from 'react-icons/fa';

interface UserStats {
  totalTodos: number;
  completedTodos: number;
  totalNotes: number;
  totalMoods: number;
}

interface RecentMood {
  rating: number;
  date: string;
}

interface Insight {
  type: string;
  icon: string;
  title: string;
  message: string;
  suggestion: string;
  color: string;
}

interface AIAssistantProps {
  userStats: UserStats | null;
  recentMoods: RecentMood[];
  recentTodos: any[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ userStats, recentMoods, recentTodos }) => {
  const [currentInsight, setCurrentInsight] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    if (recentMoods && recentMoods.length > 0) {
      const avgMood = recentMoods.reduce((sum, mood) => sum + mood.rating, 0) / recentMoods.length;
      
      if (avgMood >= 4) {
        insights.push({
          type: 'mood',
          icon: '😊',
          title: 'Great Mood Trend!',
          message: `You've been feeling great lately! Your average mood is ${avgMood.toFixed(1)}/5. Keep up the positive energy!`,
          suggestion: 'Consider journaling about what\'s making you happy to maintain this positive streak.',
          color: 'success'
        });
      } else if (avgMood <= 2) {
        insights.push({
          type: 'mood',
          icon: '🤗',
          title: 'We\'re Here for You',
          message: `I notice you've been feeling down lately. Your average mood is ${avgMood.toFixed(1)}/5.`,
          suggestion: 'Try taking a short walk, listening to music, or talking to a friend. Small steps can make a big difference.',
          color: 'support'
        });
      } else {
        insights.push({
          type: 'mood',
          icon: '😌',
          title: 'Balanced Mood',
          message: `Your mood has been stable at ${avgMood.toFixed(1)}/5. Consistency is key to emotional well-being.`,
          suggestion: 'Consider trying a new activity or hobby to add some excitement to your routine.',
          color: 'neutral'
        });
      }
    }

    if (userStats && userStats.totalTodos > 0) {
      const completionRate = (userStats.completedTodos / userStats.totalTodos) * 100;
      
      if (completionRate >= 80) {
        insights.push({
          type: 'productivity',
          icon: '🎯',
          title: 'Productivity Champion!',
          message: `Amazing! You've completed ${completionRate.toFixed(0)}% of your tasks. You're on fire!`,
          suggestion: 'Consider setting more challenging goals to keep the momentum going.',
          color: 'success'
        });
      } else if (completionRate <= 30) {
        insights.push({
          type: 'productivity',
          icon: '💪',
          title: 'Let\'s Boost Productivity',
          message: `You've completed ${completionRate.toFixed(0)}% of your tasks. Every step counts!`,
          suggestion: 'Try breaking large tasks into smaller, manageable chunks. You\'ve got this!',
          color: 'motivation'
        });
      } else {
        insights.push({
          type: 'productivity',
          icon: '📈',
          title: 'Steady Progress',
          message: `You're making good progress with ${completionRate.toFixed(0)}% task completion.`,
          suggestion: 'Focus on completing one task at a time to maintain this steady pace.',
          color: 'neutral'
        });
      }
    }

    insights.push({
      type: 'wellness',
      icon: '🌟',
      title: 'Daily Wellness Tip',
      message: 'Remember to take breaks and practice self-care. Your mental health matters!',
      suggestion: 'Try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.',
      color: 'wellness'
    });

    const quotes = [
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Believe you can and you're halfway there. - Theodore Roosevelt",
      "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
      "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
    ];

    insights.push({
      type: 'motivation',
      icon: '💫',
      title: 'Daily Inspiration',
      message: quotes[Math.floor(Math.random() * quotes.length)],
      suggestion: 'Write down one thing you\'re grateful for today.',
      color: 'inspiration'
    });

    return insights;
  };

  const insights = generateInsights();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        setCurrentInsight((prev) => (prev + 1) % insights.length);
        setIsTyping(false);
      }, 1000);
    }, 8000);

    return () => clearInterval(interval);
  }, [insights.length]);

  const currentInsightData = insights[currentInsight];

  const getColorClasses = (color: string): string => {
    const colorMap: Record<string, string> = {
      success: 'bg-green-50 border-green-200 text-green-900',
      support: 'bg-blue-50 border-blue-200 text-blue-900',
      neutral: 'bg-gray-50 border-gray-200 text-gray-900',
      motivation: 'bg-orange-50 border-orange-200 text-orange-900',
      wellness: 'bg-purple-50 border-purple-200 text-purple-900',
      inspiration: 'bg-pink-50 border-pink-200 text-pink-900'
    };
    return colorMap[color] || 'bg-gray-50 border-gray-200 text-gray-900';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <FaRobot className="text-3xl text-indigo-600" />
          <h3 className="text-2xl font-bold text-gray-900">Samiya AI Assistant</h3>
        </div>
        <p className="text-gray-600">Your personal wellness companion</p>
      </div>

      <div className="relative">
        <div className={`border-2 rounded-xl p-6 transition-all ${getColorClasses(currentInsightData.color)}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">{currentInsightData.icon}</div>
            <div className="font-bold text-lg">{currentInsightData.title}</div>
          </div>
          
          <div className="mb-4 min-h-[60px]">
            {isTyping ? (
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-current rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            ) : (
              <p>{currentInsightData.message}</p>
            )}
          </div>

          {!isTyping && (
            <div className="flex items-start gap-2 pt-4 border-t border-current/20">
              <FaLightbulb className="text-xl mt-0.5 flex-shrink-0" />
              <span className="text-sm">{currentInsightData.suggestion}</span>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {insights.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentInsight 
                  ? 'bg-indigo-600 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => {
                setIsTyping(true);
                setTimeout(() => {
                  setCurrentInsight(index);
                  setIsTyping(false);
                }, 500);
              }}
              aria-label={`Go to insight ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all">
          <FaChartLine className="text-indigo-600" />
          <span className="font-semibold text-gray-700">View Analytics</span>
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all">
          <FaHeart className="text-pink-600" />
          <span className="font-semibold text-gray-700">Wellness Tips</span>
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;


