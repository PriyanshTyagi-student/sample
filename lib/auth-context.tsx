'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    permissions: string[];
  };
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // In a real app, you would fetch user data here
  const value: AuthContextType = {
    isAuthenticated: true,
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      permissions: ['dashboard.view', 'students.manage', 'bookings.manage'],
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
