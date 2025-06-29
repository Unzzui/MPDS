import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoutine, useRoutineExercises } from '../hooks/useRoutines';
import type { RoutineExerciseCreate } from '../types';
import '../styles/Routines.css';

const RoutineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routineId = parseInt(id || '0');
  
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<number | null>(null);

  const { routine, isLoading: isLoadingRoutine, error: routineError } = useRoutine(routineId);
  const { 
    exercises, 
    isLoading: isLoadingExercises, 
    error: exercisesError,
    addExercise,
    isAddingExercise,
    addExerciseError
  } = useRoutineExercises(routineId);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleAddExercise = (formData: FormData) => {
    const exerciseData: RoutineExerciseCreate = {
      exercise_name: formData.get('exercise_name') as string,
      order: parseInt(formData.get('order') as string),
      sets: parseInt(formData.get('sets') as string),
      reps: formData.get('reps') as string,
      weight_percentage: formData.get('weight_percentage') ? parseFloat(formData.get('weight_percentage') as string) : undefined,
      rest_time: formData.get('rest_time') ? parseInt(formData.get('rest_time') as string) : undefined,
      is_main_lift: formData.has('is_main_lift'),
      notes: formData.get('notes') as string || undefined,
    };

    addExercise(exerciseData, {
      onSuccess: () => {
        setShowAddExerciseModal(false);
      },
    });
  };

  if (isLoadingRoutine || isLoadingExercises) {
    return (
      <div className="routines-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading routine details...</p>
        </div>
      </div>
    );
  }

  if (routineError || exercisesError || !routine) {
    return (
      <div className="routines-container">
        <div className="empty-state">
          <h3>Error Loading Routine</h3>
          <p>There was an error loading the routine details. Please try again later.</p>
          <button className="btn-primary" onClick={() => navigate('/routines')}>
            Back to Routines
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="routines-container">
      {/* Header */}
      <div className="routines-header">
        <div>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/routines')}
            style={{ marginBottom: '1rem' }}
          >
            ← Back to Routines
          </button>
          <h1>{routine.name}</h1>
          {routine.description && (
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {routine.description}
            </p>
          )}
        </div>
        <div>
          <button 
            className="btn-secondary" 
            onClick={() => setShowAddExerciseModal(true)}
            style={{ marginRight: '1rem' }}
          >
            Add Exercise
          </button>
          <button className="btn-primary" onClick={() => navigate(`/workout-logger/${routine.id}`)}>
            Start Workout
          </button>
        </div>
      </div>

      {/* Routine Stats */}
      <div className="routine-stats" style={{ marginBottom: '2rem' }}>
        <div className="stat-item">
          <div className="stat-label">Total Exercises</div>
          <div className="stat-value">{exercises.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Training Days</div>
          <div className="stat-value">{routine.days.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Main Lifts</div>
          <div className="stat-value">{routine.main_lifts.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Status</div>
          <div className="stat-value">{routine.is_active ? 'Active' : 'Inactive'}</div>
        </div>
      </div>

      {/* Training Days */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          color: 'var(--accent-secondary)', 
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Training Days
        </h2>
        <div className="routine-days">
          {routine.days.map((day) => (
            <span key={day} className="day-badge">
              {dayNames[day - 1]}
            </span>
          ))}
        </div>
      </div>

      {/* Main Lifts */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          color: 'var(--accent-secondary)', 
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Main Lifts
        </h2>
        <div className="exercises-list">
          {routine.main_lifts.map((lift, index) => (
            <span key={index} className="exercise-tag main-lift-tag">
              {lift}
            </span>
          ))}
        </div>
      </div>

      {/* Exercises List */}
      <div>
        <h2 style={{ 
          fontSize: '1.5rem', 
          color: 'var(--accent-secondary)', 
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Exercises ({exercises.length})
        </h2>
        
        {exercises.length === 0 ? (
          <div className="empty-state">
            <h3>No Exercises Added</h3>
            <p>Add exercises to this routine to get started.</p>
            <button className="btn-primary" onClick={() => setShowAddExerciseModal(true)}>
              Add First Exercise
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {exercises
              .sort((a, b) => a.order - b.order)
              .map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  isMainLift={routine.main_lifts.includes(exercise.exercise_name)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <AddExerciseModal
          onClose={() => setShowAddExerciseModal(false)}
          onSubmit={handleAddExercise}
          isLoading={isAddingExercise}
          nextOrder={exercises.length + 1}
          mainLifts={routine.main_lifts}
        />
      )}
    </div>
  );
};

// Exercise Card Component
interface ExerciseCardProps {
  exercise: any;
  isMainLift: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isMainLift }) => {
  return (
    <div className="routine-card" style={{ padding: '1rem' }}>
      <div className="routine-header">
        <div>
          <div className="routine-title" style={{ fontSize: '1.1rem' }}>
            {exercise.exercise_name}
            {isMainLift && (
              <span className="main-lift-tag" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                Main Lift
              </span>
            )}
          </div>
          {exercise.notes && (
            <div className="routine-description" style={{ fontSize: '0.8rem' }}>
              {exercise.notes}
            </div>
          )}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Order: {exercise.order}
        </div>
      </div>

      <div className="routine-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
        <div className="stat-item">
          <div className="stat-label">Sets</div>
          <div className="stat-value">{exercise.sets}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Reps</div>
          <div className="stat-value">{exercise.reps}</div>
        </div>
        {exercise.weight_percentage && (
          <div className="stat-item">
            <div className="stat-label">Weight %</div>
            <div className="stat-value">{exercise.weight_percentage}%</div>
          </div>
        )}
        {exercise.rest_time && (
          <div className="stat-item">
            <div className="stat-label">Rest</div>
            <div className="stat-value">{exercise.rest_time}s</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add Exercise Modal Component
interface AddExerciseModalProps {
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
  nextOrder: number;
  mainLifts: string[];
}

const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  onClose,
  onSubmit,
  isLoading,
  nextOrder,
  mainLifts,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Exercise</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="exercise_name">Exercise Name</label>
              <input
                type="text"
                id="exercise_name"
                name="exercise_name"
                className="form-input"
                required
                placeholder="e.g., Pull-ups, Dips, Muscle-ups"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="order">Order</label>
              <input
                type="number"
                id="order"
                name="order"
                className="form-input"
                required
                min="1"
                defaultValue={nextOrder}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sets">Sets</label>
              <input
                type="number"
                id="sets"
                name="sets"
                className="form-input"
                required
                min="1"
                placeholder="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reps">Reps</label>
              <input
                type="text"
                id="reps"
                name="reps"
                className="form-input"
                required
                placeholder="e.g., 5-8, 10, 3x5"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="weight_percentage">Weight Percentage (optional)</label>
              <input
                type="number"
                id="weight_percentage"
                name="weight_percentage"
                className="form-input"
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g., 80"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rest_time">Rest Time (seconds, optional)</label>
              <input
                type="number"
                id="rest_time"
                name="rest_time"
                className="form-input"
                min="0"
                placeholder="e.g., 120"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">Notes (optional)</label>
              <textarea
                id="notes"
                name="notes"
                className="form-input form-textarea"
                placeholder="Any additional notes about this exercise"
              />
            </div>

            <div className="form-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="is_main_lift"
                  name="is_main_lift"
                  className="checkbox-input"
                />
                <label htmlFor="is_main_lift" className="checkbox-label">
                  This is a main lift
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Exercise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoutineDetailPage; 