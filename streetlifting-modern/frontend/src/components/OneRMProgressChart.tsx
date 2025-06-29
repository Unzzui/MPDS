import React, { useState, useEffect } from 'react';
import { useOneRepMaxes } from '../hooks/useOneRepMaxes';
import type { OneRepMax } from '../types';

interface OneRMProgressChartProps {
  exercise?: string;
  height?: number;
}

const OneRMProgressChart: React.FC<OneRMProgressChartProps> = ({ 
  exercise, 
  height = 400 
}) => {
  const { oneRepMaxes, isLoadingOneRepMaxes, oneRepMaxesError, getProgressData } = useOneRepMaxes();
  const [selectedExercise, setSelectedExercise] = useState(exercise || '');
  const [chartHeight, setChartHeight] = useState(height);

  // Responsive chart height
  useEffect(() => {
    const updateChartHeight = () => {
      if (window.innerWidth < 768) {
        setChartHeight(300);
      } else if (window.innerWidth < 1024) {
        setChartHeight(350);
      } else {
        setChartHeight(height);
      }
    };

    updateChartHeight();
    window.addEventListener('resize', updateChartHeight);
    return () => window.removeEventListener('resize', updateChartHeight);
  }, [height]);

  // Get unique exercises
  const exercises = [...new Set(oneRepMaxes.map(rm => rm.exercise))];

  // Get progress data for selected exercise
  const progressData = selectedExercise ? getProgressData(selectedExercise) : [];

  if (isLoadingOneRepMaxes) {
    return (
      <div className="flex items-center justify-center" style={{ height: chartHeight }}>
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          </div>
          <p className="text-gray-400 terminal-text text-sm">Cargando progresión...</p>
        </div>
      </div>
    );
  }

  if (oneRepMaxesError) {
    return (
      <div className="flex items-center justify-center" style={{ height: chartHeight }}>
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-3 terminal-text">[ERROR]</div>
          <p className="text-red-400 terminal-text text-sm">Error al cargar datos</p>
          <p className="text-gray-500 terminal-text text-xs mt-1">Verificar conexión</p>
        </div>
      </div>
    );
  }

  if (oneRepMaxes.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: chartHeight }}>
        <div className="text-center">
          <div className="text-gray-500 text-2xl mb-3 terminal-text">[NO DATA]</div>
          <p className="text-gray-400 terminal-text text-sm">No hay datos de progresión</p>
          <p className="text-gray-500 terminal-text text-xs mt-1">Importar datos desde data_rm.json</p>
        </div>
      </div>
    );
  }

  // Calculate min and max values from actual data
  const minValue = Math.min(...progressData.map(d => d.value || 0));
  const maxValue = Math.max(...progressData.map(d => d.value || 0));
  const range = maxValue - minValue;
  
  // Add fixed 5kg padding to the range
  const paddedMin = minValue - 5;
  const paddedMax = maxValue + 5;
  const paddedRange = paddedMax - paddedMin;

  // Generate polyline points safely
  const generatePolylinePoints = () => {
    if (progressData.length === 0) return '';
    
    return progressData.map((d, i) => {
      let x, y;
      
      if (progressData.length === 1) {
        x = 50;
        y = 50;
      } else {
        x = (i / (progressData.length - 1)) * 100;
        y = 100 - (((d.value || 0) - paddedMin) / paddedRange) * 100;
      }
      
      // Ensure values are valid numbers and within bounds
      const validX = isNaN(x) || !isFinite(x) ? 50 : Math.max(0, Math.min(100, x));
      const validY = isNaN(y) || !isFinite(y) ? 50 : Math.max(0, Math.min(100, y));
      
      return `${validX},${validY}`;
    }).join(' ');
  };

  const getImprovementClass = () => {
    if (progressData.length > 1) {
      const improvement = progressData[progressData.length - 1].value - progressData[0].value;
      return improvement > 0 ? 'positive' : 'negative';
    }
    return '';
  };

  const getImprovementText = () => {
    if (progressData.length > 1) {
      const improvement = progressData[progressData.length - 1].value - progressData[0].value;
      return improvement > 0 ? `+${Math.round(improvement)}kg` : `${Math.round(improvement)}kg`;
    }
    return '';
  };

  const getDaysDifference = () => {
    if (progressData.length > 1) {
      const startDate = new Date(progressData[0].date);
      const endDate = new Date(progressData[progressData.length - 1].date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const getXAxisLabels = () => {
    if (!progressData || progressData.length === 0) return [];
    
    const indices = new Set<number>();
    indices.add(0); // Add first index
    
    if (progressData.length > 5) {
      indices.add(Math.floor((progressData.length - 1) / 2)); // Add middle index
    }
    
    if (progressData.length > 1) {
      indices.add(progressData.length - 1); // Add last index
    }
    
    return Array.from(indices).map(index => progressData[index]);
  };

  const xAxisLabels = getXAxisLabels();

  return (
    <div className="w-full terminal-text">
      {/* Exercise Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3 terminal-text">
          <span className="text-green-500">$</span> Seleccionar Ejercicio
        </label>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent terminal-text text-sm transition-all duration-200 hover:border-gray-500"
        >
          <option value="">[Seleccionar ejercicio...]</option>
          {exercises.map(ex => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>
      </div>

      {/* Chart */}
      {selectedExercise && progressData.length > 0 ? (
        <div className="space-y-6">
          {/* Chart Container */}
          <div className="chart-container">
            <h3 className="chart-title">Progreso de 1RM</h3>
            <div className="chart-wrapper">
              {/* Y-axis labels */}
              <div className="y-axis-labels">
                {[paddedMax, paddedMax * 0.75 + paddedMin * 0.25, paddedMax * 0.5 + paddedMin * 0.5, paddedMax * 0.25 + paddedMin * 0.75, paddedMin].map((value, i) => (
                  <div key={i} className="y-label">
                    {Math.round(value)}kg
                  </div>
                ))}
              </div>
              
              {/* Main chart area */}
              <div className="chart-area-container">
                <svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00ff88" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#00ff88" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines - more subtle */}
                  {[...Array(6)].map((_, i) => (
                    <g key={i}>
                      <line
                        className="chart-grid"
                        x1="0"
                        y1={16.67 * i}
                        x2="100"
                        y2={16.67 * i}
                      />
                      <line
                        className="chart-grid"
                        x1={16.67 * i}
                        y1="0"
                        x2={16.67 * i}
                        y2="100"
                      />
                    </g>
                  ))}
                  
                  {/* Axes - thinner */}
                  <line className="chart-axis" x1="0" y1="100" x2="100" y2="100" />
                  <line className="chart-axis" x1="0" y1="0" x2="0" y2="100" />
                  
                  {/* Area fill */}
                  {progressData.length > 0 && (
                    <path
                      className="chart-area"
                      d={`M 0,100 ${generatePolylinePoints()} L 100,100 Z`}
                    />
                  )}
                  
                  {/* Progress line - thinner */}
                  {progressData.length > 0 && (
                    <polyline
                      className="chart-line"
                      points={generatePolylinePoints()}
                    />
                  )}
                  
                  {/* Data points - much smaller for mobile */}
                  {progressData.map((d, i) => {
                    let x, y;
                    
                    if (progressData.length === 1) {
                      x = 50;
                      y = 50;
                    } else {
                      x = (i / (progressData.length - 1)) * 100;
                      y = 100 - (((d.value || 0) - paddedMin) / paddedRange) * 100;
                    }
                    
                    // Ensure values are valid numbers and within bounds
                    const validX = isNaN(x) || !isFinite(x) ? 50 : Math.max(0, Math.min(100, x));
                    const validY = isNaN(y) || !isFinite(y) ? 50 : Math.max(0, Math.min(100, y));
                    
                    return (
                      <g key={i} className="data-point">
                        <circle
                          cx={`${validX}%`}
                          cy={`${validY}%`}
                          r="0.8"
                          fill="#1f2937"
                          stroke="#00ff88"
                          strokeWidth="0.5"
                          className="transition-all duration-200 hover:r-1.5 hover:stroke-0.8"
                        />
                        <circle
                          cx={`${validX}%`}
                          cy={`${validY}%`}
                          r="0.5"
                          fill="#00ff88"
                          className="transition-all duration-200"
                        />
                      </g>
                    );
                  })}
                </svg>
                
                {/* X-axis labels (dates) - Cleaned up */}
                <div className="x-axis-labels">
                  {xAxisLabels.map((d, i) => (
                    <div key={i} className="x-label">
                      {new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Summary Cards */}
          <div className="progress-summary-grid">
            <div className="summary-card">
              <div className="summary-label">Peso Inicial</div>
              <div className="summary-value">{progressData.length > 0 ? `${progressData[0].value}kg` : '-'}</div>
              <div className="summary-subtext">{progressData.length > 0 ? new Date(progressData[0].date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : ''}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Peso Actual</div>
              <div className="summary-value">{progressData.length > 0 ? `${progressData[progressData.length - 1].value}kg` : '-'}</div>
              <div className="summary-subtext">{progressData.length > 0 ? new Date(progressData[progressData.length - 1].date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : ''}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Mejora</div>
              <div className={`summary-value ${getImprovementClass()}`}>{getImprovementText()}</div>
              <div className="summary-subtext">{`en ${getDaysDifference()} días`}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Registros</div>
              <div className="summary-value">{progressData.length}</div>
              <div className="summary-subtext">total</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-data-placeholder">
          <div className="placeholder-icon">[SELECT]</div>
          <p>Selecciona un ejercicio para ver tu progreso</p>
        </div>
      )}
    </div>
  );
};

export default OneRMProgressChart; 