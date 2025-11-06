import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBook, 
  FaTasks, 
  FaSmile, 
  FaStickyNote, 
  FaClipboardList,
  FaArrowRight,
  FaStar,
  FaShieldAlt,
  FaMobileAlt,
  FaCloud,
  FaHeart,
  FaQuoteLeft,
  FaCheckCircle
} from 'react-icons/fa';
import AIChatWidget from './AIChatWidget';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isNotificationVisible, setIsNotificationVisible] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    document.body.classList.add('landing-page-active');
    document.documentElement.classList.add('landing-page-active');
    
    const layoutElements = document.querySelectorAll('.layout, .sidebar, .main-content');
    layoutElements.forEach(element => {
      (element as HTMLElement).style.display = 'none';
    });
    
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    const contentElements = document.querySelectorAll('.content, .main-content, .page-content');
    contentElements.forEach(element => {
      if ('scrollTo' in element && typeof (element as any).scrollTo === 'function') {
        (element as any).scrollTo(0, 0);
      } else {
        (element as HTMLElement).scrollTop = 0;
      }
    });

    const setupScrollAnimations = () => {
      const revealElements = document.querySelectorAll('[data-scroll-reveal]');
      const progressBar = document.querySelector('.scroll-progress-bar') as HTMLElement;
      
      const handleScroll = (): void => {
        if (progressBar) {
          const scrollTop = window.pageYOffset;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercent = (scrollTop / docHeight) * 100;
          progressBar.style.width = scrollPercent + '%';
        }
        
        revealElements.forEach(element => {
          const elementTop = element.getBoundingClientRect().top;
          const elementVisible = 200;
          
          if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('opacity-100', 'translate-y-0');
          }
        });
      };
      
      setTimeout(() => {
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        setTimeout(handleScroll, 100);
      }, 100);
      
      return () => window.removeEventListener('scroll', handleScroll);
    };

    const cleanupScrollAnimations = setupScrollAnimations();

    return () => {
      document.body.classList.remove('landing-page-active');
      document.documentElement.classList.remove('landing-page-active');
      
      layoutElements.forEach(element => {
        (element as HTMLElement).style.display = '';
      });
      
      cleanupScrollAnimations();
    };
  }, []);

  const handleGetStarted = (): void => {
    navigate('/login');
  };

  const features: Feature[] = [
    {
      icon: FaBook,
      title: 'Digital Diary',
      description: 'Capture your thoughts, memories, and experiences in a beautiful digital format.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: FaTasks,
      title: 'Task Management',
      description: 'Organize your daily tasks and stay productive with our intuitive task manager.',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: FaSmile,
      title: 'Mood Tracking',
      description: 'Track your emotional well-being and understand your mood patterns over time.',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: FaStickyNote,
      title: 'Quick Notes',
      description: 'Jot down ideas, reminders, and important information instantly.',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: FaClipboardList,
      title: 'To-Do Lists',
      description: 'Create and manage your to-do lists with ease and efficiency.',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      icon: FaHeart,
      title: 'Personal Growth',
      description: 'Reflect on your journey and track your personal development progress.',
      color: 'from-red-500 to-pink-600'
    }
  ];

  const testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      role: 'Student',
      content: 'This digital diary has transformed how I organize my thoughts and track my daily progress. The mood tracking feature is incredibly insightful!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Professional',
      content: 'The task management system is perfect for my busy schedule. I love how everything is integrated in one place.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Writer',
      content: 'As a writer, I need a reliable place to store my ideas and thoughts. This platform has become my digital sanctuary.',
      rating: 5
    }
  ];

  const benefits: string[] = [
    'Secure cloud storage',
    'Cross-platform access',
    'Beautiful, intuitive design',
    'Privacy-focused approach',
    'Regular backups',
    'Mobile-friendly interface'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div className="scroll-progress-bar h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transition-all duration-150"></div>
      </div>
      
      {/* Notification Banner */}
      {isNotificationVisible && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 relative z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <span className="text-sm md:text-base">
                <strong>Meet Samiya AI:</strong> Your personal wellness assistant is now live!
              </span>
            </div>
            <button 
              className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              aria-label="Close notification"
              onClick={() => setIsNotificationVisible(false)}
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 ${!isNotificationVisible ? 'top-0' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
                <FaBook />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-800">Digital</span>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Diary</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Features</a>
              <a href="#benefits" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Benefits</a>
              <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Reviews</a>
              <a href="#contact" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">Contact</a>
              <button
                onClick={handleGetStarted}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                <span>Get Started Free</span>
                <FaArrowRight />
              </button>
            </div>
            
            <button 
              className={`md:hidden p-2 ${isMobileMenuOpen ? 'text-indigo-600' : 'text-gray-700'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                <span className={`block h-0.5 bg-current transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block h-0.5 bg-current transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 bg-current transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-700 hover:text-indigo-600 font-medium">Features</a>
              <a href="#benefits" className="block text-gray-700 hover:text-indigo-600 font-medium">Benefits</a>
              <a href="#testimonials" className="block text-gray-700 hover:text-indigo-600 font-medium">Reviews</a>
              <a href="#contact" className="block text-gray-700 hover:text-indigo-600 font-medium">Contact</a>
              <button
                onClick={handleGetStarted}
                className="w-full px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold"
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className={`relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 ${!isNotificationVisible ? 'pt-16 lg:pt-24' : ''}`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left space-y-8" data-scroll-reveal>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200 shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-gray-700">AI-Powered Wellness Assistant</span>
              </div>
              
              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                  <span className="block text-gray-900">Your Digital</span>
                  <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Life Companion
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Capture memories, organize tasks, track moods, and grow with AI-powered insights—all in one beautiful platform.
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  className="group px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-3 relative overflow-hidden"
                  onClick={handleGetStarted}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>Get Started Free</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                <button 
                  className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-gray-200 flex items-center justify-center gap-2"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <FaBook />
                  <span>Explore Features</span>
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <span className="text-sm text-gray-600">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-indigo-500 text-xl" />
                  <span className="text-sm text-gray-600">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-500 text-xl" />
                  <span className="text-sm text-gray-600">Free Forever</span>
                </div>
              </div>
            </div>
            
            {/* Right Column - Floating Diary Visual */}
            <div className="relative hidden lg:flex items-center justify-center" data-scroll-reveal>
              <div className="relative">
                {/* Main Diary Book */}
                <div className="relative w-80 h-96 transform hover:scale-105 transition-transform duration-500 animate-float">
                  {/* Diary Book */}
                  <div className="relative w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl transform rotate-3">
                    {/* Book Cover Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                    <div className="absolute top-0 left-0 right-0 h-16 bg-white/20 rounded-t-2xl flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center">
                        <FaBook className="text-white text-2xl" />
                      </div>
                    </div>
                    
                    {/* Pages Effect */}
                    <div className="absolute top-20 left-0 right-0 bottom-0 bg-white/95 rounded-b-2xl p-6 space-y-3">
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-2 bg-indigo-200 rounded w-2/3 mt-4"></div>
                      <div className="h-2 bg-purple-200 rounded w-4/5"></div>
                      <div className="h-2 bg-pink-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-full mt-4"></div>
                      <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                    </div>
                    
                    {/* Binding */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-indigo-800 via-purple-800 to-pink-800 rounded-l-2xl"></div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-bounce-slow">
                      <FaStar className="text-white text-2xl" />
                    </div>
                    
                    <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                      <FaHeart className="text-white text-xl" />
                    </div>
                  </div>
                  
                  {/* Floating Particles */}
                  <div className="absolute -top-8 left-1/4 w-3 h-3 bg-purple-400 rounded-full opacity-60 animate-pulse"></div>
                  <div className="absolute top-1/4 -right-8 w-2 h-2 bg-pink-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="absolute bottom-1/4 -left-4 w-2.5 h-2.5 bg-indigo-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                </div>
                
                {/* Floating AI Badge */}
                <div className="absolute -top-4 -right-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-4 shadow-2xl transform hover:scale-110 transition-all animate-bounce-slow z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <div className="font-bold text-sm">Samiya AI</div>
                      <div className="text-xs opacity-90">Your wellness companion</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-scroll-reveal>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive suite of tools designed to help you organize, reflect, and grow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-100"
                data-scroll-reveal
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 text-white text-2xl`}>
                  <feature.icon />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div data-scroll-reveal>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why Choose Digital Diary?</h2>
              <p className="text-xl text-gray-600 mb-8">
                We've built a platform that prioritizes your privacy, security, and user experience above all else.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3" data-scroll-reveal>
                    <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4" data-scroll-reveal>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <FaShieldAlt className="text-indigo-600 text-xl" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Secure & Private</h3>
                <p className="text-gray-600">Your data is encrypted and protected</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FaMobileAlt className="text-purple-600 text-xl" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Access Anywhere</h3>
                <p className="text-gray-600">Works on all your devices</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <FaCloud className="text-pink-600 text-xl" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Cloud Sync</h3>
                <p className="text-gray-600">Automatic backups and sync</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-scroll-reveal>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Loved by Thousands</h2>
            <p className="text-xl text-gray-600">See what our users have to say about their experience</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg"
                data-scroll-reveal
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <FaQuoteLeft className="text-indigo-600 text-3xl mb-4" />
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" data-scroll-reveal>
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-white/90" data-scroll-reveal>
            Join thousands of users who have transformed their digital life with our platform.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2 mx-auto"
            data-scroll-reveal
          >
            <span>Get Started Free</span>
            <FaArrowRight />
          </button>
          <p className="mt-6 text-white/80" data-scroll-reveal>No credit card required • Free forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FaBook />
                </div>
                <span className="text-xl font-bold">Digital Diary</span>
              </div>
              <p className="text-gray-400">
                Your personal digital companion for organizing thoughts, tracking mood, and managing life's journey.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Digital Diary</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Task Management</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Mood Tracking</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Quick Notes</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:support@digitaldiary.com" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="mailto:contact@digitaldiary.com" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Digital Diary. All rights reserved.</p>
            <p className="mt-2">Designed by <span className="text-indigo-400">Samiya Nur</span></p>
          </div>
        </div>
      </footer>

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
};

export default LandingPage;


