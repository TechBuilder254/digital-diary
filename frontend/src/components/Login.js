import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [isSignInMode, setIsSignInMode] = useState(true);
  const [isPasswordResetMode, setIsPasswordResetMode] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [signInUsername, setSignInUsername] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'

  // Show toast notification
  const showToastNotification = (message, type = 'success') => {
    setStatusMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      setShowToast(false);
      setStatusMessage('');
    }, 4000);
  };

  // Toggle sign in/sign up
  const switchAuthMode = () => {
    setIsSignInMode(!isSignInMode);
    setStatusMessage('');
    setIsPasswordResetMode(false);

    // Clear all form fields when switching
    setSignInUsername('');
    setSignInPassword('');
    setSignUpUsername('');
    setSignUpEmail('');
    setSignUpPassword('');
  };

  // Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setStatusMessage('');

    if (!signInUsername || !signInPassword) {
      showToastNotification('Please fill in all fields', 'error');
      return;
    }

    console.log('Attempting login with:', { username: signInUsername });

    try {
      const response = await axios.post('/api/auth?action=login', {
        action: 'login',
        username: signInUsername,
        password: signInPassword
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token || 'dummy-token');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('Login successful, navigating to dashboard...');
        showToastNotification('Login successful!', 'success');
        
        if (onLogin) {
          onLogin(response.data.user);
        }
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        console.log('Login failed:', response.data.message);
        showToastNotification(response.data.message || 'Sign in failed', 'error');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      showToastNotification(error.response?.data?.message || 'Sign in failed. Please try again.', 'error');
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setStatusMessage('');

    if (!signUpUsername || !signUpEmail || !signUpPassword) {
      showToastNotification('Please fill in all fields', 'error');
      return;
    }

    if (signUpPassword.length < 6) {
      showToastNotification('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      const response = await axios.post('/api/auth?action=register', {
        action: 'register',
        username: signUpUsername,
        email: signUpEmail,
        password: signUpPassword
      });

      if (response.data.success) {
        showToastNotification('Registration successful! Please sign in.', 'success');
        setIsSignInMode(true);
        setSignUpUsername('');
        setSignUpEmail('');
        setSignUpPassword('');
      } else {
        showToastNotification(response.data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showToastNotification(error.response?.data?.message || 'Registration failed. Please try again.', 'error');
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setStatusMessage('');

    if (!resetEmail || !resetNewPassword || !resetConfirmPassword) {
      showToastNotification('Please fill in all fields', 'error');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      showToastNotification('Passwords do not match', 'error');
      return;
    }

    if (resetNewPassword.length < 6) {
      showToastNotification('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      const response = await axios.post('/api/auth?action=forgot-password', {
        action: 'forgot-password',
        email: resetEmail,
        newPassword: resetNewPassword
      });

      if (response.data.success) {
        showToastNotification('Password updated successfully! Please sign in.', 'success');
        setIsPasswordResetMode(false);
        setResetEmail('');
        setResetNewPassword('');
        setResetConfirmPassword('');
      } else {
        showToastNotification(response.data.message || 'Password update failed', 'error');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      showToastNotification(error.response?.data?.message || 'Password update failed. Please try again.', 'error');
    }
  };

  return (
    <div className={`auth-page-wrapper ${isSignInMode ? '' : 'signup-mode-active'}`}>
      {/* Single Form Panel that changes content */}
      <div className="auth-form-panel">
        {!isPasswordResetMode ? (
          isSignInMode ? (
            <form onSubmit={handleSignIn}>
              <h2>Welcome Back</h2>
              <label htmlFor="signin-username">Username</label>
              <input
                id="signin-username"
                type="text"
                placeholder="Enter your username"
                value={signInUsername}
                onChange={(e) => setSignInUsername(e.target.value)}
              />
              <label htmlFor="signin-password">Password</label>
              <input
                id="signin-password"
                type="password"
                placeholder="Enter your password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
              />
              <div className="remember-user-section">
                <input
                  type="checkbox"
                  id="remember-user"
                  checked={rememberUser}
                  onChange={(e) => setRememberUser(e.target.checked)}
                />
                <label htmlFor="remember-user">Remember Me</label>
              </div>
              <button type="submit">Sign In</button>
              <p className="password-reset-link" onClick={() => setIsPasswordResetMode(true)}>
                Forgot Password?
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUp}>
              <h2>Create Account</h2>
              <label htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                type="text"
                placeholder="Enter your username"
                value={signUpUsername}
                onChange={(e) => setSignUpUsername(e.target.value)}
              />
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
              />
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="Enter your password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
              />
              <button type="submit">Sign Up</button>
            </form>
          )
        ) : (
          <form onSubmit={handlePasswordReset}>
            <h2>Reset Password</h2>
            <label htmlFor="reset-email">Email</label>
            <input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <label htmlFor="reset-new-password">New Password</label>
            <input
              id="reset-new-password"
              type="password"
              placeholder="Enter your new password"
              value={resetNewPassword}
              onChange={(e) => setResetNewPassword(e.target.value)}
            />
            <label htmlFor="reset-confirm-password">Confirm Password</label>
            <input
              id="reset-confirm-password"
              type="password"
              placeholder="Confirm your new password"
              value={resetConfirmPassword}
              onChange={(e) => setResetConfirmPassword(e.target.value)}
            />
            <button type="submit">Update Password</button>
            <p className="back-to-signin" onClick={() => setIsPasswordResetMode(false)}>
              Back to Sign In
            </p>
          </form>
        )}
      </div>

      {/* Overlay Panel - Always visible */}
      <div className="auth-overlay-section">
        <div className="auth-overlay-background">
          <div className="auth-overlay-panel">
            <div className="brand-logo-section">
              <div className="brand-logo-container">
                <img src="/Picture2.jpg" alt="Digital Diary Logo" className="brand-logo-image" />
                <span className="brand-logo-text">Digital Diary</span>
              </div>
            </div>
            {!isPasswordResetMode ? (
              isSignInMode ? (
                <>
                  <h2>Hello, Friend!</h2>
                  <p>Enter your personal details and start your journey with us</p>
                  <button className="overlay-ghost-button" onClick={switchAuthMode}>
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  <h2>Welcome Back!</h2>
                  <p>To keep connected with us please sign in with your personal info</p>
                  <button className="overlay-ghost-button" onClick={switchAuthMode}>
                    Sign In
                  </button>
                </>
              )
            ) : (
              <>
                <h2>Welcome Back!</h2>
                <p>To keep connected with us please sign in with your personal info</p>
                <button className="overlay-ghost-button" onClick={() => setIsPasswordResetMode(false)}>
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`toast-notification ${toastType}`}>
          <div className="toast-content">
            <div className="toast-icon">
              {toastType === 'success' ? '✓' : '⚠'}
            </div>
            <div className="toast-message">{statusMessage}</div>
            <button 
              className="toast-close" 
              onClick={() => setShowToast(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;