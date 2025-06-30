import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { TrainingBlock } from '../types';
import '../styles/BlockDetail.css';

// Tipos para los datos de proyecciones y RPE
interface Projections {
  [week: string]: {
    [exercise: string]: number;
  };
}
interface RpeTables {
  [exercise: string]: {
    [rpe: string]: number[];
  };
}

const BlockDetailPage: React.FC = () => {
  const { blockId } = useParams<{ blockId: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'projections' | 'rpe'>('overview');

  // Fetch block details
  const {
    data: block,
    isLoading: isLoadingBlock,
    error: blockError,
  } = useQuery({
    queryKey: ['blocks', blockId],
    queryFn: () => apiService.getTrainingBlock(Number(blockId)),
    enabled: !!blockId,
  });

  // Fetch block progress
  const {
    data: progress,
    isLoading: isLoadingProgress,
    error: progressError,
  } = useQuery({
    queryKey: ['blocks', blockId, 'progress'],
    queryFn: () => apiService.getBlockProgress(blockId!),
    enabled: !!blockId,
  });

  // Fetch weekly projections
  const {
    data: projectionsRaw,
    isLoading: isLoadingProjections,
    error: projectionsError,
  } = useQuery({
    queryKey: ['blocks', blockId, 'projections'],
    queryFn: () => apiService.getWeeklyProjections(blockId!),
    enabled: !!blockId,
  });
  const projections: Projections = projectionsRaw || {};

  // Fetch RPE tables
  const {
    data: rpeTablesRaw,
    isLoading: isLoadingRpeTables,
    error: rpeTablesError,
  } = useQuery({
    queryKey: ['blocks', blockId, 'rpe-tables'],
    queryFn: () => apiService.getRpeTables(blockId!),
    enabled: !!blockId,
  });
  const rpeTables: RpeTables = rpeTablesRaw || {};

  if (isLoadingBlock) {
    return (
      <div className="block-detail-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Cargando detalles del bloque...</p>
        </div>
      </div>
    );
  }

  if (blockError || !block) {
    return (
      <div className="block-detail-container">
        <div className="error-section">
          <h2>Error</h2>
          <p>No se pudo cargar el bloque de entrenamiento.</p>
          <Link to="/blocks" className="btn-primary">
            Volver a Bloques
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'planned':
        return 'status-planned';
      default:
        return 'status-default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completado';
      case 'planned':
        return 'Planificado';
      default:
        return 'Desconocido';
    }
  };

  const renderOverview = () => (
    <div className="overview-section">
      <div className="block-header">
        <h2>{block.name}</h2>
        <div className="block-meta">
          <span className={`status-badge ${getStatusColor(block.status)}`}>
            {getStatusText(block.status)}
          </span>
          {block.is_active && <span className="active-badge">Activo</span>}
        </div>
      </div>
      <div className="block-info-grid">
        <div className="info-card">
          <h3>Progreso</h3>
          <div className="progress-info">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(block.current_week / block.total_weeks) * 100}%` }}
              ></div>
            </div>
            <p>Semana {block.current_week} de {block.total_weeks}</p>
          </div>
        </div>
        <div className="info-card">
          <h3>Estrategia</h3>
          <p className="strategy-name">{block.strategy}</p>
          <p className="strategy-details">
            Incremento semanal: {block.weekly_increment}%
          </p>
        </div>
        <div className="info-card">
          <h3>Fechas</h3>
          <p>Inicio: {new Date(block.start_date).toLocaleDateString()}</p>
          <p>Fin: {new Date(block.end_date).toLocaleDateString()}</p>
        </div>
        <div className="info-card">
          <h3>Pesos Máximos (1RM)</h3>
          <div className="max-reps-grid">
            <div className="max-rep-item">
              <span className="exercise-name">Muscle-ups:</span>
              <span className="weight">{block.rm_muscleups} kg</span>
            </div>
            <div className="max-rep-item">
              <span className="exercise-name">Pull-ups:</span>
              <span className="weight">{block.rm_pullups} kg</span>
            </div>
            <div className="max-rep-item">
              <span className="exercise-name">Dips:</span>
              <span className="weight">{block.rm_dips} kg</span>
            </div>
            <div className="max-rep-item">
              <span className="exercise-name">Squats:</span>
              <span className="weight">{block.rm_squats} kg</span>
            </div>
          </div>
        </div>
      </div>
      {block.stages && block.stages.length > 0 && (
        <div className="stages-section">
          <h3>Etapas del Bloque</h3>
          <div className="stages-grid">
            {block.stages.map((stage) => (
              <div key={stage.id} className="stage-card">
                <h4>{stage.name}</h4>
                <p>Semana {stage.week_number}</p>
                <p>Carga: {stage.load_percentage}%</p>
                {stage.description && <p>{stage.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProgress = () => {
    // Calcular métricas adicionales
    const progressPercentage = progress ? progress.progress_percentage : 0;
    const weeksCompleted = block.current_week - 1;
    const weeksRemaining = block.total_weeks - block.current_week;
    const daysInBlock = Math.ceil((new Date(block.end_date).getTime() - new Date(block.start_date).getTime()) / (1000 * 60 * 60 * 24));
    const daysCompleted = Math.ceil((new Date().getTime() - new Date(block.start_date).getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = daysInBlock - daysCompleted;

    return (
      <div className="progress-section">
        <h3>Progreso del Bloque</h3>
        {isLoadingProgress ? (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Cargando progreso...</p>
          </div>
        ) : progressError ? (
          <div className="error-section">
            <p>Error al cargar el progreso</p>
          </div>
        ) : progress ? (
          <div className="progress-data">
            {/* Progress Overview Cards */}
            <div className="progress-overview-grid">
              <div className="progress-metric-card terminal-card">
                <h4>Progreso General</h4>
                <div className="metric-value">
                  <span className="percentage">{progressPercentage}%</span>
                </div>
                <div className="progress-bar-large">
                  <div 
                    className="progress-fill-large" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="metric-details">
                  <span>Semana {block.current_week} de {block.total_weeks}</span>
                </div>
              </div>

              <div className="progress-metric-card terminal-card">
                <h4>Tiempo Transcurrido</h4>
                <div className="metric-value">
                  <span className="days">{daysCompleted}</span>
                  <span className="unit">días</span>
                </div>
                <div className="time-bar">
                  <div 
                    className="time-fill" 
                    style={{ width: `${(daysCompleted / daysInBlock) * 100}%` }}
                  ></div>
                </div>
                <div className="metric-details">
                  <span>{daysRemaining} días restantes</span>
                </div>
              </div>

              <div className="progress-metric-card terminal-card">
                <h4>Rendimiento</h4>
                <div className="performance-indicator">
                  <div className="performance-circle">
                    <svg viewBox="0 0 36 36" className="performance-chart">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#1a1a1a"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#00ff88"
                        strokeWidth="2"
                        strokeDasharray={`${progressPercentage}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="performance-text">
                      <span className="performance-value">{progressPercentage}%</span>
                    </div>
                  </div>
                </div>
                <div className="metric-details">
                  <span>Eficiencia del bloque</span>
                </div>
              </div>

              <div className="progress-metric-card terminal-card">
                <h4>Próximo Entrenamiento</h4>
                <div className="next-workout-info">
                  {progress.next_workout ? (
                    <>
                      <div className="workout-date">{progress.next_workout}</div>
                      <div className="workout-status">Programado</div>
                    </>
                  ) : (
                    <>
                      <div className="workout-date">No programado</div>
                      <div className="workout-status">Pendiente</div>
                    </>
                  )}
                </div>
                <div className="metric-details">
                  <span>Próxima sesión</span>
                </div>
              </div>
            </div>

            {/* Weekly Timeline */}
            <div className="weekly-breakdown-section">
              <h4>Desglose Semanal</h4>
              <div className="weekly-timeline">
                {Array.from({ length: block.total_weeks }, (_, index) => {
                  const weekNumber = index + 1;
                  const isCompleted = weekNumber < block.current_week;
                  const isCurrent = weekNumber === block.current_week;
                  const isUpcoming = weekNumber > block.current_week;
                  
                  return (
                    <div 
                      key={weekNumber}
                      className={`week-timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isUpcoming ? 'upcoming' : ''}`}
                    >
                      <div className="week-marker">
                        <div className="week-number">{weekNumber}</div>
                        {isCompleted && <div className="completion-check">✓</div>}
                        {isCurrent && <div className="current-indicator">●</div>}
                      </div>
                      <div className="week-info">
                        <div className="week-status">
                          {isCompleted && 'Completada'}
                          {isCurrent && 'En Progreso'}
                          {isUpcoming && 'Pendiente'}
                        </div>
                        {isCurrent && (
                          <div className="current-week-progress">
                            <div className="mini-progress-bar">
                              <div className="mini-progress-fill" style={{ width: '60%' }}></div>
                            </div>
                            <span>60% de la semana</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Training Progress */}
            {progress.weekly_projections && (
              <div className="detailed-training-section">
                <h4>Progreso Detallado de Entrenamiento</h4>
                <div className="training-progress-grid">
                  {Object.entries(progress.weekly_projections as Projections).slice(0, 4).map(([week, exercises]) => {
                    const weekNum = parseInt(week);
                    const isCurrentWeek = weekNum === block.current_week;
                    
                    return (
                      <div key={week} className={`training-week-card terminal-card ${isCurrentWeek ? 'current-week' : ''}`}>
                        <div className="week-header">
                          <h5>Semana {week}</h5>
                          {isCurrentWeek && <div className="current-week-badge">Actual</div>}
                        </div>
                        
                        <div className="training-sessions">
                          {Object.entries(exercises).map(([exercise, weight]) => {
                            // Simular datos de series y repeticiones basados en la estrategia
                            const sets = block.strategy === '5/3/1' ? 3 : 4;
                            const reps = block.strategy === '5/3/1' ? [5, 3, 1] : [8, 6, 4, 2];
                            const rpe = block.strategy === '5/3/1' ? [8, 8.5, 9] : [7, 7.5, 8, 8.5];
                            
                            return (
                              <div key={exercise} className="training-exercise">
                                <div className="exercise-header">
                                  <span className="exercise-name">{exercise}</span>
                                  <span className="exercise-weight">{weight} kg</span>
                                </div>
                                
                                <div className="sets-reps-grid">
                                  {Array.from({ length: sets }, (_, setIndex) => (
                                    <div key={setIndex} className="set-rep-card">
                                      <div className="set-number">Set {setIndex + 1}</div>
                                      <div className="rep-weight">
                                        <span className="weight-value">{Math.round(weight * (0.85 + setIndex * 0.05))} kg</span>
                                        <span className="rep-count">{reps[setIndex] || reps[reps.length - 1]} reps</span>
                                      </div>
                                      <div className="rpe-indicator">
                                        <span className="rpe-value">RPE {rpe[setIndex] || rpe[rpe.length - 1]}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="exercise-progress-bar">
                                  <div 
                                    className="exercise-progress-fill" 
                                    style={{ 
                                      width: `${Math.min((weight / 100) * 100, 100)}%`,
                                      background: isCurrentWeek ? 'linear-gradient(90deg, #00ff88, #00cc6a)' : 'var(--accent-primary, #00ff88)'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            <div className="performance-metrics-section">
              <h4>Métricas de Rendimiento</h4>
              <div className="metrics-grid">
                <div className="metric-card terminal-card">
                  <div className="metric-icon">📈</div>
                  <h5>Progresión de Peso</h5>
                  <div className="metric-value-large">+12%</div>
                  <div className="metric-description">
                    Incremento semanal promedio en pesos de trabajo
                  </div>
                </div>

                <div className="metric-card terminal-card">
                  <div className="metric-icon">⚡</div>
                  <h5>Volumen Total</h5>
                  <div className="metric-value-large">2,450 kg</div>
                  <div className="metric-description">
                    Peso total movido en la semana actual
                  </div>
                </div>

                <div className="metric-card terminal-card">
                  <div className="metric-icon">🎯</div>
                  <h5>Precisión RPE</h5>
                  <div className="metric-value-large">94%</div>
                  <div className="metric-description">
                    Consistencia en el control de intensidad
                  </div>
                </div>

                <div className="metric-card terminal-card">
                  <div className="metric-icon">🔄</div>
                  <h5>Recuperación</h5>
                  <div className="metric-value-large">A+</div>
                  <div className="metric-description">
                    Calidad de recuperación entre sesiones
                  </div>
                </div>
              </div>
            </div>

            {/* Training Insights */}
            <div className="training-insights-section">
              <h4>Análisis de Entrenamiento</h4>
              <div className="insights-grid">
                <div className="insight-card terminal-card">
                  <h5>Consistencia</h5>
                  <div className="insight-value">
                    <span className="insight-percentage">85%</span>
                  </div>
                  <div className="insight-description">
                    Mantienes una buena consistencia en tus entrenamientos
                  </div>
                </div>

                <div className="insight-card terminal-card">
                  <h5>Progresión</h5>
                  <div className="insight-value">
                    <span className="insight-percentage">+12%</span>
                  </div>
                  <div className="insight-description">
                    Incremento promedio en pesos por semana
                  </div>
                </div>

                <div className="insight-card terminal-card">
                  <h5>Recuperación</h5>
                  <div className="insight-value">
                    <span className="insight-percentage">92%</span>
                  </div>
                  <div className="insight-description">
                    Excelente tasa de recuperación entre sesiones
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>No hay datos de progreso disponibles</p>
        )}
      </div>
    );
  };

  const renderProjections = () => {
    // Obtener la última semana
    const weekKeys = Object.keys(projections).sort((a, b) => Number(a) - Number(b));
    const lastWeek = weekKeys[weekKeys.length - 1];
    const finalProjections = lastWeek ? projections[lastWeek] : {};

    return (
      <div className="projections-section">
        <h3>Proyecciones de Peso</h3>
        {isLoadingProjections ? (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Cargando proyecciones...</p>
          </div>
        ) : projectionsError ? (
          <div className="error-section">
            <p>Error al cargar las proyecciones</p>
          </div>
        ) : weekKeys.length > 0 ? (
          <>
            <div className="projections-weeks-grid">
              {weekKeys.map((week) => (
                <div
                  key={week}
                  className={`week-projection-card terminal-card${week === lastWeek ? ' final-week' : ''}`}
                >
                  <h4 className="week-title">
                    Semana {week}
                    {week === lastWeek && <span className="final-label">Final</span>}
                  </h4>
                  <div className="exercises-list">
                    {Object.entries(projections[week]).map(([exercise, weight]) => (
                      <div key={exercise} className="exercise-item">
                        <span className="exercise-name">{exercise}</span>
                        <span className={`weight${week === lastWeek ? ' neon-accent' : ''}`}>{weight} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Resumen final */}
            <div className="final-summary-section terminal-card">
              <h4 className="final-summary-title">Resumen Final del Bloque</h4>
              <div className="final-exercises-list">
                {Object.entries(finalProjections).map(([exercise, weight]) => (
                  <div key={exercise} className="final-exercise-item">
                    <span className="exercise-name">{exercise}</span>
                    <span className="weight neon-accent">{weight} kg</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p>No hay proyecciones disponibles</p>
        )}
      </div>
    );
  };

  const renderRpeTables = () => (
    <div className="rpe-section">
      <h3>Tablas RPE</h3>
      {isLoadingRpeTables ? (
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Cargando tablas RPE...</p>
        </div>
      ) : rpeTablesError ? (
        <div className="error-section">
          <p>Error al cargar las tablas RPE</p>
        </div>
      ) : Object.keys(rpeTables).length > 0 ? (
        <div className="rpe-tables">
          {Object.entries(rpeTables).map(([exercise, rpeData]) => (
            <div key={exercise} className="rpe-table-card">
              <h4>{exercise}</h4>
              <div className="rpe-table">
                {Object.entries(rpeData).map(([rpe, weights]) => (
                  <div key={rpe} className="rpe-row">
                    <span className="rpe-label">RPE {rpe}:</span>
                    <div className="weights">
                      {(Array.isArray(weights) ? weights : []).map((weight: number, index: number) => (
                        <span key={index} className="weight-item">
                          {weight} kg
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay tablas RPE disponibles</p>
      )}
    </div>
  );

  return (
    <div className="block-detail-container">
      <div className="block-detail-header">
        <Link to="/blocks" className="back-button">
          ← Volver a Bloques
        </Link>
        <h1>Detalles del Bloque</h1>
      </div>
      <div className="block-detail-content">
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Resumen
          </button>
          <button
            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progreso
          </button>
          <button
            className={`tab-button ${activeTab === 'projections' ? 'active' : ''}`}
            onClick={() => setActiveTab('projections')}
          >
            Proyecciones
          </button>
          <button
            className={`tab-button ${activeTab === 'rpe' ? 'active' : ''}`}
            onClick={() => setActiveTab('rpe')}
          >
            Tablas RPE
          </button>
        </div>
        <div className="tab-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'progress' && renderProgress()}
          {activeTab === 'projections' && renderProjections()}
          {activeTab === 'rpe' && renderRpeTables()}
        </div>
      </div>
    </div>
  );
};

export default BlockDetailPage;
