import React, { useState, useRef, useEffect } from 'react';
import '../styles/ExerciseSelector.css';

interface ExerciseSelectorProps {
  selectedExercises: string[];
  onExercisesChange: (exercises: string[]) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  selectedExercises,
  onExercisesChange,
  label,
  placeholder = "Selecciona ejercicios",
  required = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Lista de ejercicios predefinidos para evitar errores
  const availableExercises = [
    'Pull-ups',
    'Dips',
    'Muscle-ups',
    'Push-ups',
    'Squats',
    'Deadlift',
    'Bench Press',
    'Overhead Press',
    'Rows',
    'Lunges',
    'Burpees',
    'Handstand Push-ups',
    'L-Sit',
    'Planche',
    'Front Lever',
    'Back Lever',
    'Human Flag',
    'Handstand',
    'Pistol Squats',
    'Box Jumps',
    'Wall Balls',
    'Thrusters',
    'Snatch',
    'Clean & Jerk',
    'Kettlebell Swings',
    'Turkish Get-ups',
    'Farmer\'s Walk',
    'Sandbag Carries',
    'Rope Climbs',
    'Ring Dips',
    'Ring Rows',
    'Ring Support',
    'Ring Muscle-ups',
    'Bar Muscle-ups',
    'Strict Pull-ups',
    'Kipping Pull-ups',
    'Butterfly Pull-ups',
    'Strict Dips',
    'Kipping Dips',
    'Ring Dips',
    'Pike Push-ups',
    'Diamond Push-ups',
    'Wide Push-ups',
    'Decline Push-ups',
    'Incline Push-ups',
    'Pistol Squats',
    'Box Squats',
    'Front Squats',
    'Back Squats',
    'Overhead Squats',
    'Goblet Squats',
    'Sumo Deadlifts',
    'Romanian Deadlifts',
    'Single-leg Deadlifts',
    'Good Mornings',
    'Hip Thrusts',
    'Glute Bridges',
    'Nordic Curls',
    'Reverse Nordics',
    'Calf Raises',
    'Toes to Bar',
    'Knee to Elbow',
    'V-ups',
    'Sit-ups',
    'Crunches',
    'Plank',
    'Side Plank',
    'Hollow Hold',
    'Arch Hold',
    'Superman Hold',
    'Wall Sit',
    'Mountain Climbers',
    'Jumping Jacks',
    'High Knees',
    'Butt Kicks',
    'Sprint',
    'Shuttle Run',
    'Agility Ladder',
    'Box Jumps',
    'Broad Jumps',
    'Vertical Jumps',
    'Medicine Ball Throws',
    'Wall Ball Shots',
    'Rope Climbs',
    'Monkey Bars',
    'Pole Climbing',
    'Rope Swings',
    'Tire Flips',
    'Sledgehammer Swings',
    'Battle Ropes',
    'Sled Push',
    'Sled Pull',
    'Yoke Walk',
    'Atlas Stones',
    'Log Press',
    'Axle Press',
    'Circus Dumbbell',
    'Sandbag Toss',
    'Stone to Shoulder',
    'Car Deadlift',
    'Truck Pull',
    'Arm-over-Arm Pull',
    'Fingal\'s Fingers',
    'Hercules Hold',
    'Atlas Stones',
    'Conan\'s Wheel',
    'Natural Stones',
    'Husafell Stone',
    'Dinnie Stones',
    'Inch Dumbbell',
    'Apollon\'s Axle',
    'Circus Dumbbell',
    'Natural Log Lift',
    'Tire Deadlift',
    'Car Deadlift',
    'Truck Pull',
    'Arm-over-Arm Pull',
    'Fingal\'s Fingers',
    'Hercules Hold',
    'Atlas Stones',
    'Conan\'s Wheel',
    'Natural Stones',
    'Husafell Stone',
    'Dinnie Stones',
    'Inch Dumbbell',
    'Apollon\'s Axle',
    'Circus Dumbbell',
    'Natural Log Lift',
    'Tire Deadlift'
  ];

  const filteredExercises = availableExercises.filter(exercise =>
    exercise.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedExercises.includes(exercise)
  );

  const handleAddExercise = (exercise: string) => {
    if (!selectedExercises.includes(exercise)) {
      onExercisesChange([...selectedExercises, exercise]);
    }
    setInputValue('');
    setShowDropdown(false);
  };

  const handleRemoveExercise = (exerciseToRemove: string) => {
    onExercisesChange(selectedExercises.filter(exercise => exercise !== exerciseToRemove));
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setShowDropdown(value.length > 0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (filteredExercises.length > 0) {
        handleAddExercise(filteredExercises[0]);
      }
    }
  };

  return (
    <div className="exercise-selector" ref={containerRef}>
      <label className="form-label">{label}</label>
      
      {/* Input para buscar ejercicios */}
      <div className="exercise-input-container">
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setShowDropdown(inputValue.length > 0)}
          required={required && selectedExercises.length === 0}
        />
        
        {/* Dropdown de ejercicios */}
        {showDropdown && (
          <div className="exercise-dropdown">
            {filteredExercises.slice(0, 10).map((exercise) => (
              <div
                key={exercise}
                className="exercise-option"
                onClick={() => handleAddExercise(exercise)}
              >
                {exercise}
              </div>
            ))}
            {filteredExercises.length === 0 && inputValue && (
              <div className="exercise-option no-results">
                No se encontraron ejercicios
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ejercicios seleccionados */}
      {selectedExercises.length > 0 && (
        <div className="selected-exercises">
          <div className="selected-exercises-label">
            Ejercicios seleccionados ({selectedExercises.length}):
          </div>
          <div className="exercise-tags">
            {selectedExercises.map((exercise) => (
              <div key={exercise} className="exercise-tag">
                <span>{exercise}</span>
                <button
                  type="button"
                  className="remove-exercise"
                  onClick={() => handleRemoveExercise(exercise)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inputs ocultos para el formulario */}
      <input
        type="hidden"
        name="exercises"
        value={selectedExercises.join(',')}
      />
    </div>
  );
};

export default ExerciseSelector; 