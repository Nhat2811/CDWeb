'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginRequest, register as registerRequest } from '@/services/auth.service';
import { User } from '@/types';

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) setUser(JSON.parse(raw) as User);
    setReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login: async (email, password) => {
        const auth = await loginRequest(email, password);
        localStorage.setItem('accessToken', auth.accessToken);
        localStorage.setItem('user', JSON.stringify(auth.user));
        setUser(auth.user);
      },
      register: async (name, email, password) => {
        const auth = await registerRequest(name, email, password);
        localStorage.setItem('accessToken', auth.accessToken);
        localStorage.setItem('user', JSON.stringify(auth.user));
        setUser(auth.user);
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
      },
    }),
    [ready, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
