import React, { useState, useRef, useEffect } from 'react';
import { FaRobot } from 'react-icons/fa';
import './AIChatWidget.css';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Debug logging
  console.log('AIChatWidget rendered');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm Samiya, your AI assistant. I can help you learn about Digital Diary's features. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const quickQuestions = [
    "What is Digital Diary?",
    "How does mood tracking work?",
    "Tell me about task management",
    "What are the main features?",
    "How do I get started?"
  ];

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('what is') || message.includes('digital diary')) {
      return {
        text: "Digital Diary is your personal companion for organizing thoughts, tracking mood, and managing daily tasks. It's like having a smart journal that helps you reflect, plan, and grow! 📖✨",
        suggestions: ["How does mood tracking work?", "Tell me about task management"]
      };
    }
    
    if (message.includes('mood') || message.includes('tracking')) {
      return {
        text: "Our mood tracking feature lets you record your daily emotions and see patterns over time! 😊 You can rate your mood, add notes, and get insights about your emotional well-being. It's like having a personal therapist that helps you understand yourself better!",
        suggestions: ["What are the main features?", "How do I get started?"]
      };
    }
    
    if (message.includes('task') || message.includes('management') || message.includes('todo')) {
      return {
        text: "Task management in Digital Diary is super intuitive! 📝 You can create to-do lists, set deadlines, track progress, and even get AI-powered suggestions to boost your productivity. It's designed to help you stay organized and achieve your goals!",
        suggestions: ["Tell me about notes", "What other features are there?"]
      };
    }
    
    if (message.includes('note') || message.includes('notes')) {
      return {
        text: "Quick Notes let you capture thoughts instantly! 💭 Whether it's a brilliant idea, a reminder, or just something you want to remember - jot it down quickly. You can even record audio notes for when typing isn't convenient!",
        suggestions: ["How does mood tracking work?", "What is Digital Diary?"]
      };
    }
    
    if (message.includes('feature') || message.includes('main')) {
      return {
        text: "Digital Diary has 5 amazing features: 📚 Digital Diary (personal journaling), ✅ Task Management (to-do lists), 😊 Mood Tracking (emotional wellness), 📝 Quick Notes (instant thoughts), and 🎯 AI Assistant (personalized insights). Each one is designed to help you live your best life!",
        suggestions: ["How do I get started?", "Tell me about the AI assistant"]
      };
    }
    
    if (message.includes('start') || message.includes('begin') || message.includes('get started')) {
      return {
        text: "Getting started is super easy! 🚀 Just click 'Get Started Free' to create your account, then you can immediately start writing diary entries, creating tasks, tracking your mood, and taking notes. No credit card required - it's completely free!",
        suggestions: ["What is Digital Diary?", "Tell me about the features"]
      };
    }
    
    if (message.includes('ai') || message.includes('assistant')) {
      return {
        text: "Our AI Assistant is like having a personal wellness coach! 🤖 It analyzes your mood patterns, productivity trends, and provides personalized insights and suggestions. It celebrates your wins, offers support when you need it, and helps you grow!",
        suggestions: ["How does mood tracking work?", "What are the main features?"]
      };
    }
    
    if (message.includes('help') || message.includes('support')) {
      return {
        text: "I'm here to help! 😊 You can ask me about any feature, how to get started, or what makes Digital Diary special. You can also contact our support team anytime - we're always happy to assist you on your journey!",
        suggestions: ["What is Digital Diary?", "How do I get started?"]
      };
    }
    
    // Default response
    return {
      text: "That's a great question! 🤔 Digital Diary is all about helping you organize your thoughts, track your mood, and manage your daily life. Try asking me about our features, mood tracking, task management, or how to get started!",
      suggestions: ["What are the main features?", "How does mood tracking work?", "Tell me about task management"]
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowSuggestions(false); // Hide suggestions when user sends message

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse.text,
        suggestions: botResponse.suggestions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickQuestion = (question) => {
    setInputValue(question);
    setIsOpen(true); // Ensure chat is open when clicking suggestions
    handleSendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    // Hide suggestions when user starts typing
    if (e.target.value.trim() && showSuggestions) {
      setShowSuggestions(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div 
        className={`ai-chat-button ${isOpen ? 'active' : ''}`} 
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 99999,
          border: '3px solid white',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
        }}
      >
        <FaRobot style={{ color: 'white', fontSize: '24px' }} />
        <div className="ai-chat-pulse"></div>
        <div className="ai-chat-tooltip">Ask me anything!</div>
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div className="ai-chat-widget">
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <FaRobot className="ai-chat-header-icon" />
              <div>
                <h4>Samiya AI Assistant</h4>
                <span>Online • Ready to help</span>
              </div>
            </div>
            <button className="ai-chat-close" onClick={toggleChat}>
              <span style={{ 
                fontSize: '20px',
                color: '#dc2626',
                fontWeight: 'bold',
                fontFamily: 'Arial, sans-serif',
                lineHeight: '1'
              }}>✕</span>
            </button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`ai-chat-message ${message.type}`}>
                {message.type === 'bot' && (
                  <div className="ai-chat-avatar">
                    <FaRobot />
                  </div>
                )}
                <div className="ai-chat-message-content">
                  <div className="ai-chat-message-bubble">
                    <p>{message.text}</p>
                    {message.suggestions && (
                      <div className="ai-chat-suggestions">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            className="ai-chat-suggestion"
                            onClick={() => handleQuickQuestion(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="ai-chat-timestamp">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="ai-chat-message bot">
                <div className="ai-chat-avatar">
                  <FaRobot />
                </div>
                <div className="ai-chat-message-content">
                  <div className="ai-chat-message-bubble">
                    <div className="ai-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {showSuggestions && (
            <div className="ai-chat-quick-questions">
              <p>Quick questions:</p>
              <div className="ai-chat-quick-buttons">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    className="ai-chat-quick-btn"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="ai-chat-input">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about Digital Diary..."
              className="ai-chat-input-field"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="ai-chat-send-btn"
            >
              <span style={{ 
                fontSize: '22px',
                color: '#ffffff',
                fontWeight: 'bold',
                fontFamily: 'Arial, sans-serif',
                lineHeight: '1'
              }}>✈</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
