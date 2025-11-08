import { useCallback } from 'react';

type AuthEvent = 'login_success' | 'login_error' | 'register_success' | 'register_error';

interface AnalyticsPayload {
  userId?: string;
  email?: string;
  context?: string;
  errorMessage?: string;
}

export const useAuthAnalytics = () => {
  const track = useCallback((event: AuthEvent, payload?: AnalyticsPayload) => {
    // Placeholder for production analytics integration (Segment, PostHog, etc.)
    // eslint-disable-next-line no-console
    console.info('[AuthAnalytics]', event, payload);
  }, []);

  return {
    trackLoginSuccess: (payload: AnalyticsPayload) => track('login_success', payload),
    trackLoginError: (payload: AnalyticsPayload) => track('login_error', payload),
    trackRegisterSuccess: (payload: AnalyticsPayload) => track('register_success', payload),
    trackRegisterError: (payload: AnalyticsPayload) => track('register_error', payload),
  };
};

export default useAuthAnalytics;


