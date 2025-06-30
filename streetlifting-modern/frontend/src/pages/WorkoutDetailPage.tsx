import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkouts';
import '../styles/WorkoutDetail.css';

// Terminal-style SVG Icons
const ArrowLeftIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
  </svg>
);

const XMarkIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PencilIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const WeightIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
);

const RepsIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const SetIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const RpeIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const ExerciseIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const NotesIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="terminal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Date formatting function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const WorkoutDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workout, isLoading, error } = useWorkout(parseInt(id || '0'));

  const getDayTypeColor = (dayType: string) => {
    switch (dayType?.toLowerCase()) {
      case 'push':
        return 'push';
      case 'pull':
        return 'pull';
      case 'legs':
        return 'legs';
      default:
        return 'general';
    }
  };

  const getStatusColor = (completed: boolean, inProgress: boolean) => {
    if (completed) return 'completed';
    if (inProgress) return 'in-progress';
    return 'not-started';
  };

  const getStatusText = (completed: boolean, inProgress: boolean) => {
    if (completed) return 'COMPLETED';
    if (inProgress) return 'IN PROGRESS';
    return 'NOT STARTED';
  };

  const getStatusIcon = (completed: boolean, inProgress: boolean) => {
    if (completed) return <CheckIcon />;
    if (inProgress) return <ClockIcon />;
    return <XMarkIcon />;
  };

  if (isLoading) {
    return (
      <div className="workout-detail-page">
        <div className="loading-state">
          <div className="loading-skeleton" style={{ height: '80px' }}></div>
          <div className="loading-skeleton" style={{ height: '200px' }}></div>
          <div className="loading-skeleton" style={{ height: '400px' }}></div>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="workout-detail-page">
        <div className="error-state">
          <ErrorIcon />
          <h3 className="error-title">WORKOUT NOT FOUND</h3>
          <p className="error-message">
            The workout you're looking for doesn't exist or has been deleted.
          </p>
          <Link to="/workout-history" className="retry-button">
            <ArrowLeftIcon />
            BACK TO HISTORY
          </Link>
        </div>
      </div>
    );
  }

  const totalSets = workout.exercises.length;
  const completedSets = workout.exercises.filter(ex => ex.completed).length;
  const totalVolume = workout.exercises.reduce((sum, ex) => sum + (ex.weight * ex.reps), 0);

  return (
    <div className="workout-detail-page">
      {/* Enhanced Header */}
      <div className="workout-detail-header">
        <button
          onClick={() => navigate(-1)}
          className="back-btn"
          title="Go back"
        >
          <ArrowLeftIcon />
        </button>
        
        <div className="workout-title-section">
          <div className={`day-type-indicator ${getDayTypeColor(workout.day_type)}`}></div>
          <h1 className="workout-title">
            {workout.day_type.toUpperCase()} WORKOUT
          </h1>
        </div>
      </div>

      {/* Workout Info Section - GRID LAYOUT */}
      <div className="workout-info-section">
        <div className="workout-info-item">
          <div className="workout-info-label">DATE</div>
          <div className="workout-info-value">{formatDate(workout.date)}</div>
        </div>

        <div className="workout-info-item">
          <div className="workout-info-label">STATUS</div>
          <div className={`workout-info-value ${getStatusColor(workout.completed, workout.in_progress)}`}>
            {getStatusText(workout.completed, workout.in_progress)}
          </div>
        </div>

        <div className="workout-info-item">
          <div className="workout-info-label">EXERCISES</div>
          <div className="workout-info-value total">{workout.exercises.length}</div>
        </div>

        <div className="workout-info-item">
          <div className="workout-info-label">TOTAL SETS</div>
          <div className="workout-info-value total">{totalSets}</div>
        </div>

        <div className="workout-info-item">
          <div className="workout-info-label">COMPLETED</div>
          <div className="workout-info-value completed">{completedSets}/{totalSets}</div>
        </div>

        <div className="workout-info-item">
          <div className="workout-info-label">TOTAL VOLUME</div>
          <div className="workout-info-value total">{totalVolume.toLocaleString()} kg</div>
        </div>
      </div>

      {/* Notes */}
      {workout.notes && (
        <div className="notes-section">
          <div className="notes-label">
            <NotesIcon />
            NOTES
          </div>
          <div className="notes-content">{workout.notes}</div>
        </div>
      )}

      {/* Exercises Section */}
      <div className="exercises-section">
        <div className="exercises-header">
          <h2 className="exercises-title">EXERCISES</h2>
          <div className="exercises-actions">
            <button
              onClick={() => navigate(`/workout/${workout.id}/edit`)}
              className="action-btn edit"
              title="Edit workout"
            >
              <PencilIcon />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this workout?')) {
                  // Handle delete
                }
              }}
              className="action-btn delete"
              title="Delete workout"
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        <div className="exercises-grid">
          {workout.exercises.length > 0 ? (
            // Group exercises by name and show all sets for each exercise
            Object.entries(
              workout.exercises.reduce((acc, exercise) => {
                if (!acc[exercise.name]) {
                  acc[exercise.name] = [];
                }
                acc[exercise.name].push(exercise);
                return acc;
              }, {} as Record<string, typeof workout.exercises>)
            ).map(([exerciseName, sets]) => {
              const totalSets = sets.length;
              const completedSets = sets.filter(set => set.completed).length;
              const isCompleted = completedSets === totalSets;
              
              return (
                <div 
                  key={exerciseName} 
                  className={`exercise-card ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="exercise-header">
                    <h3 className="exercise-name">{exerciseName}</h3>
                    <div className={`exercise-category ${isCompleted ? 'completed' : 'incomplete'}`}>
                      {isCompleted ? 'COMPLETED' : `${completedSets}/${totalSets} SETS`}
                    </div>
                  </div>

                  <div className="sets-grid">
                    {sets.map((set, index) => (
                      <div 
                        key={set.id} 
                        className={`set-item ${set.completed ? 'completed' : ''}`}
                      >
                        <div className="set-number">SET {set.set_number}</div>
                        <div className="set-weight">{set.weight}kg</div>
                        <div className="set-reps">{set.reps} reps</div>
                        {set.rpe && (
                          <div className="set-rpe">RPE {set.rpe}</div>
                        )}
                        <div className={`set-status ${set.completed ? 'completed' : 'pending'}`}>
                          {set.completed ? 'COMPLETED' : 'PENDING'}
                        </div>
                        {set.notes && (
                          <div className="set-notes">
                            <NotesIcon />
                            <span>{set.notes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Exercise-level notes if any */}
                  {sets.some(set => set.notes) && (
                    <div className="exercise-notes">
                      <div className="exercise-notes-label">
                        <NotesIcon />
                        EXERCISE NOTES
                      </div>
                      <div className="exercise-notes-content">
                        {sets
                          .filter(set => set.notes)
                          .map(set => set.notes)
                          .join(' | ')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="error-state">
              <ExerciseIcon />
              <h3 className="error-title">NO EXERCISES FOUND</h3>
              <p className="error-message">
                This workout doesn't have any exercises recorded.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailPage; 