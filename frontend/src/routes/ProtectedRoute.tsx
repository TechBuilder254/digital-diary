import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface StoredUser {
  id: string | number;
  username: string;
  email: string;
}

const getStoredSession = (): { token: string; user: StoredUser } | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storages: Array<Storage | null> = [
    window.localStorage ?? null,
    window.sessionStorage ?? null,
  ];

  for (const storage of storages) {
    if (!storage) continue;

    const token = storage.getItem('token');
    const rawUser = storage.getItem('user');

    if (!token || !rawUser) {
      continue;
    }

    try {
      const user = JSON.parse(rawUser) as StoredUser;
      if (!user || !user.id) {
        continue;
      }
      return { token, user };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[ProtectedRoute] Failed to parse stored user', error);
    }
  }

  return null;
};

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const session = getStoredSession();

  if (!session) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

