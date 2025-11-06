import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

interface LoginProps {
  onLogin: (user: { id: string; username: string; email: string }) => void;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

type ToastType = 'success' | 'error';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignInMode, setIsSignInMode] = useState<boolean>(true);
  const [isPasswordResetMode, setIsPasswordResetMode] = useState<boolean>(false);
  const navigate = useNavigate();

  // Form states
  const [signInUsername, setSignInUsername] = useState<string>('');
  const [signInPassword, setSignInPassword] = useState<string>('');
  const [rememberUser, setRememberUser] = useState<boolean>(false);
  const [signUpUsername, setSignUpUsername] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastType, setToastType] = useState<ToastType>('success');

  // Show toast notification
  const showToastNotification = (message: string, type: ToastType = 'success'): void => {
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
  const switchAuthMode = (): void => {
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
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setStatusMessage('');

    if (!signInUsername || !signInPassword) {
      showToastNotification('Please fill in all fields', 'error');
      return;
    }

    console.log('Attempting login with:', { username: signInUsername });

    try {
      const response = await axios.post<AuthResponse>('/api/auth?action=login', {
        action: 'login',
        username: signInUsername,
        password: signInPassword
      });

      console.log('Login response:', response.data);

      if (response.data.success && response.data.user) {
        localStorage.setItem('token', response.data.token || 'dummy-token');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('Login successful, navigating to dashboard...');
        showToastNotification('Login successful!', 'success');
        
        onLogin(response.data.user);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        console.log('Login failed:', response.data.message);
        showToastNotification(response.data.message || 'Sign in failed', 'error');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      showToastNotification(
        axiosError.response?.data?.message || 'Sign in failed. Please try again.', 
        'error'
      );
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
      const response = await axios.post<AuthResponse>('/api/auth?action=register', {
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
      const axiosError = error as AxiosError<{ message?: string }>;
      showToastNotification(
        axiosError.response?.data?.message || 'Registration failed. Please try again.', 
        'error'
      );
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
      const response = await axios.post<AuthResponse>('/api/auth?action=forgot-password', {
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
      const axiosError = error as AxiosError<{ message?: string }>;
      showToastNotification(
        axiosError.response?.data?.message || 'Password update failed. Please try again.', 
        'error'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-2 sm:p-4">
      <div className={`
        relative w-full max-w-4xl h-[500px] sm:h-[600px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden
        ${isSignInMode ? '' : 'signup-mode'}
      `}>
        {/* Form Panel */}
        <div className={`
          absolute top-0 right-0 h-full w-1/2 transition-all duration-600 ease-in-out
          flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 text-center
          bg-gradient-to-br from-slate-50 to-slate-100 z-10
          ${isSignInMode ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {!isPasswordResetMode ? (
            isSignInMode ? (
              <form onSubmit={handleSignIn} className="w-full max-w-sm">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 md:mb-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome Back
                </h2>
                <label htmlFor="signin-username" className="block text-left mb-1 sm:mb-2 text-slate-700 font-semibold text-xs sm:text-sm">
                  Username
                </label>
                <input
                  id="signin-username"
                  type="text"
                  placeholder="Enter your username"
                  value={signInUsername}
                  onChange={(e) => setSignInUsername(e.target.value)}
                  className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 mb-2 sm:mb-3 md:mb-4 border-2 border-slate-200 rounded-xl sm:rounded-2xl text-slate-800 font-medium text-sm sm:text-base
                           focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 focus:outline-none
                           transition-all duration-300 hover:border-slate-300"
                />
                <label htmlFor="signin-password" className="block text-left mb-1 sm:mb-2 text-slate-700 font-semibold text-xs sm:text-sm">
                  Password
                </label>
                <input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 mb-2 sm:mb-3 md:mb-4 border-2 border-slate-200 rounded-xl sm:rounded-2xl text-slate-800 font-medium text-sm sm:text-base
                           focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 focus:outline-none
                           transition-all duration-300 hover:border-slate-300"
                />
                <div className="flex items-center mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm text-slate-600">
                  <input
                    type="checkbox"
                    id="remember-user"
                    checked={rememberUser}
                    onChange={(e) => setRememberUser(e.target.checked)}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 accent-indigo-600"
                  />
                  <label htmlFor="remember-user" className="font-medium">Remember Me</label>
                </div>
                <button 
                  type="submit"
                  className="w-full py-2.5 sm:py-3 md:py-4 px-6 sm:px-8 mt-3 sm:mt-4 md:mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm sm:text-base
                           font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/30
                           hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5
                           active:translate-y-0 transition-all duration-300"
                >
                  Sign In
                </button>
                <p 
                  className="mt-2 sm:mt-3 md:mt-5 text-xs sm:text-sm text-indigo-600 font-medium cursor-pointer hover:text-purple-600 transition-colors"
                  onClick={() => setIsPasswordResetMode(true)}
                >
                  Forgot Password?
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="w-full max-w-sm">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 md:mb-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Create Account
                </h2>
                <label htmlFor="signup-username" className="block text-left mb-1 sm:mb-2 text-slate-700 font-semibold text-xs sm:text-sm">
                  Username
                </label>
                <input
                  id="signup-username"
                  type="text"
                  placeholder="Enter your username"
                  value={signUpUsername}
                  onChange={(e) => setSignUpUsername(e.target.value)}
                  className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 mb-2 sm:mb-3 md:mb-4 border-2 border-slate-200 rounded-xl sm:rounded-2xl text-slate-800 font-medium text-sm sm:text-base
                           focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 focus:outline-none
                           transition-all duration-300 hover:border-slate-300"
                />
                <label htmlFor="signup-email" className="block text-left mb-1 sm:mb-2 text-slate-700 font-semibold text-xs sm:text-sm">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 mb-2 sm:mb-3 md:mb-4 border-2 border-slate-200 rounded-xl sm:rounded-2xl text-slate-800 font-medium text-sm sm:text-base
                           focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 focus:outline-none
                           transition-all duration-300 hover:border-slate-300"
                />
                <label htmlFor="signup-password" className="block text-left mb-1 sm:mb-2 text-slate-700 font-semibold text-xs sm:text-sm">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 mb-2 sm:mb-3 md:mb-4 border-2 border-slate-200 rounded-xl sm:rounded-2xl text-slate-800 font-medium text-sm sm:text-base
                           focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 focus:outline-none
                           transition-all duration-300 hover:border-slate-300"
                />
                <button 
                  type="submit"
                  className="w-full py-2.5 sm:py-3 md:py-4 px-6 sm:px-8 mt-3 sm:mt-4 md:mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm sm:text-base
                           font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/30
                           hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5
                           active:translate-y-0 transition-all duration-300"
                >
                  Sign Up
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handlePasswordReset} className="w-full max-w-sm">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 md:mb-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Reset Password
              </h2>
              <label htmlFor="reset-email" className="block text-left mb-1 sm:mb-2 text-slate-700 font-semibold text-xs sm:text-sm">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 mb-2 sm:mb-3 md:mb-4 border-2 border-slate-200 rounded-xl sm:rounded-2xl text-slate-800 font-medium text-sm sm:text-base
                         focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 focus:outline-none
                         transition-all duration-300 hover:border-slate-300"
              />
              <label htmlFor="reset-new-password" className="block text-left mb-1 sm:mb-2 text-slate-700 font-semibold text-xs sm:text-sm">
                New Password
              </label>
              <input
                id="reset-new-password"
                type="password"
                placeholder="Enter your new password"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 mb-2 sm:mb-3 md:mb-4 border-2 border-slate-200 rounded-xl sm:rounded-2xl text-slate-800 font-medium text-sm sm:text-base
                         focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 focus:outline-none
                         transition-all duration-300 hover:border-slate-300"
              />
              <label htmlFor="reset-confirm-password" className="block text-left mb-1 sm:mb-2 text-slate-700 font-semibold text-xs sm:text-sm">
                Confirm Password
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                placeholder="Confirm your new password"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 mb-2 sm:mb-3 md:mb-4 border-2 border-slate-200 rounded-xl sm:rounded-2xl text-slate-800 font-medium text-sm sm:text-base
                         focus:border-indigo-500 focus:ring-2 sm:focus:ring-4 focus:ring-indigo-100 focus:outline-none
                         transition-all duration-300 hover:border-slate-300"
              />
              <button 
                type="submit"
                className="w-full py-2.5 sm:py-3 md:py-4 px-6 sm:px-8 mt-3 sm:mt-4 md:mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm sm:text-base
                         font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/30
                         hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5
                         active:translate-y-0 transition-all duration-300"
              >
                Update Password
              </button>
              <p 
                className="mt-2 sm:mt-3 md:mt-5 text-xs sm:text-sm text-indigo-600 font-medium cursor-pointer hover:text-purple-600 transition-colors"
                onClick={() => setIsPasswordResetMode(false)}
              >
                Back to Sign In
              </p>
            </form>
          )}
        </div>

        {/* Overlay Panel */}
        <div className={`
          absolute top-0 left-0 w-1/2 h-full transition-transform duration-600 ease-in-out z-20
          ${isSignInMode ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="h-full w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4 sm:p-8 md:p-12">
            <div className="text-center text-white">
              <div className="mb-3 sm:mb-6 md:mb-8">
                <img 
                  src="/Picture2.jpg" 
                  alt="Digital Diary Logo" 
                  className="w-16 h-10 sm:w-28 sm:h-16 md:w-32 md:h-20 object-contain mx-auto mb-2 sm:mb-4 md:mb-5 rounded-xl sm:rounded-2xl shadow-xl"
                />
                <span className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-wide drop-shadow-lg">
                  Digital Diary
                </span>
              </div>
              {!isPasswordResetMode ? (
                isSignInMode ? (
                  <>
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-4 md:mb-6 drop-shadow-md">Hello, Friend!</h2>
                    <p className="text-xs sm:text-base md:text-lg mb-3 sm:mb-6 md:mb-8 text-white/90 max-w-xs mx-auto leading-relaxed">
                      Enter your personal details and start your journey with us
                    </p>
                    <button 
                      className="px-5 sm:px-8 py-2 sm:py-2.5 md:py-3 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl sm:rounded-2xl
                               text-white text-xs sm:text-base font-semibold hover:bg-white/30 hover:border-white/50
                               transition-all duration-300 hover:-translate-y-1 shadow-lg"
                      onClick={switchAuthMode}
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-4 md:mb-6 drop-shadow-md">Welcome Back!</h2>
                    <p className="text-xs sm:text-base md:text-lg mb-3 sm:mb-6 md:mb-8 text-white/90 max-w-xs mx-auto leading-relaxed">
                      To keep connected with us please sign in with your personal info
                    </p>
                    <button 
                      className="px-5 sm:px-8 py-2 sm:py-2.5 md:py-3 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl sm:rounded-2xl
                               text-white text-xs sm:text-base font-semibold hover:bg-white/30 hover:border-white/50
                               transition-all duration-300 hover:-translate-y-1 shadow-lg"
                      onClick={switchAuthMode}
                    >
                      Sign In
                    </button>
                  </>
                )
              ) : (
                <>
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-4 md:mb-6 drop-shadow-md">Welcome Back!</h2>
                  <p className="text-xs sm:text-base md:text-lg mb-3 sm:mb-6 md:mb-8 text-white/90 max-w-xs mx-auto leading-relaxed">
                    To keep connected with us please sign in with your personal info
                  </p>
                  <button 
                    className="px-5 sm:px-8 py-2 sm:py-2.5 md:py-3 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl sm:rounded-2xl
                             text-white text-xs sm:text-base font-semibold hover:bg-white/30 hover:border-white/50
                             transition-all duration-300 hover:-translate-y-1 shadow-lg"
                    onClick={() => setIsPasswordResetMode(false)}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className={`
            fixed top-3 sm:top-5 right-2 sm:right-5 z-50 max-w-md min-w-[250px] sm:min-w-[300px] rounded-lg sm:rounded-xl shadow-2xl
            animate-slide-in-right
            ${toastType === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 border border-emerald-700' 
              : 'bg-gradient-to-r from-red-500 to-rose-600 border border-rose-700'
            }
          `}>
            <div className="flex items-center p-3 sm:p-4 text-white">
              <div className="text-lg sm:text-xl font-bold mr-2 sm:mr-3 flex-shrink-0">
                {toastType === 'success' ? '✓' : '⚠'}
              </div>
              <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                {statusMessage}
              </div>
              <button 
                className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full
                         hover:bg-white/20 transition-colors flex-shrink-0 text-sm sm:text-base"
                onClick={() => setShowToast(false)}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;


