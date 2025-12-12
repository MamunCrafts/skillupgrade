'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = storage.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (username: string) => {
    const users = storage.getUsers();
    let currentUser = users.find((u) => u.username === username);

    if (!currentUser) {
      // First user is admin, others are users
      const role = users.length === 0 ? 'admin' : 'user';
      currentUser = {
        id: crypto.randomUUID(),
        username,
        role,
        createdAt: Date.now(),
      };
      storage.saveUser(currentUser);
    }

    storage.setCurrentUser(currentUser);
    setUser(currentUser);
    router.push('/');
  };

  const logout = () => {
    storage.setCurrentUser(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
