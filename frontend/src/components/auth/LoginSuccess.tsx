import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FiArrowRight, FiCheckCircle, FiLogOut, FiShield } from 'react-icons/fi';
import ThemeToggle from '../common/ThemeToggle';

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
  const prefersReducedMotion = useReducedMotion();
  const state = (location.state as LocationState) ?? {};

  const user = useMemo(() => {
    if (state.user) {
      return state.user;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    const storages = [window.localStorage, window.sessionStorage];
    for (const storage of storages) {
      try {
        const storedValue = storage.getItem('user');
        if (storedValue) {
          return JSON.parse(storedValue) as LocationState['user'];
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('[LoginSuccess] Failed to parse stored user', error);
      }
    }
    return undefined;
  }, [state.user]);

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    }
  }, [navigate, user]);

  if (!user) {
    return null;
  }

  const handleClearSession = () => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    window.sessionStorage.removeItem('token');
    window.sessionStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,_rgba(129,_140,_248,_0.28),_transparent_65%)]" aria-hidden />

      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-foreground/70">Digital Diary</p>
          <h1 className="mt-1 text-xl font-heading text-foreground">
            Connection established <span className="text-accent">securely</span>
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 pb-16 md:px-12">
        <motion.section
          className="relative w-full overflow-hidden rounded-3xl border border-accent/10 bg-surface px-8 py-10 shadow-glass backdrop-blur-3xl"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.6, 0.2, 0.1, 1] }}
        >
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-accent-soft/20 blur-3xl" aria-hidden />

          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4 md:max-w-sm">
              <div className="inline-flex items-center gap-3 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent shadow-inner">
                <FiCheckCircle className="h-5 w-5" aria-hidden />
                Authentication successful
              </div>
              <h2 className="font-heading text-[clamp(2rem,1.6rem+1vw,2.6rem)] leading-tight text-foreground">
                Welcome back, {user.username}.
              </h2>
              <p className="text-base leading-relaxed text-foreground/70">
                Your Supabase connection is live. Tokens are secured and synced, and your workspace is ready for the next entry or mood
                check-in.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate('/', { replace: true })}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-foreground-invert transition hover:bg-accent-soft focus-outline"
                >
                  Return to login
                  <FiArrowRight className="transition group-hover:translate-x-1" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={handleClearSession}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/20 px-6 py-2.5 text-sm font-semibold text-foreground/70 transition hover:border-accent/40 hover:text-foreground focus-outline"
                >
                  <FiLogOut aria-hidden />
                  Clear session
                </button>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-accent/10 bg-surface-muted/70 p-6 text-sm text-foreground shadow-card md:w-80">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <FiShield className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-foreground/60">Profile fingerprint</p>
                  <p className="font-semibold text-foreground">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-accent/10 bg-surface px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.3em] text-foreground/60">User id</span>
                  <span className="font-mono text-sm text-foreground/80">{user.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.3em] text-foreground/60">Session</span>
                  <span className="font-mono text-sm text-foreground/80">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.3em] text-foreground/60">Encryption</span>
                  <span className="font-mono text-sm text-foreground/80">AES-256</span>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-foreground/60">
                Remember to rotate credentials regularly. Monitor Supabase logs for anomaly detection and keep your recovery options
                up to date.
              </p>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default LoginSuccess;
