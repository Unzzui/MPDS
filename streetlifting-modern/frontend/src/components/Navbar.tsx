import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

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

const Navbar: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/workout', label: 'Entrenar', icon: WorkoutIcon },
    { path: '/workout-history', label: 'Historial', icon: HistoryIcon },
    { path: '/progress', label: 'Progreso', icon: ProgressIcon },
    { path: '/blocks', label: 'Bloques', icon: BlocksIcon },
    { path: '/routines', label: 'Rutinas', icon: RoutinesIcon },
    { path: '/profile', label: 'Perfil', icon: ProfileIcon }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Top Navbar - Logo only */}
      <nav className="navbar-top">
        <div className="nav-brand">
          <Link to="/dashboard" className="brand-link">
            <span className="brand-text">MPDS</span>
          </Link>
        </div>
        
        {/* Logout Button */}
        <div className="nav-actions">
          <button onClick={handleLogout} className="logout-btn" title="Cerrar Sesión">
            <LogoutIcon />
          </button>
        </div>
      </nav>

      {/* Bottom Navigation - Icons only */}
      <nav className="navbar-bottom">
        <div className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path === '/workout' && location.pathname.startsWith('/workout-logger')) ||
                           (item.path === '/workout-history' && location.pathname.startsWith('/workout-history')) ||
                           (item.path === '/blocks' && location.pathname.startsWith('/blocks')) ||
                           (item.path === '/routines' && location.pathname.startsWith('/routines')) ||
                           (item.path === '/progress' && location.pathname.startsWith('/progress'));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <Icon />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar; 