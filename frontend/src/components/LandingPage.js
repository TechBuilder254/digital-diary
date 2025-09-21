import React, { useEffect } from 'react';
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
import './LandingPage.css';
import AIChatWidget from './AIChatWidget';

const LandingPage = () => {
  const navigate = useNavigate();

  // Force scroll to top when component mounts and setup scroll effects
  useEffect(() => {
    // Add class to body and html
    document.body.classList.add('landing-page-active');
    document.documentElement.classList.add('landing-page-active');
    
    // Hide any existing layout elements
    const layoutElements = document.querySelectorAll('.layout, .sidebar, .main-content');
    layoutElements.forEach(element => {
      element.style.display = 'none';
    });
    
    // Force scroll to top
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also try to scroll any content containers to top
    const contentElements = document.querySelectorAll('.content, .main-content, .page-content');
    contentElements.forEach(element => {
      if (element.scrollTo) {
        element.scrollTo(0, 0);
      } else {
        element.scrollTop = 0;
      }
    });

    // Setup scroll-triggered animations and progress indicator
    const setupScrollAnimations = () => {
      const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
      const progressBar = document.querySelector('.scroll-progress-bar');
      
      const handleScroll = () => {
        // Scroll progress indicator
        if (progressBar) {
          const scrollTop = window.pageYOffset;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercent = (scrollTop / docHeight) * 100;
          progressBar.style.width = scrollPercent + '%';
        }
        
        // Reveal animations
        revealElements.forEach(element => {
          const elementTop = element.getBoundingClientRect().top;
          const elementVisible = 200; // Increased visibility threshold
          
          if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('revealed');
          }
        });
      };
      
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check on load
        
        // Also check after a short delay to catch any missed elements
        setTimeout(handleScroll, 100);
      }, 100);
      
      return () => window.removeEventListener('scroll', handleScroll);
    };

    const cleanupScrollAnimations = setupScrollAnimations();

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('landing-page-active');
      document.documentElement.classList.remove('landing-page-active');
      
      // Show layout elements again
      layoutElements.forEach(element => {
        element.style.display = '';
      });
      
      // Cleanup scroll animations
      cleanupScrollAnimations();
    };
  }, []);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const features = [
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

  const testimonials = [
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

  const benefits = [
    'Secure cloud storage',
    'Cross-platform access',
    'Beautiful, intuitive design',
    'Privacy-focused approach',
    'Regular backups',
    'Mobile-friendly interface'
  ];

  return (
    <div className="landing-page">
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress">
        <div className="scroll-progress-bar"></div>
      </div>
      
      {/* Notification Banner */}
      <div className="landing-notification-banner">
        <div className="landing-notification-content">
          <div className="landing-notification-left">
            <span className="landing-notification-icon">🤖</span>
            <span className="landing-notification-text">
              <strong>Meet Samiya AI:</strong> Your personal wellness assistant is now live!
            </span>
          </div>
          <button className="landing-notification-close" aria-label="Close notification">
            <span>×</span>
          </button>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-nav-content">
            <div className="landing-logo">
              <div className="landing-logo-icon">
                <FaBook />
              </div>
              <div className="landing-logo-text">
                <span className="landing-logo-primary">Digital</span>
                <span className="landing-logo-secondary">Diary</span>
              </div>
            </div>
            
            {/* Navigation Menu */}
            <ul className="landing-nav-menu">
              <li className="landing-nav-item">
                <a href="#features" className="landing-nav-link" onClick={(e) => { e.preventDefault(); document.querySelector('.landing-features')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  Features
                </a>
              </li>
              <li className="landing-nav-item">
                <a href="#benefits" className="landing-nav-link" onClick={(e) => { e.preventDefault(); document.querySelector('.landing-benefits')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  Benefits
                </a>
              </li>
              <li className="landing-nav-item">
                <a href="#testimonials" className="landing-nav-link" onClick={(e) => { e.preventDefault(); document.querySelector('.landing-testimonials')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  Reviews
                </a>
              </li>
              <li className="landing-nav-item">
                <a href="#contact" className="landing-nav-link" onClick={(e) => { e.preventDefault(); document.querySelector('.landing-footer')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  Contact
                </a>
              </li>
            </ul>
            
            <div className="landing-nav-cta">
              <button
                onClick={handleGetStarted}
                className="landing-cta-button"
              >
                <span className="landing-cta-text">Get Started Free</span>
                <span className="landing-cta-arrow">→</span>
              </button>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button className="landing-mobile-menu-toggle">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean & Elegant */}
      <section className="landing-hero">
        <div className="hero-background">
          <div className="hero-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
            <div className="particle particle-6"></div>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-book-illustration">
            <div className="book-cover">
              <div className="book-title">Digital Diary</div>
              <div className="book-subtitle">Your Personal Journey</div>
            </div>
            <div className="book-pages">
              <div className="page page-1"></div>
              <div className="page page-2"></div>
              <div className="page page-3"></div>
            </div>
            <div className="floating-notes">
              <div className="note note-1">💭</div>
              <div className="note note-2">✨</div>
              <div className="note note-3">📝</div>
              <div className="note note-4">🌟</div>
            </div>
          </div>
          
          <div className="hero-text">
            <h1 className="hero-title">
              Every Day is a Page in Your Story
            </h1>
            <p className="hero-subtitle">
              Write. Reflect. Grow. Your personal online diary awaits.
            </p>
            <button 
              className="hero-button"
              onClick={handleGetStarted}
            >
              <span className="button-icon">✨</span>
              <span className="button-text">Start Writing</span>
              <div className="button-glow"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-features-container">
          <div className="landing-features-header scroll-reveal">
            <h2 className="landing-features-title">
              Everything You Need
            </h2>
            <p className="landing-features-description">
              A comprehensive suite of tools designed to help you organize, reflect, and grow.
            </p>
          </div>
          
          <div className="landing-features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="landing-feature-card scroll-reveal"
                style={{ '--card-index': index }}
              >
                <div className={`landing-feature-icon ${
                  index === 0 ? 'landing-feature-icon-blue' :
                  index === 1 ? 'landing-feature-icon-green' :
                  index === 2 ? 'landing-feature-icon-yellow' :
                  index === 3 ? 'landing-feature-icon-pink' :
                  index === 4 ? 'landing-feature-icon-indigo' :
                  'landing-feature-icon-red'
                }`}>
                  <feature.icon />
                </div>
                <h3 className="landing-feature-title">{feature.title}</h3>
                <p className="landing-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="landing-benefits">
        <div className="landing-benefits-container">
          <div className="landing-benefits-grid">
            <div className="landing-benefits-content scroll-reveal-left">
              <h2 className="landing-benefits-title">
                Why Choose Digital Diary?
              </h2>
              <p className="landing-benefits-description">
                We've built a platform that prioritizes your privacy, security, and user experience above all else.
              </p>
              <div className="landing-benefits-list">
                {benefits.map((benefit, index) => (
                  <div key={index} className="landing-benefit-item scroll-reveal" style={{ '--item-index': index }}>
                    <FaCheckCircle className="landing-benefit-icon" />
                    <span className="landing-benefit-text">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="landing-benefits-visual scroll-reveal-right">
              <div className="landing-benefits-card">
                <div className="landing-benefit-card-item scroll-reveal-scale" style={{ '--item-index': 0 }}>
                  <div className="landing-benefit-card-icon">
                    <FaShieldAlt />
                  </div>
                  <div className="landing-benefit-card-content">
                    <h3>Secure & Private</h3>
                    <p>Your data is encrypted and protected</p>
                  </div>
                </div>
                <div className="landing-benefit-card-item scroll-reveal-scale" style={{ '--item-index': 1 }}>
                  <div className="landing-benefit-card-icon">
                    <FaMobileAlt />
                  </div>
                  <div className="landing-benefit-card-content">
                    <h3>Access Anywhere</h3>
                    <p>Works on all your devices</p>
                  </div>
                </div>
                <div className="landing-benefit-card-item scroll-reveal-scale" style={{ '--item-index': 2 }}>
                  <div className="landing-benefit-card-icon">
                    <FaCloud />
                  </div>
                  <div className="landing-benefit-card-content">
                    <h3>Cloud Sync</h3>
                    <p>Automatic backups and sync</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="landing-testimonials">
        <div className="landing-testimonials-container">
          <div className="landing-testimonials-header scroll-reveal">
            <h2 className="landing-testimonials-title">
              Loved by Thousands
            </h2>
            <p className="landing-testimonials-description">
              See what our users have to say about their experience
            </p>
          </div>
          
          <div className="landing-testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="landing-testimonial-card scroll-reveal"
                style={{ '--card-index': index }}
              >
                <div className="landing-testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="landing-testimonial-star" />
                  ))}
                </div>
                <FaQuoteLeft className="landing-testimonial-quote" />
                <p className="landing-testimonial-text">
                  "{testimonial.content}"
                </p>
                <div className="landing-testimonial-author">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-cta-container">
          <h2 className="landing-cta-title scroll-reveal">
            Ready to Start Your Journey?
          </h2>
          <p className="landing-cta-description scroll-reveal">
            Join thousands of users who have transformed their digital life with our platform.
          </p>
          <button
            onClick={handleGetStarted}
            className="landing-cta-button-large scroll-reveal"
          >
            <span>Get Started Free</span>
            <FaArrowRight className="landing-button-icon" />
          </button>
          <p className="landing-cta-note scroll-reveal">No credit card required • Free forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <div className="landing-footer-grid">
            <div className="landing-footer-brand">
              <div className="landing-footer-logo">
                <div className="landing-footer-logo-icon">
                  <FaBook />
                </div>
                <span className="landing-footer-logo-text">Digital Diary</span>
              </div>
              <p className="landing-footer-description">
                Your personal digital companion for organizing thoughts, tracking mood, and managing life's journey.
              </p>
            </div>
            <div>
              <h3 className="landing-footer-section">Features</h3>
              <ul className="landing-footer-list">
                <li><a href="#features" onClick={(e) => { e.preventDefault(); document.querySelector('.landing-features')?.scrollIntoView({ behavior: 'smooth' }); }}>Digital Diary</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); document.querySelector('.landing-features')?.scrollIntoView({ behavior: 'smooth' }); }}>Task Management</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); document.querySelector('.landing-features')?.scrollIntoView({ behavior: 'smooth' }); }}>Mood Tracking</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); document.querySelector('.landing-features')?.scrollIntoView({ behavior: 'smooth' }); }}>Quick Notes</a></li>
              </ul>
            </div>
            <div>
              <h3 className="landing-footer-section">Support</h3>
              <ul className="landing-footer-list">
                <li><a href="mailto:support@digitaldiary.com">Help Center</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="mailto:contact@digitaldiary.com">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="landing-footer-bottom">
            <p>&copy; 2024 Digital Diary. All rights reserved.</p>
            <p className="footer-designer">
              Designed by <span className="designer-name">Samiya Nur</span>
            </p>
          </div>
        </div>
      </footer>

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
};

export default LandingPage;
