import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Admin } from '../types';
import apiService from '../utils/apiService';

interface AuthContextType {
  user: Admin | null; // Changed from Supabase User to our Admin type
  admin: Admin | null;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // You might want an API endpoint to verify the token and get user data
          // For now, let's decode it client-side (less secure, but okay for this app)
          const payload = JSON.parse(atob(token.split('.')[1]));
          setAdmin({ id: payload.id, username: payload.email });
        } catch (e) {
          console.error("Invalid token", e);
          localStorage.removeItem('authToken');
          setAdmin(null);
        }
      }
      setIsLoading(false);
    };
    checkUser();
  }, []);

  const signIn = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const { token, user } = await apiService.login(email, password || '');
      localStorage.setItem('authToken', token);
      setAdmin(user);
      setIsLoading(false);
      return { error: null };
    } catch (error: any) {
      setIsLoading(false);
      return { error: error.message || 'An unknown error occurred' };
    }
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('authToken');
    setAdmin(null);
    // No server call needed for basic JWT logout
  }, []);

  return (
    <AuthContext.Provider value={{ user: admin, admin, isLoading, signIn, signOut }}>
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
