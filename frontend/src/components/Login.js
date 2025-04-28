import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [isForgotPasswordActive, setIsForgotPasswordActive] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  // Toggle login/register
  const togglePanel = () => {
    setIsLoginActive(!isLoginActive);
    setMessage('');
    setIsForgotPasswordActive(false);

    // Clear all form fields when switching
    setLoginUsername('');
    setLoginPassword('');
    setRegisterUsername('');
    setRegisterEmail('');
    setRegisterPassword('');
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loginUsername && loginPassword) {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
          username: loginUsername,
          password: loginPassword,
        });

        console.log('Login response:', response.data);

        if (response.data.message === 'Login successful') {
          setMessage('Login successful!');
          localStorage.setItem('auth', 'true');
          localStorage.setItem('user', JSON.stringify(response.data.user));

          // Remember Me functionality
          if (rememberMe) {
            localStorage.setItem('rememberMe', JSON.stringify({ username: loginUsername, password: loginPassword }));
          } else {
            localStorage.removeItem('rememberMe');
          }

          // Pass the username to the parent component
          onLogin(loginUsername);

          console.log('Navigating to dashboard...');
          navigate('/dashboard');
        } else {
          setMessage(response.data.message || 'Login failed. Please try again.');
        }
      } catch (error) {
        setMessage('Login failed. Please check your credentials.');
        console.error(error);
      }
    } else {
      setMessage('Please enter both username and password.');
    }
  };

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerUsername || !registerEmail || !registerPassword) {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
      });

      console.log('Register response:', response.data);

      if (response.data.message === 'Registration successful!' || response.data.success === true) {
        setMessage('Registration successful! You can now log in.');
        setRegisterUsername('');
        setRegisterEmail('');
        setRegisterPassword('');
        setTimeout(() => {
          togglePanel(); // Switch to login panel
        }, 1000);
      } else {
        setMessage(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed. Please check your details.');
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotNewPassword || !forgotConfirmPassword) {
      setMessage('Please fill in all fields.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, {
        email: forgotEmail,
        newPassword: forgotNewPassword,
      });

      console.log('Forgot Password response:', response.data);

      if (response.data.message === 'Password reset successful') {
        setMessage('Password reset successful! You can now log in.');
        setForgotEmail('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setTimeout(() => {
          setIsForgotPasswordActive(false);
        }, 1000);
      } else {
        setMessage(response.data.message || 'Password reset failed. Please try again.');
      }
    } catch (error) {
      console.error('Forgot Password error:', error);
      setMessage('Password reset failed. Please check your details.');
    }
  };

  return (
    <div className={`container ${isLoginActive ? '' : 'right-panel-active'}`}>
      {!isForgotPasswordActive ? (
        <>
          {/* Login Form */}
          <div className="form-container login-container">
            <form onSubmit={handleLogin}>
              <h2>Login</h2>
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                placeholder="Enter your username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">Remember Me</label>
              </div>
              <button type="submit">Login</button>
              <p className="forgot-password" onClick={() => setIsForgotPasswordActive(true)}>
                Forgot Password?
              </p>
              {message && <p className="message">{message}</p>}
            </form>
          </div>

          {/* Register Form */}
          <div className="form-container register-container">
            <form onSubmit={handleRegister}>
              <h2>Register</h2>
              <label htmlFor="register-username">Username</label>
              <input
                id="register-username"
                type="text"
                placeholder="Enter your username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
              />
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                placeholder="Enter your email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                placeholder="Create a password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
              <button type="submit">Register</button>
              {message && <p className="message">{message}</p>}
            </form>
          </div>
        </>
      ) : (
        <div className="form-container forgot-password-container">
          <form onSubmit={handleForgotPassword}>
            <h2>Forgot Password</h2>
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            <label htmlFor="forgot-new-password">New Password</label>
            <input
              id="forgot-new-password"
              type="password"
              placeholder="Enter your new password"
              value={forgotNewPassword}
              onChange={(e) => setForgotNewPassword(e.target.value)}
            />
            <label htmlFor="forgot-confirm-password">Confirm Password</label>
            <input
              id="forgot-confirm-password"
              type="password"
              placeholder="Confirm your new password"
              value={forgotConfirmPassword}
              onChange={(e) => setForgotConfirmPassword(e.target.value)}
            />
            <button type="submit">Save</button>
            {message && <p className="message">{message}</p>}
          </form>
        </div>
      )}

      {/* Overlay Panel */}
      {!isForgotPasswordActive && (
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h2>Welcome Back!</h2>
              <p>To keep connected, please login with your personal info</p>
              <button className="ghost" onClick={togglePanel}>
                Login
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h2>Hello, Friend!</h2>
              <p>Enter your personal details and start your journey with us</p>
              <button className="ghost" onClick={togglePanel}>
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;