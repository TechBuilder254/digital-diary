import React, { useState, useRef, useEffect } from 'react';
import { FaRobot } from 'react-icons/fa';
import { FaPaperPlane } from 'react-icons/fa';

interface Message {
  id: number;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  suggestions?: string[];
}

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm Samiya, your AI assistant. I can help you learn about Digital Diary's features. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (): void => {
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

  const quickQuestions: string[] = [
    "What is Digital Diary?",
    "How does mood tracking work?",
    "Tell me about task management",
    "What are the main features?",
    "How do I get started?"
  ];

  interface BotResponse {
    text: string;
    suggestions: string[];
  }

  const getBotResponse = (userMessage: string): BotResponse => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('what is') || message.includes('digital diary')) {
      return {
        text: "Digital Diary is your personal companion for organizing thoughts, tracking mood, and managing daily tasks. It's like having a smart journal that helps you reflect, plan, and grow! 📖✨",
        suggestions: ["How does mood tracking work?", "Tell me about task management"]
      };
    }
    
    if (message.includes('mood') || message.includes('tracking')) {
      return {
        text: "Our mood tracking feature lets you record your daily emotions and see patterns over time! 😊 You can rate your mood, add notes, and get insights about your emotional well-being.",
        suggestions: ["What are the main features?", "How do I get started?"]
      };
    }
    
    if (message.includes('task') || message.includes('management') || message.includes('todo')) {
      return {
        text: "Task management in Digital Diary is super intuitive! 📝 You can create to-do lists, set deadlines, track progress, and even get AI-powered suggestions to boost your productivity.",
        suggestions: ["Tell me about notes", "What other features are there?"]
      };
    }
    
    if (message.includes('note') || message.includes('notes')) {
      return {
        text: "Quick Notes let you capture thoughts instantly! 💭 Whether it's a brilliant idea, a reminder, or just something you want to remember - jot it down quickly. You can even record audio notes!",
        suggestions: ["How does mood tracking work?", "What is Digital Diary?"]
      };
    }
    
    if (message.includes('feature') || message.includes('main')) {
      return {
        text: "Digital Diary has 5 amazing features: 📚 Digital Diary (personal journaling), ✅ Task Management, 😊 Mood Tracking, 📝 Quick Notes, and 🎯 AI Assistant. Each one is designed to help you live your best life!",
        suggestions: ["How do I get started?", "Tell me about the AI assistant"]
      };
    }
    
    if (message.includes('start') || message.includes('begin') || message.includes('get started')) {
      return {
        text: "Getting started is super easy! 🚀 Just click 'Get Started Free' to create your account, then you can immediately start writing diary entries, creating tasks, tracking your mood, and taking notes.",
        suggestions: ["What is Digital Diary?", "Tell me about the features"]
      };
    }
    
    if (message.includes('ai') || message.includes('assistant')) {
      return {
        text: "Our AI Assistant is like having a personal wellness coach! 🤖 It analyzes your mood patterns, productivity trends, and provides personalized insights and suggestions.",
        suggestions: ["How does mood tracking work?", "What are the main features?"]
      };
    }
    
    if (message.includes('help') || message.includes('support')) {
      return {
        text: "I'm here to help! 😊 You can ask me about any feature, how to get started, or what makes Digital Diary special.",
        suggestions: ["What is Digital Diary?", "How do I get started?"]
      };
    }
    
    return {
      text: "That's a great question! 🤔 Digital Diary is all about helping you organize your thoughts, track your mood, and manage your daily life. Try asking me about our features, mood tracking, task management, or how to get started!",
      suggestions: ["What are the main features?", "How does mood tracking work?", "Tell me about task management"]
    };
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowSuggestions(false);

    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      
      const botMessage: Message = {
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

  const handleQuickQuestion = (question: string): void => {
    setInputValue(question);
    setIsOpen(true);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
    if (e.target.value.trim() && showSuggestions) {
      setShowSuggestions(false);
    }
  };

  const toggleChat = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-110 z-50 flex items-center justify-center border-4 border-white ${
          isOpen ? 'ring-4 ring-indigo-300' : ''
        }`}
        onClick={toggleChat}
        aria-label="Toggle AI chat"
      >
        <FaRobot className="text-2xl" />
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed inset-4 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 sm:h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border-2 border-gray-200">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <FaRobot className="text-xl sm:text-2xl" />
              <div>
                <h4 className="font-bold text-sm sm:text-base">Samiya AI Assistant</h4>
                <span className="text-xs text-white/80 hidden sm:block">Online • Ready to help</span>
              </div>
            </div>
            <button 
              className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
              onClick={toggleChat}
            >
              <span className="text-xl font-bold">×</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                    <FaRobot />
                  </div>
                )}
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-xl p-3 ${
                    message.type === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    {message.suggestions && (
                      <div className="mt-2 space-y-1">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors block w-full text-left"
                            onClick={() => handleQuickQuestion(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                  <FaRobot />
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {showSuggestions && (
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2 font-semibold">Quick questions:</p>
              <div className="space-y-1">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    className="w-full text-left text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 sm:p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about Digital Diary..."
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;


