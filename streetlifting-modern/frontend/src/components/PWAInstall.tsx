import React from 'react';
import { usePWA } from '../hooks/usePWA';
import '../styles/PWAInstall.css';

export const PWAInstall: React.FC = () => {
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();

  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <div className="pwa-install-banner">
      <div className="pwa-install-content">
        <div className="pwa-install-info">
          <h3>Instalar MPDS</h3>
          <p>Instala la app para acceder más rápido y usar sin conexión</p>
        </div>
        <div className="pwa-install-actions">
          <button 
            onClick={installApp}
            className="btn btn-primary"
            disabled={!isOnline}
          >
            Instalar
          </button>
          <button className="btn btn-secondary">
            Más tarde
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstall; 