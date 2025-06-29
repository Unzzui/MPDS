import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { User, UserCreate, UserLogin } from '../types';

interface AuthContextType {
  user: User | undefined;
  token: string | null;
  error: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLoadingUser: boolean;
  login: (credentials: UserLogin) => void;
  register: (userData: UserCreate) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get current user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      console.log('Fetching current user...');
      const userData = await apiService.getCurrentUser();
      console.log('User data received:', userData);
      return userData;
    },
    enabled: apiService.isAuthenticated(),
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: apiService.login,
    onSuccess: (data) => {
      console.log('Login successful, data:', data);
      apiService.setAuthToken(data.access_token);
      console.log('Token set in localStorage');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      console.log('User query invalidated, navigating to dashboard');
      navigate('/dashboard');
      console.log('Navigation called');
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: apiService.register,
    onSuccess: (user) => {
      navigate('/login');
    },
    onError: (error) => {
      console.error('Register error:', error);
    },
  });

  // Logout function
  const logout = () => {
    apiService.removeAuthToken();
    queryClient.clear();
    navigate('/login');
  };

  const authValue: AuthContextType = {
    user,
    token: apiService.getAuthToken(),
    error: null,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    isAuthenticated: apiService.isAuthenticated(),
    isLoadingUser,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}; 