import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, UserRole } from '../types';
import { api } from '../services/api';
import { getSocket } from '../services/socket';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: UserRole }) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updatedData: Partial<IUser>) => Promise<void>;
  switchDemoUser: (role: 'mentor' | 'learner' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('skillswap_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize socket when user changes
  useEffect(() => {
    if (user) {
      getSocket(user._id);
    }
  }, [user]);

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('skillswap_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; role?: UserRole }) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      if (res.data.success) {
        localStorage.setItem('skillswap_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('skillswap_token');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (updatedData: Partial<IUser>) => {
    const res = await api.put('/users/profile', updatedData);
    if (res.data.success) {
      setUser(res.data.user);
    }
  };

  const switchDemoUser = async (role: 'mentor' | 'learner' | 'admin') => {
    if (role === 'mentor') {
      await login('elena@skillswap.com', 'password123');
    } else if (role === 'learner') {
      await login('marcus@skillswap.com', 'password123');
    } else if (role === 'admin') {
      await login('admin@skillswap.com', 'password123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        switchDemoUser,
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
