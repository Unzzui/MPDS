import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/WorkoutLogger.css';

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface Set {
  id: string;
  weight: number;
  reps: number;
  rpe: number;
}

const WorkoutLoggerPage: React.FC = () => {
  const { workoutType } = useParams<{ workoutType: string }>();
  const navigate = useNavigate();
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const exerciseOptions = [
    'Pull-ups',
    'Weighted Dips',
    'Squats',
    'Muscle-ups',
    'Handstand Push-ups',
    'Pistol Squats',
    'Front Lever',
    'Back Lever',
    'Planche',
    'L-Sit',
  ];

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: [],
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, name } : ex
    ));
  };

  const addSet = (exerciseId: string) => {
    const newSet: Set = {
      id: Date.now().toString(),
      weight: 0,
      reps: 0,
      rpe: 0,
    };
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: [...ex.sets, newSet] }
        : ex
    ));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: ex.sets.filter(set => set.id !== setId) }
        : ex
    ));
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof Set, value: number) => {
    setExercises(exercises.map(ex => 
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

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Here you would save the workout to the backend
      console.log('Saving workout:', {
        date: workoutDate,
        type: workoutType,
        notes,
        exercises,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/workout-history');
    } catch (error) {
      console.error('Error saving workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="workout-logger">
      <div className="workout-header">
        <h1>Registrar Entrenamiento</h1>
        <p>Tipo: {workoutType || 'General'}</p>
      </div>

      <form className="workout-form" onSubmit={(e) => e.preventDefault()}>
        {/* Workout Information */}
        <div className="form-section">
          <h2>Información del Entrenamiento</h2>
          
          <div className="form-group">
            <label htmlFor="workout-date" className="form-label">
              Fecha
            </label>
            <input
              type="date"
              id="workout-date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notas
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-textarea"
              placeholder="Anota cómo te sentiste, dificultades, logros..."
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="form-section">
          <h2>Ejercicios</h2>
          
          <div className="exercise-list">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="exercise-item">
                <div className="exercise-header">
                  <select
                    value={exercise.name}
                    onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                    className="form-select"
                  >
                    <option value="">Seleccionar ejercicio</option>
                    {exerciseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => removeExercise(exercise.id)}
                    className="remove-exercise-btn"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="5" y1="5" x2="15" y2="15" stroke="#ff4444" strokeWidth="2" />
                      <line x1="15" y1="5" x2="5" y2="15" stroke="#ff4444" strokeWidth="2" />
                    </svg>
                  </button>
                </div>

                {exercise.name && (
                  <div className="sets-list">
                    <div className="set-item">
                      <div className="set-label">Set</div>
                      <div className="set-label">Peso (kg)</div>
                      <div className="set-label">Reps</div>
                      <div className="set-label">RPE</div>
                      <div></div>
                    </div>
                    
                    {exercise.sets.map((set, index) => (
                      <div key={set.id} className="set-item">
                        <div className="set-label">{index + 1}</div>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => updateSet(exercise.id, set.id, 'weight', Number(e.target.value))}
                          className="set-input"
                          placeholder="0"
                        />
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(exercise.id, set.id, 'reps', Number(e.target.value))}
                          className="set-input"
                          placeholder="0"
                        />
                        <input
                          type="number"
                          value={set.rpe}
                          onChange={(e) => updateSet(exercise.id, set.id, 'rpe', Number(e.target.value))}
                          className="set-input"
                          placeholder="0"
                          min="1"
                          max="10"
                        />
                        <button
                          type="button"
                          onClick={() => removeSet(exercise.id, set.id)}
                          className="remove-set-btn"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="5" y1="5" x2="15" y2="15" stroke="#ff4444" strokeWidth="2" />
                            <line x1="15" y1="5" x2="5" y2="15" stroke="#ff4444" strokeWidth="2" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => addSet(exercise.id)}
                      className="add-set-btn"
                    >
                      + Agregar Set
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addExercise}
            className="add-exercise-btn"
          >
            + Agregar Ejercicio
          </button>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-btn"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || exercises.length === 0}
            className="save-btn"
          >
            {isLoading ? 'Guardando...' : 'Guardar Entrenamiento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkoutLoggerPage; 