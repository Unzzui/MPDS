import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileProvider, useUserProfile } from '../contexts/BodyWeightContext';
import UserSetupModal from './UserSetupModal';
import Navbar from './Navbar';
import '../styles/Layout.css';

// Premium SVG Icons
const DashboardIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
  </svg>
);

const WorkoutIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
  </svg>
);

const HistoryIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
  </svg>
);

const ProgressIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 3v18h18"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
    <path d="M9 9h.01M15 15h.01"/>
  </svg>
);

const BlocksIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const RoutinesIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 11H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <path d="M16 2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4"/>
    <path d="M9 21H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4"/>
    <path d="M16 21h4a2 2 0 0 1 2-2v-4a2 2 0 0 1-2-2h-4"/>
  </svg>
);

const ProfileIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

interface LayoutContentProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<LayoutContentProps> = ({ children }) => {
  const { user } = useAuth();
  const { hasCompletedSetup, checkSetupStatus, completeSetup } = useUserProfile();
  const [showSetup, setShowSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedSetup, setHasCheckedSetup] = useState(false);

  useEffect(() => {
    const checkSetup = async () => {
      if (user && !hasCheckedSetup) {
        try {
          await checkSetupStatus();
          setHasCheckedSetup(true);
        } catch (error) {
          console.error('Error checking setup status:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (!user) {
        setIsLoading(false);
      }
    };

    checkSetup();
  }, [user, checkSetupStatus, hasCheckedSetup]);

  useEffect(() => {
    // Only show setup modal if user is logged in, not loading, hasn't completed setup, and has checked setup
    if (!isLoading && user && !hasCompletedSetup && hasCheckedSetup) {
      setShowSetup(true);
    } else {
      setShowSetup(false);
    }
  }, [isLoading, user, hasCompletedSetup, hasCheckedSetup]);

  const handleSetupComplete = async (setupData: any) => {
    try {
      await completeSetup(setupData);
      setShowSetup(false);
    } catch (error) {
      console.error('Error completing setup:', error);
      // You might want to show an error message to the user here
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // If user is not logged in, show the app without setup
  if (!user) {
    return (
      <div className="layout">
        <Navbar />
        <main className="main-content">
          {children}
        </main>
      </div>
    );
  }

  // If user is logged in but hasn't completed setup, show setup modal
  if (!hasCompletedSetup && hasCheckedSetup) {
    return (
      <div className="layout">
        <UserSetupModal 
          isOpen={showSetup} 
          onComplete={handleSetupComplete}
        />
      </div>
    );
  }

  // User is logged in and has completed setup
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <UserProfileProvider>
      <LayoutContent>
        {children}
      </LayoutContent>
    </UserProfileProvider>
  );
};

export default Layout; 