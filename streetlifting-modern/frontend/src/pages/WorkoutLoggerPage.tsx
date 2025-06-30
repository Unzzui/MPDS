import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import BlockIntegration from '../components/BlockIntegration';
import '../styles/WorkoutLogger.css';

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  isExpanded: boolean;
  notes?: string;
  category?: string;
}

interface Set {
  id: string;
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
  rest?: number;
  notes?: string;
}

// Terminal-style icons
const PlusIcon = () => (
  <svg className="terminal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const TrashIcon = () => (
  <svg className="terminal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="terminal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

const ChevronUpIcon = () => (
  <svg className="terminal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 15l-6-6-6 6"/>
  </svg>
);

const CopyIcon = () => (
  <svg className="terminal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

const TimerIcon = () => (
  <svg className="terminal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
  </svg>
);

const SaveIcon = () => (
  <svg className="terminal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17,21 17,13 7,13 7,21"/>
    <polyline points="7,3 7,8 15,8"/>
  </svg>
);

const FireIcon = () => (
  <svg className="terminal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const TargetIcon = () => (
  <svg className="terminal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const WorkoutLoggerPage: React.FC = () => {
  const { workoutType } = useParams<{ workoutType: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutName, setWorkoutName] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [startTime] = useState(Date.now());
  const [restTimer, setRestTimer] = useState<{ setId: string; startTime: number; targetRest: number; remaining: number } | null>(null);
  const [currentExercise, setCurrentExercise] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showExerciseCategories, setShowExerciseCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [workoutIntensity, setWorkoutIntensity] = useState<'light' | 'moderate' | 'intense'>('moderate');
  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});

  // Timer for workout duration
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Rest timer countdown
  useEffect(() => {
    if (restTimer) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - restTimer.startTime) / 1000);
        const remaining = Math.max(0, restTimer.targetRest - elapsed);
        
        if (remaining <= 0) {
          setRestTimer(null);
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
          audio.play().catch(() => {});
        } else {
          setRestTimer(prev => prev ? { ...prev, remaining } : null);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [restTimer]);

  // Auto-save draft to localStorage
  useEffect(() => {
    const draftData = {
      workoutName,
      workoutDate,
      notes,
      exercises: exercises.filter(ex => ex.name || ex.sets.length > 0),
      duration,
      lastUpdated: Date.now()
    };
    localStorage.setItem('workoutDraft', JSON.stringify(draftData));
  }, [workoutName, workoutDate, notes, exercises, duration]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('workoutDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        // Only load draft if it's recent and we're not coming from a specific workout type
        if (Date.now() - draft.lastUpdated < 24 * 60 * 60 * 1000 && !workoutType) {
          setWorkoutName(draft.workoutName || '');
          setWorkoutDate(draft.workoutDate || new Date().toISOString().split('T')[0]);
          setNotes(draft.notes || '');
          if (draft.exercises && draft.exercises.length > 0) {
            setExercises(draft.exercises);
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [workoutType]);

  // Load predefined exercises based on workout type
  useEffect(() => {
    if (workoutType) {
      const predefinedExercises = getPredefinedExercises(workoutType);
      if (predefinedExercises.length > 0) {
        setExercises(predefinedExercises);
        setWorkoutName(`${workoutType.toUpperCase()} WORKOUT`);
        // Clear any existing draft when loading predefined exercises
        localStorage.removeItem('workoutDraft');
      }
    }
  }, [workoutType]);

  const getPredefinedExercises = (type: string): Exercise[] => {
    const baseExercises = {
      push: [
        {
          id: '1',
          name: 'Push Up',
          sets: [
            { id: '1-1', weight: 0, reps: 10, rpe: 7, completed: false },
            { id: '1-2', weight: 0, reps: 10, rpe: 7, completed: false },
            { id: '1-3', weight: 0, reps: 10, rpe: 7, completed: false }
          ],
          isExpanded: true,
          category: 'PUSH'
        },
        {
          id: '2',
          name: 'Dips',
          sets: [
            { id: '2-1', weight: 0, reps: 8, rpe: 7, completed: false },
            { id: '2-2', weight: 0, reps: 8, rpe: 7, completed: false },
            { id: '2-3', weight: 0, reps: 8, rpe: 7, completed: false }
          ],
          isExpanded: true,
          category: 'PUSH'
        },
        {
          id: '3',
          name: 'Overhead Press',
          sets: [
            { id: '3-1', weight: 0, reps: 6, rpe: 7, completed: false },
            { id: '3-2', weight: 0, reps: 6, rpe: 7, completed: false },
            { id: '3-3', weight: 0, reps: 6, rpe: 7, completed: false }
          ],
          isExpanded: true,
          category: 'PUSH'
        }
      ],
      pull: [
        {
          id: '1',
          name: 'Pull Up',
          sets: [
            { id: '1-1', weight: 0, reps: 8, rpe: 7, completed: false },
            { id: '1-2', weight: 0, reps: 8, rpe: 7, completed: false },
            { id: '1-3', weight: 0, reps: 8, rpe: 7, completed: false }
          ],
          isExpanded: true,
          category: 'PULL'
        },
        {
          id: '2',
          name: 'Muscle Up',
          sets: [
            { id: '2-1', weight: 0, reps: 3, rpe: 8, completed: false },
            { id: '2-2', weight: 0, reps: 3, rpe: 8, completed: false },
            { id: '2-3', weight: 0, reps: 3, rpe: 8, completed: false }
          ],
          isExpanded: true,
          category: 'PULL'
        },
        {
          id: '3',
          name: 'Rows',
          sets: [
            { id: '3-1', weight: 0, reps: 10, rpe: 7, completed: false },
            { id: '3-2', weight: 0, reps: 10, rpe: 7, completed: false },
            { id: '3-3', weight: 0, reps: 10, rpe: 7, completed: false }
          ],
          isExpanded: true,
          category: 'PULL'
        }
      ],
      legs: [
        {
          id: '1',
          name: 'Squat',
          sets: [
            { id: '1-1', weight: 0, reps: 8, rpe: 7, completed: false },
            { id: '1-2', weight: 0, reps: 8, rpe: 7, completed: false },
            { id: '1-3', weight: 0, reps: 8, rpe: 7, completed: false }
          ],
          isExpanded: true,
          category: 'LEGS'
        },
        {
          id: '2',
          name: 'Pistol Squat',
          sets: [
            { id: '2-1', weight: 0, reps: 5, rpe: 8, completed: false },
            { id: '2-2', weight: 0, reps: 5, rpe: 8, completed: false },
            { id: '2-3', weight: 0, reps: 5, rpe: 8, completed: false }
          ],
          isExpanded: true,
          category: 'LEGS'
        },
        {
          id: '3',
          name: 'Deadlift',
          sets: [
            { id: '3-1', weight: 0, reps: 6, rpe: 7, completed: false },
            { id: '3-2', weight: 0, reps: 6, rpe: 7, completed: false },
            { id: '3-3', weight: 0, reps: 6, rpe: 7, completed: false }
          ],
          isExpanded: true,
          category: 'LEGS'
        }
      ]
    };

    return baseExercises[type.toLowerCase() as keyof typeof baseExercises] || [];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const exerciseCategories = {
    'PUSH': ['Push Up', 'Bench Press', 'Overhead Press', 'Dips', 'Handstand Push Up'],
    'PULL': ['Pull Up', 'Chin Up', 'Rows', 'Muscle Up'],
    'LEGS': ['Squat', 'Deadlift', 'Pistol Squat'],
    'CORE': ['L-Sit', 'Front Lever', 'Back Lever', 'Planche'],
    'SKILL': ['Human Flag', 'Muscle Up', 'Handstand']
  };

  const allExerciseOptions = Object.values(exerciseCategories).flat();

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: [],
      isExpanded: true,
    };
    setExercises([...exercises, newExercise]);
    setCurrentExercise(newExercise.id);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const toggleExercise = (exerciseId: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, isExpanded: !ex.isExpanded } : ex
    ));
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, name } : ex
    ));
  };

  const addSet = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const lastSet = exercise?.sets.slice(-1)[0];
    const newSet: Set = {
      id: Date.now().toString(),
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 0,
      rpe: 7,
      completed: false,
    };
    setExercises(prevExercises => prevExercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: [...ex.sets, newSet] }
        : ex
    ));
    
    setTimeout(() => {
      const weightInput = inputRefs.current[`${exerciseId}-${newSet.id}-weight`];
      if (weightInput) {
        weightInput.focus();
        weightInput.select();
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent, exerciseId: string, setId: string, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentKey = `${exerciseId}-${setId}-${field}`;
        focusNextInput(currentKey);
    }
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: ex.sets.filter(set => set.id !== setId) }
        : ex
    ));
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof Set, value: number | boolean) => {
    console.log(`Updating set ${setId} field ${field} with value:`, value);
    setExercises(prevExercises => prevExercises.map(ex => 
      ex.id === exerciseId 
        ? { 
            ...ex, 
            sets: ex.sets.map(set => 
              set.id === setId ? { ...set, [field]: value } : set
            )
          }
        : ex
    ));
  };

  const duplicateLastSet = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const lastSet = exercise?.sets.slice(-1)[0];
    if (lastSet) {
      const newSet: Set = {
        id: Date.now().toString(),
        weight: lastSet.weight,
        reps: lastSet.reps,
        rpe: lastSet.rpe,
        completed: false,
      };
      setExercises(exercises.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, sets: [...ex.sets, newSet] }
          : ex
      ));
    }
  };

  const startRestTimer = (setId: string, targetRest: number = 90) => {
    setRestTimer({
      setId,
      startTime: Date.now(),
      targetRest,
      remaining: targetRest
    });
  };

  const focusNextInput = (currentKey: string) => {
    const keys = Object.keys(inputRefs.current);
    const currentIndex = keys.indexOf(currentKey);
    const nextKey = keys[currentIndex + 1];
    
    if (nextKey && inputRefs.current[nextKey]) {
        inputRefs.current[nextKey].focus();
        inputRefs.current[nextKey].select();
    }
  };

  const handleInputFocus = () => {
    document.body.style.fontSize = '16px';
  };

  const handleInputBlur = () => {
    document.body.style.fontSize = '';
  };

  const handleSetCompletion = (exerciseId: string, setId: string, completed: boolean) => {
    updateSet(exerciseId, setId, 'completed', completed);
    if (completed) {
      const restTime = workoutIntensity === 'light' ? 60 : workoutIntensity === 'moderate' ? 90 : 120;
      startRestTimer(setId, restTime);
    }
  };

  const handleSave = async () => {
    if (exercises.length === 0 || exercises.every(ex => !ex.name)) {
      alert('Please add at least one exercise with a name');
      return;
    }

    setIsLoading(true);
    try {
      const apiExercises = exercises
        .filter(ex => ex.name)
        .flatMap(ex => 
          ex.sets.map((set, index) => ({
            name: ex.name,
            weight: set.weight,
            reps: set.reps,
            rpe: set.rpe,
            completed: set.completed,
            notes: set.notes,
            set_number: index + 1
          }))
        );

      const workoutData = {
        date: workoutDate,
        day_type: workoutType || 'general',
        notes: notes,
        exercises: apiExercises
      };

      await apiService.createWorkout(workoutData);
      localStorage.removeItem('workoutDraft');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Error saving workout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved progress will be lost.')) {
        localStorage.removeItem('workoutDraft');
      navigate('/dashboard');
    }
  };

  const quickAddExercise = (exerciseName: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      sets: [{
        id: Date.now().toString() + '-1',
        weight: 0,
        reps: 0,
        rpe: 7,
        completed: false,
      }],
      isExpanded: true,
    };
    setExercises([...exercises, newExercise]);
    setShowQuickAdd(false);
    setCurrentExercise(newExercise.id);
  };

  const getWorkoutIntensityColor = () => {
    switch (workoutIntensity) {
      case 'light': return '#4ade80';
      case 'moderate': return '#fbbf24';
      case 'intense': return '#f87171';
      default: return '#fbbf24';
    }
  };

  const completedSets = exercises.reduce((total, ex) => 
    total + ex.sets.filter(set => set.completed).length, 0
  );
  
  const totalSets = exercises.reduce((total, ex) => total + ex.sets.length, 0);
  const progressPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className="workout-logger">
      {/* Enhanced Header */}
      <div className="workout-header">
        <div className="workout-title">
          <h1>WORKOUT LOGGER</h1>
          <div className="workout-type">{workoutType?.toUpperCase() || 'GENERAL'}</div>
        </div>
        
        <div className="workout-stats">
          <div className="workout-timer">
            <TimerIcon />
            <span>{formatTime(duration)}</span>
            </div>
          
          <div className="workout-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="progress-text">{completedSets}/{totalSets} SETS</span>
          </div>
        </div>
      </div>

      {/* Rest Timer */}
      {restTimer && (
        <div className="rest-timer">
          <div className="rest-timer-content">
            <TimerIcon />
            <span className="rest-time">{formatTime(restTimer.remaining)}</span>
            <span className="rest-label">REST</span>
          </div>
        </div>
      )}

      {/* Workout Intensity Selector */}
      <div className="intensity-section">
        <label>WORKOUT INTENSITY</label>
        <div className="intensity-selector">
          {(['light', 'moderate', 'intense'] as const).map(intensity => (
            <button
              key={intensity}
              className={`intensity-btn ${workoutIntensity === intensity ? 'active' : ''}`}
              onClick={() => setWorkoutIntensity(intensity)}
              style={{
                borderColor: workoutIntensity === intensity ? getWorkoutIntensityColor() : 'var(--text-secondary)',
                color: workoutIntensity === intensity ? getWorkoutIntensityColor() : 'var(--text-secondary)'
              }}
            >
              <FireIcon />
              {intensity.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Quick Add Section */}
      <div className="quick-add-section">
        <button 
          className="quick-add-btn"
          onClick={() => setShowQuickAdd(!showQuickAdd)}
        >
          <PlusIcon />
          QUICK ADD EXERCISE
        </button>
        
        {showQuickAdd && (
          <div className="quick-add-container">
            <div className="category-tabs">
              <button
                className={`category-tab ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                ALL
              </button>
              {Object.keys(exerciseCategories).map(category => (
                <button
                  key={category}
                  className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="quick-add-grid">
              {(selectedCategory ? exerciseCategories[selectedCategory as keyof typeof exerciseCategories] : allExerciseOptions).map(exercise => (
                <button
                  key={exercise}
                  className="quick-add-option"
                  onClick={() => quickAddExercise(exercise)}
                >
                  {exercise}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Workout Info */}
      <div className="workout-info">
        <div className="info-group">
          <label>WORKOUT NAME</label>
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Enter workout name"
            className="terminal-input"
        />
      </div>

        <div className="info-group">
          <label>DATE</label>
          <input
            type="date"
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
            className="terminal-input"
          />
        </div>
      </div>

      {/* Enhanced Exercises Section */}
      <div className="exercises-section">
        {exercises.length === 0 ? (
          <div className="empty-state">
            <TargetIcon />
            <h3>READY TO START YOUR WORKOUT?</h3>
            <p>Add your first exercise to begin tracking your training session</p>
            <button className="start-btn" onClick={addExercise}>
                <PlusIcon />
              ADD FIRST EXERCISE
              </button>
          </div>
        ) : (
          exercises.map((exercise, index) => (
            <div key={exercise.id} className={`exercise-card ${exercise.isExpanded ? 'expanded' : ''}`}>
              <div className="exercise-header" onClick={() => toggleExercise(exercise.id)}>
                  <div className="exercise-info">
                  <span className="exercise-number">#{index + 1}</span>
                  <input
                    type="text"
                      value={exercise.name}
                      onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                    placeholder="Exercise name"
                    className="exercise-name-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div className="exercise-actions">
                  <div className="exercise-stats">
                    <span className="set-count">{exercise.sets.length} SETS</span>
                    <span className="completed-count">
                      {exercise.sets.filter(s => s.completed).length} DONE
                    </span>
                  </div>
                      {exercise.isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    <button
                      className="remove-exercise-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExercise(exercise.id);
                    }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

              {exercise.isExpanded && (
                <div className="exercise-content">
                  {/* Block Integration - Weight Suggestions */}
                  <BlockIntegration
                    exerciseName={exercise.name}
                    currentWeight={exercise.sets[0]?.weight || 0}
                    currentReps={exercise.sets[0]?.reps || 0}
                    rpe={exercise.sets[0]?.rpe || 7}
                    onWeightSuggestion={(suggestedWeight) => {
                      // Apply suggested weight to all sets of this exercise
                      setExercises(prevExercises => prevExercises.map(ex => 
                        ex.id === exercise.id 
                          ? { 
                              ...ex, 
                              sets: ex.sets.map(set => ({ ...set, weight: suggestedWeight }))
                            }
                          : ex
                      ));
                    }}
                  />
                  
                  {/* Sets */}
                  <div className="sets-container">
                    <div className="sets-header">
                      <span>SET</span>
                      <span>WEIGHT</span>
                      <span>REPS</span>
                      <span>RPE</span>
                      <span>DONE</span>
                      <span>ACTIONS</span>
                                </div>
                                
                    {exercise.sets.map((set, setIndex) => (
                      <div key={set.id} className={`set-row ${set.completed ? 'completed' : ''}`}>
                        <span className="set-number">{setIndex + 1}</span>
                        
                                    <input
                                      ref={(el) => {
                            if (el) inputRefs.current[`${exercise.id}-${set.id}-weight`] = el;
                                      }}
                                      type="number"
                          value={set.weight || ''}
                                      onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                          onKeyDown={(e) => handleKeyDown(e, exercise.id, set.id, 'weight')}
                                      onFocus={handleInputFocus}
                                      onBlur={handleInputBlur}
                          className="set-input weight-input"
                                      placeholder="0"
                                    />
                                  
                                    <input
                                      ref={(el) => {
                            if (el) inputRefs.current[`${exercise.id}-${set.id}-reps`] = el;
                                      }}
                                      type="number"
                          value={set.reps || ''}
                                      onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                          onKeyDown={(e) => handleKeyDown(e, exercise.id, set.id, 'reps')}
                                      onFocus={handleInputFocus}
                                      onBlur={handleInputBlur}
                          className="set-input reps-input"
                                      placeholder="0"
                                    />
                                  
                                    <input
                                      ref={(el) => {
                            if (el) inputRefs.current[`${exercise.id}-${set.id}-rpe`] = el;
                                      }}
                                      type="number"
                          min="1"
                          max="10"
                          value={set.rpe || 7}
                                      onChange={(e) => updateSet(exercise.id, set.id, 'rpe', parseInt(e.target.value) || 7)}
                          onKeyDown={(e) => handleKeyDown(e, exercise.id, set.id, 'rpe')}
                                      onFocus={handleInputFocus}
                                      onBlur={handleInputBlur}
                          className="set-input rpe-input"
                                      placeholder="7"
                                    />
                                
                                  <button
                          className={`set-complete-btn ${set.completed ? 'completed' : ''}`}
                                    onClick={() => handleSetCompletion(exercise.id, set.id, !set.completed)}
                                  >
                          {set.completed ? '✓' : '○'}
                                  </button>
                                  
                        <div className="set-actions">
                                  <button
                            className="action-btn"
                                    onClick={() => removeSet(exercise.id, set.id)}
                            title="Remove set"
                                  >
                            <TrashIcon />
                                  </button>
                                </div>
                              </div>
                    ))}
                        </div>
                        
                  {/* Exercise Actions */}
                  <div className="exercise-actions-bar">
                          <button
                      className="action-btn primary"
                            onClick={() => addSet(exercise.id)}
                          >
                            <PlusIcon />
                      ADD SET
                          </button>
                          
                            <button
                      className="action-btn secondary"
                              onClick={() => duplicateLastSet(exercise.id)}
                      disabled={exercise.sets.length === 0}
                            >
                              <CopyIcon />
                      DUPLICATE
                            </button>
                        </div>
                  </div>
                )}
              </div>
          ))
        )}
      </div>

      {/* Add Exercise Button */}
      <div className="add-exercise-section">
        <button className="add-exercise-btn" onClick={addExercise}>
          <PlusIcon />
          ADD EXERCISE
        </button>
      </div>

      {/* Notes */}
        <div className="notes-section">
        <label>NOTES</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          placeholder="Add workout notes..."
          className="terminal-textarea"
            rows={3}
          />
        </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-btn secondary" onClick={handleCancel}>
          CANCEL
            </button>

          <button
          className="action-btn primary save-btn" 
            onClick={handleSave}
            disabled={isLoading}
          >
          <SaveIcon />
          {isLoading ? 'SAVING...' : 'SAVE WORKOUT'}
          </button>
        </div>
    </div>
  );
};

export default WorkoutLoggerPage; 