import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, telegramChatId?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    await apiClient.login(username, password);
    setIsAuthenticated(true);
  };

  const signup = async (username: string, email: string, password: string, telegramChatId: string = '') => {
    await apiClient.signup(username, email, password, telegramChatId);
  };

  const logout = () => {
    apiClient.clearToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
