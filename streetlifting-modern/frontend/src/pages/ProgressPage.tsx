import React from 'react';
import OneRMProgressChart from '../components/OneRMProgressChart';
import { useOneRepMaxes } from '../hooks/useOneRepMaxes';
import '../styles/Progress.css';

const ProgressPage: React.FC = () => {
  const { latestOneRepMaxes, isLoadingOneRepMaxes } = useOneRepMaxes();

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1 className="progress-title">PROGRESS TRACKER</h1>
        <p className="progress-subtitle">
          Analiza tu progreso y mejora tu rendimiento con datos precisos
        </p>
      </div>

      {/* Current OneRepMax Summary */}
      {!isLoadingOneRepMaxes && latestOneRepMaxes.length > 0 && (
        <div className="progress-section">
          <div className="section-header">
            <h2 className="section-title">RÉCORDS ACTUALES (1RM)</h2>
            <div className="section-badge">
              {latestOneRepMaxes.length} ejercicios
            </div>
          </div>
          <div className="section-content">
            Tus mejores marcas personales en cada ejercicio
          </div>
          <div className="rm-cards">
            {latestOneRepMaxes.map((rm) => (
              <div key={rm.exercise} className="rm-card">
                <h3>{rm.exercise}</h3>
                <div className="rm-values">
                  <div className="rm-value">
                    <span className="hypothetical-value">{rm.one_rm}kg</span>
                  </div>
                  <div className="rm-date">
                    {new Date(rm.date_achieved).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Progress Chart */}
      <div className="progress-section">
        <div className="section-header">
          <h2 className="section-title">PROGRESIÓN DE 1RM</h2>
          <div className="section-badge">INTERACTIVO</div>
        </div>
        <div className="section-content">
          Visualiza tu progreso a lo largo del tiempo
        </div>
        <div className="chart-container">
          <OneRMProgressChart height={500} />
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="progress-section">
        <div className="section-header">
          <h2 className="section-title">ESTADÍSTICAS AVANZADAS</h2>
          <div className="section-badge">SISTEMA</div>
        </div>
        <div className="section-content">
          Métricas detalladas de tu rendimiento
        </div>
        
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">0</div>
            <div className="stat-label">ENTRENAMIENTOS</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">0</div>
            <div className="stat-label">ESTA SEMANA</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">0%</div>
            <div className="stat-label">TASA</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">0</div>
            <div className="stat-label">RACHA</div>
          </div>
        </div>

        {/* Future Charts Placeholder */}
        <div className="future-charts">
          <div className="chart-placeholder">
            <div className="placeholder-icon">[CHART]</div>
            <h3>VOLUMEN SEMANAL</h3>
            <p>Gráfico de volumen en desarrollo</p>
          </div>
          <div className="chart-placeholder">
            <div className="placeholder-icon">[PIE]</div>
            <h3>DISTRIBUCIÓN</h3>
            <p>Distribución de ejercicios en desarrollo</p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="progress-footer">
        <div className="footer-text">
          <span className="accent">$</span> Sistema de tracking de progreso v1.0.0
        </div>
        <div className="footer-subtext">
          Datos sincronizados en tiempo real
        </div>
      </div>
    </div>
  );
};

export default ProgressPage; 