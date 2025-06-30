import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { useRpeInference } from '../hooks/useRpeInference';
import FailedRepsModal from '../components/FailedRepsModal';
import type {
  WorkoutSession,
  WorkoutSessionExercise,
  WorkoutSessionSet,
  WorkoutProgress,
  ContextRating,
  ExerciseSubstitution,
} from '../types';
import '../styles/IntelligentWorkoutLogger.css';

// Terminal-style SVG Icons
const PlayIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const MinusIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const IntelligentWorkoutLoggerPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { routineId } = useParams<{ routineId: string }>();
  
  const { timer, startTimer, stopTimer, getFormattedTime, isRestTimeComplete } = useWorkoutTimer();
  const { inferRpe, getRpeColor, getRpeLabel } = useRpeInference();

  // Session state
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [progress, setProgress] = useState<WorkoutProgress>({
    current_exercise_index: 0,
    current_set_index: 0,
    completed_exercises: 0,
    total_exercises: 0,
    completed_sets: 0,
    total_sets: 0,
    session_duration: 0,
  });

  // UI state
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  const [showFailedRepsModal, setShowFailedRepsModal] = useState(false);
  const [substitutionExercise, setSubstitutionExercise] = useState('');
  const [contextQuestion, setContextQuestion] = useState<ContextRating | null>(null);

  // Mock routine data - in real app this would come from API
  const mockRoutine = {
    id: routineId || '1',
    name: 'Street Lifting - Pull Focus',
    exercises: [
      {
        id: '1',
        exercise_name: 'Pull-ups',
        order: 1,
        is_main_lift: true,
        target_sets: 4,
        target_reps: '3',
        target_weight: 85,
        rest_time: 180,
      },
      {
        id: '2',
        exercise_name: 'Gironda Rows',
        order: 2,
        is_main_lift: false,
        target_sets: 3,
        target_reps: '8',
        target_weight: 60,
        rest_time: 120,
      },
      {
        id: '3',
        exercise_name: 'Z-bar Biceps',
        order: 3,
        is_main_lift: false,
        target_sets: 3,
        target_reps: '12',
        target_weight: 25,
        rest_time: 90,
      },
    ],
  };

  // Initialize session
  useEffect(() => {
    if (!session) {
      const newSession: WorkoutSession = {
        id: Date.now().toString(),
        user_id: user?.id || 0,
        routine_id: routineId ? parseInt(routineId) : undefined,
        date: new Date().toISOString().split('T')[0],
        start_time: new Date().toISOString(),
        status: 'not_started',
        exercises: mockRoutine.exercises.map((ex, index) => ({
          id: ex.id,
          session_id: Date.now().toString(),
          exercise_name: ex.exercise_name,
          order: ex.order,
          is_main_lift: ex.is_main_lift,
          target_sets: ex.target_sets,
          target_reps: ex.target_reps,
          target_weight: ex.target_weight,
          rest_time: ex.rest_time,
          status: 'pending',
          sets: Array.from({ length: ex.target_sets }, (_, setIndex) => ({
            id: `${ex.id}-set-${setIndex + 1}`,
            exercise_id: ex.id,
            set_number: setIndex + 1,
            target_weight: ex.target_weight || 0,
            target_reps: parseInt(ex.target_reps),
            status: 'pending',
            created_at: new Date().toISOString(),
          })),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setSession(newSession);
      setProgress({
        current_exercise_index: 0,
        current_set_index: 0,
        completed_exercises: 0,
        total_exercises: newSession.exercises.length,
        completed_sets: 0,
        total_sets: newSession.exercises.reduce((acc, ex) => acc + ex.target_sets, 0),
        session_duration: 0,
      });
    }
  }, [session, user, routineId]);

  const startWorkout = useCallback(() => {
    if (!session) return;

    setSession(prev => prev ? {
      ...prev,
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    } : null);

    // Start timer for first exercise
    const firstExercise = session.exercises[0];
    if (firstExercise) {
      startTimer(firstExercise.rest_time || 120, firstExercise.exercise_name, 1);
    }
  }, [session, startTimer]);

  const completeWorkout = useCallback(() => {
    if (!session) return;

    setSession(prev => prev ? {
      ...prev,
      status: 'completed',
      end_time: new Date().toISOString(),
      total_duration: Date.now() - new Date(prev.start_time).getTime(),
      updated_at: new Date().toISOString(),
    } : null);

    setShowContextModal(true);
  }, [session]);

  const completeSet = useCallback((exerciseId: string, setId: string, actualReps: number, failureReps: number = 0) => {
    if (!session) return;

    const rpeInference = inferRpe(actualReps, parseInt(mockRoutine.exercises.find(ex => ex.id === exerciseId)?.target_reps || '0'), failureReps);
    const restDuration = stopTimer();

    setSession(prev => {
      if (!prev) return null;

      const updatedExercises = prev.exercises.map(ex => {
        if (ex.id === exerciseId) {
          const updatedSets = ex.sets.map(set => {
            if (set.id === setId) {
              return {
                ...set,
                actual_reps: actualReps,
                rpe: rpeInference.inferred_rpe,
                inferred_rpe: rpeInference.inferred_rpe,
                status: 'completed' as const,
                end_time: new Date().toISOString(),
                rest_duration: restDuration,
                failure_reps: failureReps,
              };
            }
            return set;
          });

          const completedSets = updatedSets.filter(set => set.status === 'completed').length;
          const newStatus = completedSets === ex.target_sets ? 'completed' as const : 'in_progress' as const;

          return {
            ...ex,
            sets: updatedSets,
            status: newStatus,
            updated_at: new Date().toISOString(),
          };
        }
        return ex;
      });

      return {
        ...prev,
        exercises: updatedExercises,
        updated_at: new Date().toISOString(),
      };
    });

    // Update progress
    setProgress(prev => ({
      ...prev,
      completed_sets: prev.completed_sets + 1,
    }));

    // Start rest timer for next set or move to next exercise
    const currentExercise = session.exercises[currentExerciseIndex];
    const nextSetIndex = currentSetIndex + 1;

    if (nextSetIndex < currentExercise.target_sets) {
      setCurrentSetIndex(nextSetIndex);
      startTimer(currentExercise.rest_time || 120, currentExercise.exercise_name, nextSetIndex + 1);
    } else {
      // Exercise completed, move to next
      const nextExerciseIndex = currentExerciseIndex + 1;
      if (nextExerciseIndex < session.exercises.length) {
        setCurrentExerciseIndex(nextExerciseIndex);
        setCurrentSetIndex(0);
        setProgress(prev => ({
          ...prev,
          completed_exercises: prev.completed_exercises + 1,
          current_exercise_index: nextExerciseIndex,
          current_set_index: 0,
        }));

        const nextExercise = session.exercises[nextExerciseIndex];
        startTimer(nextExercise.rest_time || 120, nextExercise.exercise_name, 1);
      } else {
        // Workout completed
        completeWorkout();
      }
    }
  }, [session, currentExerciseIndex, currentSetIndex, startTimer, stopTimer, inferRpe, completeWorkout]);

  const handleSubstitution = useCallback((originalExercise: string, newExercise: string) => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return null;

      const updatedExercises = prev.exercises.map(ex => {
        if (ex.exercise_name === originalExercise) {
          return {
            ...ex,
            exercise_name: newExercise,
            original_exercise_name: originalExercise,
            substitution_reason: 'User preference',
            updated_at: new Date().toISOString(),
          };
        }
        return ex;
      });

      return {
        ...prev,
        exercises: updatedExercises,
        updated_at: new Date().toISOString(),
      };
    });

    setShowSubstitutionModal(false);
    setSubstitutionExercise('');
  }, [session]);

  const handleContextRating = useCallback((rating: string) => {
    if (!session) return;

    const contextRating: ContextRating = {
      session_id: session.id,
      question_type: 'energy',
      rating,
      timestamp: new Date().toISOString(),
    };

    setSession(prev => prev ? {
      ...prev,
      context_rating: contextRating,
      updated_at: new Date().toISOString(),
    } : null);

    setShowContextModal(false);
    navigate('/workout-history');
  }, [session, navigate]);

  if (!session) {
    return (
      <div className="intelligent-logger">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading workout session...</p>
        </div>
      </div>
    );
  }

  const currentExercise = session.exercises[currentExerciseIndex];
  const currentSet = currentExercise?.sets[currentSetIndex];

  const handleFailedReps = useCallback((completedReps: number, failedReps: number) => {
    if (!session || !currentExercise || !currentSet) return;
    
    completeSet(currentExercise.id, currentSet.id, completedReps, failedReps);
  }, [session, currentExercise, currentSet, completeSet]);

  return (
    <div className="intelligent-logger">
      {/* Header */}
      <div className="logger-header">
        <h1 className="logger-title">STREET LIFTING SESSION</h1>
        <div className="session-info">
          <span className="session-date">{new Date(session.date).toLocaleDateString()}</span>
          <span className="session-duration">{getFormattedTime(progress.session_duration)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(progress.completed_sets / progress.total_sets) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {progress.completed_sets} / {progress.total_sets} SETS
        </div>
      </div>

      {/* Main Exercise Focus */}
      {session.status === 'not_started' ? (
        <div className="workout-start">
          <div className="focus-exercise">
            <h2 className="focus-title">TODAY'S FOCUS</h2>
            <div className="focus-details">
              <span className="exercise-name">{mockRoutine.exercises[0].exercise_name}</span>
              <span className="exercise-target">
                {mockRoutine.exercises[0].target_weight}kg - {mockRoutine.exercises[0].target_sets}x{mockRoutine.exercises[0].target_reps} reps
              </span>
            </div>
            <button className="start-workout-btn" onClick={startWorkout}>
              <PlayIcon />
              START WORKOUT
            </button>
          </div>

          <div className="accessory-preview">
            <h3 className="preview-title">THEN:</h3>
            <div className="accessory-list">
              {mockRoutine.exercises.slice(1).map((exercise, index) => (
                <span key={exercise.id} className="accessory-item">
                  {exercise.exercise_name}
                  {index < mockRoutine.exercises.length - 2 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="active-exercise">
          {/* Current Exercise */}
          <div className="exercise-header">
            <h2 className="exercise-name">{currentExercise.exercise_name}</h2>
            <div className="exercise-progress">
              Set {currentSetIndex + 1} / {currentExercise.target_sets}
            </div>
          </div>

          {/* Set Details */}
          <div className="set-details">
            <div className="target-info">
              <div className="target-weight">
                <span className="label">TARGET WEIGHT</span>
                <div className="weight-controls">
                  <button className="weight-btn">
                    <MinusIcon />
                  </button>
                  <span className="weight-value">{currentSet?.target_weight}kg</span>
                  <button className="weight-btn">
                    <PlusIcon />
                  </button>
                </div>
              </div>
              <div className="target-reps">
                <span className="label">TARGET REPS</span>
                <span className="reps-value">{currentSet?.target_reps}</span>
              </div>
            </div>

            {/* Rest Timer */}
            {timer.is_active && (
              <div className="rest-timer">
                <div className="timer-display">
                  <span className="timer-label">REST</span>
                  <span className="timer-value">{getFormattedTime(timer.current_time)}</span>
                </div>
                <div className="timer-progress">
                  <div 
                    className="timer-fill"
                    style={{ 
                      width: `${Math.min((timer.current_time / ((currentExercise.rest_time || 120) * 1000)) * 100, 100)}%`,
                      backgroundColor: isRestTimeComplete() ? 'var(--accent-primary)' : 'var(--text-secondary)'
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Set Actions */}
            <div className="set-actions">
              <button 
                className="complete-set-btn"
                onClick={() => completeSet(currentExercise.id, currentSet?.id || '', currentSet?.target_reps || 0)}
              >
                <CheckIcon />
                COMPLETE SET
              </button>
              <button 
                className="failed-reps-btn"
                onClick={() => setShowFailedRepsModal(true)}
              >
                <XIcon />
                FAILED REPS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise List */}
      <div className="exercise-list">
        <h3 className="list-title">WORKOUT PLAN</h3>
        {session.exercises.map((exercise, index) => (
          <div 
            key={exercise.id} 
            className={`exercise-item ${index === currentExerciseIndex ? 'active' : ''} ${exercise.status === 'completed' ? 'completed' : ''}`}
          >
            <div className="exercise-info">
              <span className="exercise-name">{exercise.exercise_name}</span>
              <span className="exercise-target">
                {exercise.target_weight}kg x {exercise.target_sets}x{exercise.target_reps}
              </span>
            </div>
            <div className="exercise-status">
              {exercise.status === 'completed' && <CheckIcon />}
              {exercise.status === 'in_progress' && <PlayIcon />}
            </div>
          </div>
        ))}
      </div>

      {/* Substitution Modal */}
      {showSubstitutionModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>EXERCISE SUBSTITUTION</h3>
            <p>Did you change to a different exercise?</p>
            <input
              type="text"
              placeholder="Enter exercise name"
              value={substitutionExercise}
              onChange={(e) => setSubstitutionExercise(e.target.value)}
              className="substitution-input"
            />
            <div className="modal-actions">
              <button onClick={() => setShowSubstitutionModal(false)}>CANCEL</button>
              <button onClick={() => handleSubstitution(currentExercise.exercise_name, substitutionExercise)}>
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Rating Modal */}
      {showContextModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>SESSION COMPLETE</h3>
            <p>How did you feel today?</p>
            <div className="context-options">
              <button onClick={() => handleContextRating('strong')}>STRONG</button>
              <button onClick={() => handleContextRating('normal')}>NORMAL</button>
              <button onClick={() => handleContextRating('tired')}>TIRED</button>
            </div>
          </div>
        </div>
      )}

      {/* Failed Reps Modal */}
      <FailedRepsModal
        isOpen={showFailedRepsModal}
        onClose={() => setShowFailedRepsModal(false)}
        onConfirm={handleFailedReps}
        targetReps={currentSet?.target_reps || 0}
        exerciseName={currentExercise?.exercise_name || ''}
        setNumber={currentSetIndex + 1}
      />
    </div>
  );
};

export default IntelligentWorkoutLoggerPage; 