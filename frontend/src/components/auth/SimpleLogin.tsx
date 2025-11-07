import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

const SimpleLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post<AuthResponse>('/api/auth?action=login', {
        username,
        password,
      });

      if (!response.data.success || !response.data.user) {
        setError(response.data.message ?? 'Invalid credentials.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', response.data.token ?? 'test-token');
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/login-success', {
        state: { user: response.data.user },
        replace: true,
      });
    } catch (err) {
      console.error('[SimpleLogin] Auth error', err);
      setError('Unable to connect to the server.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-center text-2xl font-semibold text-slate-800">Supabase Login Check</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Use your test credentials to make sure Vercel can reach Supabase.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring"
            />
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded bg-indigo-600 py-2 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? 'Checking…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Tip: when this succeeds you should land on a simple confirmation page.
        </p>
      </div>
    </div>
  );
};

export default SimpleLogin;


