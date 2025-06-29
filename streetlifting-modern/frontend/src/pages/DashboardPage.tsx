import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkouts } from '../hooks/useWorkouts';
import { useRoutines } from '../hooks/useRoutines';
import '../styles/Dashboard.css';

// SVG Icons
const WorkoutIcon = () => (
  <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const StatsIcon = () => (
  <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RMIcon = () => (
  <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
  </svg>
);

const PlusIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const ChartIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const WeightIcon = () => (
  <svg className="workout-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
  </svg>
);

const TimeIcon = () => (
  <svg className="workout-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EmptyIcon = () => (
  <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);

const RoutinesIcon = () => (
  <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 11H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 21h4a2 2 0 0 1 2-2v-4a2 2 0 0 1-2-2h-4"/>
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
  const { workouts } = useWorkouts();
  const { activeRoutines, isLoadingRoutines } = useRoutines();
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkouts: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalVolume: 0
  });
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [rmData, setRmData] = useState<RMData[]>([]);

  useEffect(() => {
    if (workouts) {
      // Calculate stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const totalWorkouts = workouts.length;
      const thisWeek = workouts.filter(w => new Date(w.date) >= weekAgo).length;
      const thisMonth = workouts.filter(w => new Date(w.date) >= monthAgo).length;
      
      // Calculate total volume from exercises
      const totalVolume = workouts.reduce((sum, w) => {
        return sum + w.exercises.reduce((exerciseSum, e) => {
          return exerciseSum + (e.weight * e.reps);
        }, 0);
      }, 0);

      setStats({ totalWorkouts, thisWeek, thisMonth, totalVolume });

      // Get recent workouts
      const recent = workouts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(w => {
          // Calculate total weight from exercises
          const totalWeight = w.exercises.reduce((sum, e) => sum + (e.weight * e.reps), 0);
          
          // Get main exercise name or use day_type
          const mainExercise = w.exercises[0]?.name || w.day_type;
          
          return {
            id: w.id,
            name: mainExercise,
            date: new Date(w.date).toLocaleDateString(),
            totalWeight: totalWeight,
            duration: 60 // Mock duration for now
          };
        });

      setRecentWorkouts(recent);

      // Mock RM data
      setRmData([
        { exercise: 'SQUAT', initial: 100, hypothetical: 120 },
        { exercise: 'BENCH', initial: 80, hypothetical: 95 },
        { exercise: 'DEADLIFT', initial: 140, hypothetical: 165 },
        { exercise: 'OVERHEAD', initial: 60, hypothetical: 70 }
      ]);
    }
  }, [workouts]);

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

        {/* Quick Actions Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">QUICK ACTIONS</h2>
            <WorkoutIcon />
          </div>
          <div className="section-content">
            Start a new workout or view your training data
          </div>
          <div className="quick-actions">
            <Link to="/workout-logger" className="action-btn">
              <PlusIcon />
              LOG WORKOUT
            </Link>
            <Link to="/workout-history" className="action-btn">
              <HistoryIcon />
              HISTORY
            </Link>
            <Link to="/progress" className="action-btn">
              <ChartIcon />
              PROGRESS
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
            <div className="recent-workouts">
              {recentWorkouts.map((workout) => (
                <div key={workout.id} className="workout-item">
                  <div className="workout-info">
                    <div className="workout-name">{workout.name}</div>
                    <div className="workout-date">{workout.date}</div>
                  </div>
                  <div className="workout-stats">
                    <div className="workout-stat">
                      <WeightIcon />
                      {formatWeight(workout.totalWeight)}
                    </div>
                    <div className="workout-stat">
                      <TimeIcon />
                      {formatDuration(workout.duration)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <EmptyIcon />
              <h3 className="empty-title">NO WORKOUTS YET</h3>
              <p className="empty-message">
                Start your training journey by logging your first workout
              </p>
              <Link to="/workout-logger" className="action-btn">
                <PlusIcon />
                START TRAINING
              </Link>
            </div>
          )}
        </div>

        {/* 1RM Progression Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">1RM PROGRESSION</h2>
            <RMIcon />
          </div>
          <div className="section-content">
            Track your strength gains across main lifts
          </div>
          <div className="rm-cards">
            {rmData.map((rm) => (
              <div key={rm.exercise} className="rm-card">
                <h3>{rm.exercise}</h3>
                <div className="rm-values">
                  <div className="rm-value">
                    <span>INITIAL</span>
                    <span className="initial-value">{rm.initial}kg</span>
                  </div>
                  <div className="rm-value">
                    <span>HYPOTHETICAL</span>
                    <span className="hypothetical-value">{rm.hypothetical}kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Routines Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">ROUTINES</h2>
            <RoutinesIcon />
          </div>
          <div className="section-content">
            Your active routines
          </div>
          {isLoadingRoutines ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading routines...</p>
            </div>
          ) : activeRoutines.length > 0 ? (
            <div className="routines-list">
              {activeRoutines.slice(0, 3).map((routine) => (
                <Link key={routine.id} to={`/routines/${routine.id}`} className="routine-item">
                  <div className="routine-info">
                    <div className="routine-name">{routine.name}</div>
                    <div className="routine-stats">
                      {routine.exercises?.length || 0} exercises • {routine.days?.length || 0} days
                    </div>
                  </div>
                  <div className="routine-arrow">→</div>
                </Link>
              ))}
              {activeRoutines.length > 3 && (
                <Link to="/routines" className="view-all-link">
                  View all {activeRoutines.length} routines →
                </Link>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <EmptyIcon />
              <h3 className="empty-title">NO ACTIVE ROUTINES</h3>
              <p className="empty-message">
                Create a routine to structure your training program
              </p>
              <Link to="/routines" className="action-btn">
                <PlusIcon />
                CREATE ROUTINE
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 