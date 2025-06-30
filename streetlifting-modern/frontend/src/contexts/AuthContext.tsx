import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  
  // Add state to track authentication status reactively
  const [isAuthenticated, setIsAuthenticated] = useState(() => apiService.isAuthenticated());
  const [hasNavigatedAfterLogin, setHasNavigatedAfterLogin] = useState(false);

  // Get current user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      console.log('Fetching current user...');
      const userData = await apiService.getCurrentUser();
      console.log('User data received:', userData);
      return userData;
    },
    enabled: isAuthenticated,
    retry: false,
  });

  // Navigate to dashboard after successful login and user data load
  useEffect(() => {
    if (isAuthenticated && user && !isLoadingUser && !hasNavigatedAfterLogin) {
      console.log('User authenticated and loaded, navigating to dashboard...');
      setHasNavigatedAfterLogin(true);
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, isLoadingUser, hasNavigatedAfterLogin, navigate]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: apiService.login,
    onSuccess: (data) => {
      console.log('Login successful, data:', data);
      apiService.setAuthToken(data.access_token);
      console.log('Token set in localStorage');
      setIsAuthenticated(true); // Update authentication state
      queryClient.invalidateQueries({ queryKey: ['user'] });
      console.log('User query invalidated, waiting for user data to check setup...');
      // Don't navigate here - let the useEffect handle navigation based on setup needs
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
    setIsAuthenticated(false); // Update authentication state
    setHasNavigatedAfterLogin(false); // Reset navigation state
    queryClient.clear();
    navigate('/login');
  };

  const authValue: AuthContextType = {
    user,
    token: apiService.getAuthToken(),
    error: null,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    isAuthenticated,
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