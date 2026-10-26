/**
 * Studio Authentication Context
 * Manages private operator access for Siracusa Labs owner.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (email: string, pin?: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkCurrentSession() {
      try {
        const token = localStorage.getItem('siracusa_studio_token');
        if (token) {
          const res = await api.getMe();
          if (res.isAuthenticated) {
            setUser({
              email: res.email || 'mattialacanna@gmail.com',
              name: res.name || 'Mattia Lacanna (Owner)',
              role: (res.role as any) || 'owner',
              isAuthenticated: true,
              token,
            });
          } else {
            localStorage.removeItem('siracusa_studio_token');
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    checkCurrentSession();
  }, []);

  const login = async (email: string, pin?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(email, pin);
      if (res.success && res.user) {
        localStorage.setItem('siracusa_studio_token', res.user.token);
        setUser(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Accesso non riuscito');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('siracusa_studio_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
