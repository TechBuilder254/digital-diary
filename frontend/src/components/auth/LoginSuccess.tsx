import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

const LoginSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};

  const user = useMemo(() => {
    if (state.user) {
      return state.user;
    }

    try {
      const stored = localStorage.getItem('user');
      return stored ? (JSON.parse(stored) as LocationState['user']) : undefined;
    } catch (error) {
      console.warn('[LoginSuccess] Failed to read stored user', error);
      return undefined;
    }
  }, [state.user]);

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    }
  }, [navigate, user]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✅</div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-800">Supabase connection looks good</h1>
          <p className="mt-2 text-sm text-slate-500">We were able to sign in using the credentials you supplied.</p>
        </div>

        <div className="mt-6 space-y-3 rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div>
            <span className="font-semibold">User ID:</span> {user.id}
          </div>
          <div>
            <span className="font-semibold">Username:</span> {user.username}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {user.email}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="rounded bg-emerald-600 py-2 text-white transition hover:bg-emerald-500"
            onClick={() => navigate('/', { replace: true })}
          >
            Test again
          </button>
          <button
            type="button"
            className="rounded border border-slate-300 py-2 text-slate-700 transition hover:bg-slate-100"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/', { replace: true });
            }}
          >
            Clear session
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccess;


