import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/BodyWeightContext';
// import { useAdaptation } from '../contexts/AdaptationContext'; // Temporarily disabled
import { useWorkouts } from '../hooks/useWorkouts';
import { useOneRepMaxes } from '../hooks/useOneRepMaxes';
import { useBlocks } from '../hooks/useBlocks';
import LoadingSpinner from '../components/LoadingSpinner';
// import { InteractionType } from '../types/adaptation'; // Temporarily disabled
import '../styles/Dashboard.css';

// SVG Icons
const WorkoutIcon = () => (
  <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const StatsIcon = () => (
  <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 3v18h18"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
  </svg>
);

const HistoryIcon = () => (
  <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
  </svg>
);

const RMIcon = () => (
  <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const PlusIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const CalendarIcon = () => (
  <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
  </svg>
);

const ProgramIcon = () => (
  <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M13 13h4-4zM13 17h4-4zM13 9h4-4z"/>
  </svg>
);

const ChartIcon = () => (
  <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 3v18h18"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
  </svg>
);

const WeightIcon = () => (
  <svg className="workout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 3h12l4 6-10 13L2 9z"/>
  </svg>
);

const TimeIcon = () => (
  <svg className="workout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
  </svg>
);

const EmptyIcon = () => (
  <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 12h6M12 9v6"/>
  </svg>
);

const RoutinesIcon = () => (
  <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 12h6M12 9v6"/>
  </svg>
);

interface DashboardStats {
  totalWorkouts: number;
  thisWeek: number;
  thisMonth: number;
  totalVolume: number;
}

interface RecentWorkout {
  id: number;
  name: string;
  date: string;
  totalWeight: number;
  duration: number;
}

interface RMData {
  exercise: string;
  initial: number;
  hypothetical: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  // const { trackInteraction } = useAdaptation(); // Temporarily disabled
  
  // Track dashboard visit - Temporarily disabled
  /*
  useEffect(() => {
    if (user) {
      trackInteraction({
        interaction_type: InteractionType.PAGE_VISIT,
        interaction_data: {
          page: 'dashboard',
          timestamp: new Date().toISOString()
        }
      }).catch(console.error);
    }
  }, [user, trackInteraction]);
  */
  const { workouts } = useWorkouts();
  const { latestOneRepMaxes, isLoadingOneRepMaxes } = useOneRepMaxes();
  const { currentBlock, isLoadingCurrentBlock } = useBlocks();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkouts: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalVolume: 0
  });
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);

  // Memoize stats calculation to prevent unnecessary recalculations
  const calculatedStats = useMemo(() => {
    if (!workouts) {
      return {
        totalWorkouts: 0,
        thisWeek: 0,
        thisMonth: 0,
        totalVolume: 0
      };
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalWorkouts = workouts.length;
    const thisWeek = workouts.filter(w => new Date(w.date) >= weekAgo).length;
    const thisMonth = workouts.filter(w => new Date(w.date) >= monthAgo).length;
    
    // Calculate total volume from exercises
    const totalVolume = workouts.reduce((sum, w) => {
      if (!w.exercises || !Array.isArray(w.exercises)) return sum;
      return sum + w.exercises.reduce((exerciseSum, e) => {
        return exerciseSum + (e.weight * e.reps);
      }, 0);
    }, 0);

    return { totalWorkouts, thisWeek, thisMonth, totalVolume };
  }, [workouts]);

  // Memoize recent workouts calculation
  const calculatedRecentWorkouts = useMemo(() => {
    if (!workouts) return [];

    return workouts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(w => {
        // Calculate total weight from exercises
        const totalWeight = w.exercises && Array.isArray(w.exercises) 
          ? w.exercises.reduce((sum, e) => sum + (e.weight * e.reps), 0)
          : 0;
        
        // Get main exercise name or use day_type
        const mainExercise = w.exercises && w.exercises.length > 0 
          ? w.exercises[0]?.name 
          : w.day_type;
        
        return {
          id: w.id,
          name: mainExercise,
          date: new Date(w.date).toLocaleDateString(),
          totalWeight: totalWeight,
          duration: 60 // Mock duration for now
        };
      });
  }, [workouts]);

  // Memoize RM data calculation
  const calculatedRmData = useMemo(() => {
    if (latestOneRepMaxes && latestOneRepMaxes.length > 0) {
      // Define the preferred order for exercises (matching backend format)
      const exerciseOrder = ['Muscle Up', 'Pull Up', 'Dip', 'Squat'];
      
      // Convert real 1RM data to dashboard format and sort by preferred order
      const result = latestOneRepMaxes
        .map(rm => ({
          exercise: rm.exercise,
          initial: Math.round(rm.one_rm * 0.85), // Estimate initial as 85% of current
          hypothetical: rm.one_rm
        }))
        .sort((a, b) => {
          const aIndex = exerciseOrder.indexOf(a.exercise);
          const bIndex = exerciseOrder.indexOf(b.exercise);
          // If both exercises are in the preferred order, sort by that order
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          // If only one is in the preferred order, prioritize it
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          // If neither is in the preferred order, sort alphabetically
          return a.exercise.localeCompare(b.exercise);
        });
      
      return result;
    } else if (userProfile && userProfile.maxReps) {
      // Use data from user profile (initial setup)
      const exerciseOrder = ['Muscle Up', 'Pull Up', 'Dip', 'Squat'];
      
      const result = [
        { 
          exercise: 'Muscle Up', 
          initial: userProfile.maxReps.muscle_ups, 
          hypothetical: userProfile.maxReps.muscle_ups 
        },
        { 
          exercise: 'Pull Up', 
          initial: userProfile.maxReps.pull_ups, 
          hypothetical: userProfile.maxReps.pull_ups 
        },
        { 
          exercise: 'Dip', 
          initial: userProfile.maxReps.dips, 
          hypothetical: userProfile.maxReps.dips 
        },
        { 
          exercise: 'Squat', 
          initial: userProfile.maxReps.squats, 
          hypothetical: userProfile.maxReps.squats 
        }
      ].sort((a, b) => {
        const aIndex = exerciseOrder.indexOf(a.exercise);
        const bIndex = exerciseOrder.indexOf(b.exercise);
        return aIndex - bIndex;
      });
      
      return result;
    } else {
      // Fallback to mock data if no real data exists
      return [
        { exercise: 'Muscle Up', initial: 15, hypothetical: 15 },
        { exercise: 'Pull Up', initial: 50, hypothetical: 50 },
        { exercise: 'Dip', initial: 70, hypothetical: 70 },
        { exercise: 'Squat', initial: 110, hypothetical: 110 }
      ];
    }
  }, [latestOneRepMaxes, userProfile]);

  // Update state when calculated values change
  useEffect(() => {
    setStats(calculatedStats);
  }, [calculatedStats]);

  useEffect(() => {
    setRecentWorkouts(calculatedRecentWorkouts);
  }, [calculatedRecentWorkouts]);

  const formatWeight = (weight: number) => {
    return `${weight}kg`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">DASHBOARD</h1>
        <p className="dashboard-subtitle">
          Welcome back, {user?.username || 'Athlete'}
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Quick Stats Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">STATISTICS</h2>
            <StatsIcon />
          </div>
          <div className="section-content">
            Track your training progress and performance metrics
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{stats.totalWorkouts}</div>
              <div className="stat-label">TOTAL</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.thisWeek}</div>
              <div className="stat-label">THIS WEEK</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.thisMonth}</div>
              <div className="stat-label">THIS MONTH</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{formatWeight(stats.totalVolume)}</div>
              <div className="stat-label">VOLUME</div>
            </div>
          </div>
        </div>

        {/* Active Training Block Section */}
        {currentBlock && (
          <div className="dashboard-section block-section">
            <div className="section-header">
              <h2 className="section-title">BLOQUE ACTIVO</h2>
              <ProgramIcon />
            </div>
            <div className="section-content">
              Tu programa de entrenamiento actual
            </div>
            <div className="block-info">
              <div className="block-header">
                <h3 className="block-name">{currentBlock.name}</h3>
                <span className="block-status">En Progreso</span>
              </div>
              <div className="block-progress">
                <div className="progress-info">
                  <span>Semana {currentBlock.current_week} de {currentBlock.total_weeks}</span>
                  <span>{Math.round((currentBlock.current_week / currentBlock.total_weeks) * 100)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(currentBlock.current_week / currentBlock.total_weeks) * 100}%` }}
                  />
                </div>
              </div>
              <div className="block-details">
                <div className="detail-item">
                  <span className="detail-label">Estrategia:</span>
                  <span className="detail-value">{currentBlock.strategy}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Incremento:</span>
                  <span className="detail-value">{currentBlock.weekly_increment}%/sem</span>
                </div>
              </div>
              <div className="block-actions">
                <Link to={`/blocks/${currentBlock.id}`} className="block-action-btn">
                  Ver Detalles
                </Link>
                <Link to="/workout-logger/push" className="block-action-btn primary">
                  Entrenar Ahora
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">QUICK ACTIONS</h2>
            <WorkoutIcon />
          </div>
          <div className="section-content">
            Start your next training session
          </div>
          <div className="action-buttons">
            <Link to="/program-templates" className="action-btn program">
              <ProgramIcon />
              TRAINING PROGRAMS
            </Link>
            <Link to="/workout-logger/push" className="action-btn primary">
              <PlusIcon />
              PUSH DAY
            </Link>
            <Link to="/workout-logger/pull" className="action-btn secondary">
              <PlusIcon />
              PULL DAY
            </Link>
            <Link to="/workout-logger/legs" className="action-btn tertiary">
              <PlusIcon />
              LEGS DAY
            </Link>
          </div>
        </div>

        {/* Recent Workouts Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">RECENT WORKOUTS</h2>
            <HistoryIcon />
          </div>
          <div className="section-content">
            Your latest training sessions
          </div>
          {recentWorkouts.length > 0 ? (
            <div className="workout-list">
              {recentWorkouts.map((workout) => (
                <div key={workout.id} className="workout-item">
                  <div className="workout-info">
                    <div className="workout-name">{workout.name}</div>
                    <div className="workout-date">{workout.date}</div>
                  </div>
                  <div className="workout-stats">
                    <div className="workout-stat">
                      <WeightIcon />
                      <span>{formatWeight(workout.totalWeight)}</span>
                    </div>
                    <div className="workout-stat">
                      <TimeIcon />
                      <span>{formatDuration(workout.duration)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <EmptyIcon />
              <p>No workouts yet</p>
              <Link to="/workout-logger/push" className="empty-action">
                Start your first workout
              </Link>
            </div>
          )}
        </div>

        {/* One Rep Max Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">ONE REP MAX</h2>
            <RMIcon />
          </div>
          <div className="section-content">
            {latestOneRepMaxes && latestOneRepMaxes.length > 0 
              ? "YOUR CURRENT STRENGTH LEVELS" 
              : userProfile && userProfile.maxReps
              ? "YOUR INITIAL STRENGTH LEVELS (FROM SETUP)"
              : "EXAMPLE DATA - SET YOUR REAL VALUES IN SETUP"
            }
          </div>
          <div className="rm-cards">
            {calculatedRmData.map((rm) => (
              <div key={rm.exercise} className={`rm-card ${(!latestOneRepMaxes || latestOneRepMaxes.length === 0) && (!userProfile || !userProfile.maxReps) ? 'rm-card--example' : ''}`}>
                <h3>{rm.exercise}</h3>
                <div className="rm-values">
                  <div className="rm-value">
                    <span>CURRENT</span>
                    <span className="hypothetical-value">{rm.hypothetical}KG</span>
                  </div>
                  <div className="rm-value">
                    <span>INITIAL</span>
                    <span className="initial-value">{rm.initial}KG</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {(!latestOneRepMaxes || latestOneRepMaxes.length === 0) && (!userProfile || !userProfile.maxReps) && (
            <div className="rm-empty-state">
              <div className="empty-message">
                <span className="terminal-prompt">$</span> NO REAL DATA FOUND
              </div>
              <div className="empty-description">
                COMPLETE INITIAL SETUP TO ADD YOUR ACTUAL ONE REP MAXES
              </div>
              <Link to="/setup" className="setup-link">
                <PlusIcon />
                GO TO SETUP
              </Link>
            </div>
          )}
        </div>

        {/* Routines Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">ROUTINES</h2>
            <RoutinesIcon />
          </div>
          <div className="section-content">
            Manage your training programs
          </div>
          <div className="routine-actions">
            <Link to="/routines" className="routine-btn">
              <CalendarIcon />
              VIEW ROUTINES
            </Link>
            <Link to="/blocks" className="routine-btn">
              <ChartIcon />
              TRAINING BLOCKS
            </Link>
          </div>
        </div>

        {/* Progress Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">PROGRESS</h2>
            <ChartIcon />
          </div>
          <div className="section-content">
            Track your long-term progress
          </div>
          <div className="progress-actions">
            <Link to="/progress" className="progress-btn">
              <ChartIcon />
              VIEW PROGRESS
            </Link>
            <Link to="/history" className="progress-btn">
              <HistoryIcon />
              WORKOUT HISTORY
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 