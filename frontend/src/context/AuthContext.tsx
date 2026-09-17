import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isOwner: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await api.get<{ user: User }>('/auth/me');
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('tadbeer_demo_user', JSON.stringify(data.user));
        return;
      }
    } catch {
      const stored = localStorage.getItem('tadbeer_demo_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
          return;
        } catch {
          // ignore parse error
        }
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const data = await api.post<{ user: User }>('/auth/login', { email, password: pass });
      setUser(data.user);
      localStorage.setItem('tadbeer_demo_user', JSON.stringify(data.user));
    } catch (err: any) {
      // If backend is not available (e.g. 405 Method Not Allowed on static Vercel host), fallback to demo login
      if (err?.status === 405 || err?.status === 404 || err?.message?.includes('HTTP error') || err?.name === 'TypeError') {
        const mockUser: User = {
          id: 1,
          role_id: email.includes('ps') ? 2 : 1,
          name: email.includes('ps') ? 'পার্সোনাল সেক্রেটারি' : 'শায়খ মোখতার আহমাদ',
          email: email,
          role_name: email.includes('ps') ? 'ps_admin' : 'owner',
          role_display_name: email.includes('ps') ? 'PS / Admin' : 'Scholar / Owner',
          avatar: '/shaikh-portrait.jpg'
        };
        setUser(mockUser);
        localStorage.setItem('tadbeer_demo_user', JSON.stringify(mockUser));
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      setUser(null);
      localStorage.removeItem('tadbeer_demo_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isOwner: user?.role_name === 'owner',
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
