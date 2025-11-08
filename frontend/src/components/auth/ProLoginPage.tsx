import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import ProLoginForm, { LoginSuccessPayload } from './ProLoginForm';
import ProRegisterForm, { RegisterSuccessPayload } from './ProRegisterForm';
import AuthHero from './AuthHero';
import ThemeToggle from '../common/ThemeToggle';
import cn from '../../utils/cn';
import { FiCheckCircle } from 'react-icons/fi';

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const ProLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);

  const handleSuccess = useCallback(
    (payload: LoginSuccessPayload) => {
      try {
        const storage = payload.rememberMe ? window.localStorage : window.sessionStorage;
        storage.setItem('token', payload.token);
        storage.setItem('user', JSON.stringify(payload.user));

        if (!payload.rememberMe) {
          window.localStorage.removeItem('token');
          window.localStorage.removeItem('user');
        }

        navigate('/login-success', { replace: true, state: { user: payload.user } });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[ProLoginPage] Failed to persist session', error);
        navigate('/login-success', { replace: true, state: { user: payload.user } });
      }
    },
    [navigate],
  );

  const handleRegisterSuccess = useCallback((payload: RegisterSuccessPayload) => {
    setRegistrationMessage(payload.message);
    setMode('login');
  }, []);

  const handleSwitchMode = useCallback((nextMode: 'login' | 'register') => {
    setRegistrationMessage(null);
    setMode(nextMode);
  }, []);

  const tabs = useMemo(
    () => [
      { id: 'login', label: 'Sign in', description: 'Access your secured journal' },
      { id: 'register', label: 'Create account', description: 'Start your neuro-adaptive journey' },
    ] as const,
    [],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface text-foreground">
      <a
        href="#login-form"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent"
      >
        Skip to main content
      </a>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,_102,_241,_0.35),_transparent_55%)]" aria-hidden />

      <motion.header
        className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/20 bg-surface/90 text-lg font-semibold text-accent shadow-card backdrop-blur">
            DD
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-foreground/80">Digital Diary</p>
            <p className="text-xs text-foreground/60">Neuro-adaptive journaling</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a
            href="https://support.digital-diary.app"
            className="rounded-full border border-accent/20 px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:border-accent/40 hover:text-accent focus-outline"
          >
            Need help?
          </a>
        </div>
      </motion.header>

      <motion.main
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-6 md:flex-row md:items-stretch md:gap-12 md:px-12"
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.7, ease: [0.6, 0.2, 0.1, 1] }}
      >
        <AuthHero className="hidden md:flex" />

        <div className={cn('flex w-full flex-col items-center md:items-end')}>
          <div className="mb-6 flex w-full max-w-[420px] items-center justify-center rounded-full border border-accent/10 bg-surface/90 p-1 shadow-inner backdrop-blur">
            {tabs.map((tab) => {
              const isActive = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSwitchMode(tab.id)}
                  className={cn(
                    'relative flex w-1/2 flex-col items-center rounded-full px-4 py-2 text-sm font-semibold transition focus-outline',
                    isActive ? 'bg-accent text-foreground-invert shadow-card' : 'text-foreground/70 hover:text-foreground',
                  )}
                  aria-pressed={isActive}
                >
                  <span>{tab.label}</span>
                  <span className="text-xs font-normal text-foreground/60">{tab.description}</span>
                </button>
              );
            })}
          </div>

          {registrationMessage && mode === 'login' && (
            <motion.div
              role="status"
              className="mb-4 flex w-full max-w-[420px] items-start gap-3 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success shadow-inner"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <FiCheckCircle aria-hidden className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">You&apos;re all set</p>
                <p>{registrationMessage}</p>
              </div>
            </motion.div>
          )}

          {mode === 'login' ? (
          <ProLoginForm onSuccess={handleSuccess} className="w-full md:max-w-[420px]" />
          ) : (
            <ProRegisterForm
              onSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => handleSwitchMode('login')}
              className="w-full md:max-w-[420px]"
            />
          )}
          <p className="mt-6 text-sm text-foreground/60">
            By signing in you agree to our{' '}
            <a href="https://digital-diary.app/privacy" className="font-semibold text-accent focus-outline">
              privacy guidelines
            </a>{' '}
            and{' '}
            <a href="https://digital-diary.app/terms" className="font-semibold text-accent focus-outline">
              security standards
            </a>
            .
          </p>
        </div>
      </motion.main>
    </div>
  );
};

export default ProLoginPage;

