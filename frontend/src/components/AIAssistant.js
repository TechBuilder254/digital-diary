import React, { useState, useEffect } from 'react';
import { FaRobot, FaLightbulb, FaHeart, FaChartLine } from 'react-icons/fa';
import './AIAssistant.css';

const AIAssistant = ({ userStats, recentMoods, recentTodos }) => {
  const [currentInsight, setCurrentInsight] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // AI-generated insights based on user data
  const generateInsights = () => {
    const insights = [];
    
    // Mood-based insights
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

    // Task completion insights
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

    // General wellness insights
    insights.push({
      type: 'wellness',
      icon: '🌟',
      title: 'Daily Wellness Tip',
      message: 'Remember to take breaks and practice self-care. Your mental health matters!',
      suggestion: 'Try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.',
      color: 'wellness'
    });

    // Motivational quotes
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

  // Auto-rotate insights
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

  const getColorClass = (color) => {
    const colorMap = {
      success: 'ai-insight-success',
      support: 'ai-insight-support',
      neutral: 'ai-insight-neutral',
      motivation: 'ai-insight-motivation',
      wellness: 'ai-insight-wellness',
      inspiration: 'ai-insight-inspiration'
    };
    return colorMap[color] || 'ai-insight-neutral';
  };

  return (
    <div className="ai-assistant">
      <div className="ai-assistant-header">
        <div className="ai-assistant-title">
          <FaRobot className="ai-robot-icon" />
          <h3>Samiya AI Assistant</h3>
        </div>
        <div className="ai-assistant-subtitle">
          Your personal wellness companion
        </div>
      </div>

      <div className="ai-insight-container">
        <div className={`ai-insight-card ${getColorClass(currentInsightData.color)}`}>
          <div className="ai-insight-header">
            <div className="ai-insight-icon">
              {currentInsightData.icon}
            </div>
            <div className="ai-insight-title">
              {currentInsightData.title}
            </div>
          </div>
          
          <div className="ai-insight-message">
            {isTyping ? (
              <div className="ai-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <p>{currentInsightData.message}</p>
            )}
          </div>

          {!isTyping && (
            <div className="ai-insight-suggestion">
              <FaLightbulb className="ai-suggestion-icon" />
              <span>{currentInsightData.suggestion}</span>
            </div>
          )}
        </div>

        <div className="ai-insight-navigation">
          {insights.map((_, index) => (
            <button
              key={index}
              className={`ai-nav-dot ${index === currentInsight ? 'active' : ''}`}
              onClick={() => {
                setIsTyping(true);
                setTimeout(() => {
                  setCurrentInsight(index);
                  setIsTyping(false);
                }, 500);
              }}
            />
          ))}
        </div>
      </div>

      <div className="ai-quick-actions">
        <button className="ai-action-btn">
          <FaChartLine />
          <span>View Analytics</span>
        </button>
        <button className="ai-action-btn">
          <FaHeart />
          <span>Wellness Tips</span>
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
