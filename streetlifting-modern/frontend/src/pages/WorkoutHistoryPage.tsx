import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkouts } from '../hooks/useWorkouts';
import type { WorkoutSummary } from '../types';
import '../styles/History.css';

// Terminal-style SVG Icons
const CalendarIcon = () => (
  <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EmptyIcon = () => (
  <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

// Simple date formatting function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const formatMonth = (monthIndex: number) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthIndex];
};

const WorkoutHistoryPage: React.FC = () => {
  const { workouts, isLoading, deleteWorkout, deleteWorkoutLoading } = useWorkouts();
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Filter workouts by month and year
  const filteredWorkouts = workouts?.filter((workout: WorkoutSummary) => {
    const workoutDate = new Date(workout.date);
    const workoutMonth = workoutDate.getMonth() + 1;
    const workoutYear = workoutDate.getFullYear();

    if (selectedMonth && workoutMonth !== parseInt(selectedMonth)) return false;
    if (selectedYear && workoutYear !== parseInt(selectedYear)) return false;
    
    return true;
  }) || [];

  // Get unique months and years for filters
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: formatMonth(i)
  }));

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const getDayTypeColor = (dayType: string) => {
    switch (dayType.toLowerCase()) {
      case 'push':
        return 'bg-red-500';
      case 'pull':
        return 'bg-blue-500';
      case 'legs':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDayTypeIcon = (dayType: string) => {
    switch (dayType.toLowerCase()) {
      case 'push':
        return '🔥';
      case 'pull':
        return '💪';
      case 'legs':
        return '🦵';
      default:
        return '🏋️';
    }
  };

  const handleDelete = async (workoutId: number) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await deleteWorkout(workoutId);
      } catch (error) {
        console.error('Failed to delete workout:', error);
      }
    }
  };

  const clearFilters = () => {
    setSelectedMonth('');
    setSelectedYear('');
  };

  return (
    <div className="history-page">
      {/* Header */}
      <div className="history-header">
        <h1 className="history-title">WORKOUT HISTORY</h1>
        <p className="history-subtitle">
          Track your progress and review past workouts
        </p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <h2 className="filters-title">FILTERS</h2>
          <button
            onClick={clearFilters}
            className="clear-filters-btn"
          >
            CLEAR FILTERS
          </button>
        </div>

        <div className="filters-grid">
          {/* Month Filter */}
          <div className="filter-group">
            <label className="filter-label">
              MONTH
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="filter-select"
            >
              <option value="">ALL MONTHS</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="filter-group">
            <label className="filter-label">
              YEAR
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="filter-select"
            >
              <option value="">ALL YEARS</option>
              {years.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="filter-group">
            <label className="filter-label">
              RESULTS
            </label>
            <div className="results-count">
              {filteredWorkouts.length} WORKOUT{filteredWorkouts.length !== 1 ? 'S' : ''} FOUND
            </div>
          </div>
        </div>
      </div>

      {/* Workouts List */}
      <div className="workouts-section">
        {isLoading ? (
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="loading-skeleton">
                <div style={{ height: '60px' }}></div>
              </div>
            ))}
          </div>
        ) : filteredWorkouts.length > 0 ? (
          <div>
            {filteredWorkouts.map((workout: WorkoutSummary) => (
              <div key={workout.id} className="workout-item">
                <div className="workout-content">
                  <div className="workout-info">
                    <div className={`day-type-indicator ${workout.day_type.toLowerCase()}`}></div>
                    <div className="workout-details">
                      <h3>{workout.day_type.toUpperCase()} DAY</h3>
                      <div className="workout-meta">
                        <span className="meta-item">
                          <CalendarIcon />
                          {formatDate(workout.date)}
                        </span>
                        <span className="meta-item">
                          {workout.exercise_count} EXERCISES
                        </span>
                        <span className="meta-item">
                          {workout.total_sets} SETS
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="workout-actions">
                    {/* Status indicator */}
                    <div className={`status-badge ${workout.completed ? 'completed' : 'in-progress'}`}>
                      {workout.completed ? 'COMPLETED' : 'IN PROGRESS'}
                    </div>

                    {/* Actions */}
                    <Link
                      to={`/workout/${workout.id}`}
                      className="action-btn"
                      title="View workout"
                    >
                      <EyeIcon />
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(workout.id)}
                      disabled={deleteWorkoutLoading}
                      className="action-btn delete"
                      title="Delete workout"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <EmptyIcon />
            <h3 className="empty-title">NO WORKOUTS FOUND</h3>
            <p className="empty-message">
              {selectedMonth || selectedYear 
                ? 'Try adjusting your filters or log your first workout.'
                : 'Start your fitness journey by logging your first workout!'
              }
            </p>
            <Link
              to="/workout-logger/Push"
              className="start-workout-btn"
            >
              <PlusIcon />
              LOG WORKOUT
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutHistoryPage; 