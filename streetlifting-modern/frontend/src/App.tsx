import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WorkoutPage from './pages/WorkoutPage';
import WorkoutLoggerPage from './pages/WorkoutLoggerPage';
import WorkoutHistoryPage from './pages/WorkoutHistoryPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import ProfilePage from './pages/ProfilePage';
import ProgressPage from './pages/ProgressPage';
import RoutinesPage from './pages/RoutinesPage';
import RoutineDetailPage from './pages/RoutineDetailPage';
import BlocksPage from './pages/BlocksPage';
import SetupPage from './pages/SetupPage';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/workout" element={
              <ProtectedRoute>
                <Layout>
                  <WorkoutPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/workout-logger/:dayType" element={
              <ProtectedRoute>
                <Layout>
                  <WorkoutLoggerPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <Layout>
                  <WorkoutHistoryPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/workout-history" element={
              <ProtectedRoute>
                <Layout>
                  <WorkoutHistoryPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/workout/:id" element={
              <ProtectedRoute>
                <Layout>
                  <WorkoutDetailPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute>
                <Layout>
                  <ProgressPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/routines" element={
              <ProtectedRoute>
                <Layout>
                  <RoutinesPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/routines/:id" element={
              <ProtectedRoute>
                <Layout>
                  <RoutineDetailPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/workout-logger/:routineId" element={
              <ProtectedRoute>
                <Layout>
                  <WorkoutLoggerPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/blocks" element={
              <ProtectedRoute>
                <Layout>
                  <BlocksPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/setup" element={
              <ProtectedRoute>
                <Layout>
                  <SetupPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
