import React, { useState } from 'react';
import { useBodyWeight } from '../contexts/BodyWeightContext';
import '../styles/UserSetupModal.css';

interface UserSetupData {
  bodyWeight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  maxReps: {
    muscle_ups: number;
    pull_ups: number;
    dips: number;
    squats: number;
  };
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  trainingGoals: string[];
  trainingFrequency: '2-3' | '3-4' | '4-5' | '5-6';
  preferredTrainingTime: 'morning' | 'afternoon' | 'evening';
  availableTrainingDays: string[];
  maxSessionDuration: number;
  hasInjuries: boolean;
  injuryDetails: string;
  medicalConditions: string;
  hasPullUpBar: boolean;
  hasDipBars: boolean;
  hasWeights: boolean;
  hasGymAccess: boolean;
  hasCompletedSetup: boolean;
}

interface UserSetupModalProps {
  isOpen: boolean;
  onComplete: (data: UserSetupData) => void;
}

const UserSetupModal: React.FC<UserSetupModalProps> = ({ isOpen, onComplete }) => {
  const { setBodyWeight } = useBodyWeight();
  const [currentStep, setCurrentStep] = useState(1);
  const [setupData, setSetupData] = useState<UserSetupData>({
    bodyWeight: 0,
    height: 0,
    age: 0,
    gender: 'male',
    maxReps: {
      muscle_ups: 0,
      pull_ups: 0,
      dips: 0,
      squats: 0
    },
    experienceLevel: 'beginner',
    trainingGoals: [],
    trainingFrequency: '3-4',
    preferredTrainingTime: 'afternoon',
    availableTrainingDays: ['monday', 'wednesday', 'friday'],
    maxSessionDuration: 60,
    hasInjuries: false,
    injuryDetails: '',
    medicalConditions: '',
    hasPullUpBar: true,
    hasDipBars: true,
    hasWeights: false,
    hasGymAccess: false,
    hasCompletedSetup: false
  });

  const experienceLevels = [
    { value: 'beginner', label: 'Principiante', description: 'Menos de 1 año entrenando' },
    { value: 'intermediate', label: 'Intermedio', description: '1-3 años entrenando' },
    { value: 'advanced', label: 'Avanzado', description: '3-5 años entrenando' },
    { value: 'expert', label: 'Experto', description: 'Más de 5 años entrenando' }
  ];

  const trainingGoals = [
    { value: 'strength', label: 'Fuerza', description: 'Aumentar fuerza máxima' },
    { value: 'muscle', label: 'Músculo', description: 'Ganar masa muscular' },
    { value: 'endurance', label: 'Resistencia', description: 'Mejorar resistencia' },
    { value: 'skill', label: 'Habilidad', description: 'Dominar movimientos avanzados' },
    { value: 'competition', label: 'Competencia', description: 'Preparar para competencias' }
  ];

  const frequencyOptions = [
    { value: '2-3', label: '2-3 veces por semana' },
    { value: '3-4', label: '3-4 veces por semana' },
    { value: '4-5', label: '4-5 veces por semana' },
    { value: '5-6', label: '5-6 veces por semana' }
  ];

  const timeOptions = [
    { value: 'morning', label: 'Mañana (6:00 - 12:00)' },
    { value: 'afternoon', label: 'Tarde (12:00 - 18:00)' },
    { value: 'evening', label: 'Noche (18:00 - 22:00)' }
  ];

  const dayOptions = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setSetupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMaxRepsChange = (exercise: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setSetupData(prev => ({
      ...prev,
      maxReps: {
        ...prev.maxReps,
        [exercise]: numValue
      }
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setSetupData(prev => ({
      ...prev,
      trainingGoals: prev.trainingGoals.includes(goal)
        ? prev.trainingGoals.filter(g => g !== goal)
        : [...prev.trainingGoals, goal]
    }));
  };

  const handleDayToggle = (day: string) => {
    setSetupData(prev => ({
      ...prev,
      availableTrainingDays: prev.availableTrainingDays.includes(day)
        ? prev.availableTrainingDays.filter(d => d !== day)
        : [...prev.availableTrainingDays, day]
    }));
  };

  const nextStep = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const finalData = {
      ...setupData,
      hasCompletedSetup: true
    };
    
    // Save body weight to context
    setBodyWeight(setupData.bodyWeight);
    
    onComplete(finalData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return setupData.bodyWeight > 0 && setupData.height > 0 && setupData.age > 0;
      case 2: return Object.values(setupData.maxReps).some(val => val > 0);
      case 3: return true; // Experience level is always set
      case 4: return setupData.trainingGoals.length > 0;
      case 5: return true; // Training frequency is always set
      case 6: return setupData.availableTrainingDays.length > 0;
      case 7: return true; // Equipment is optional
      case 8: return true; // Health info is optional
      default: return false;
    }
  };

  const renderStep1 = () => (
    <div className="setup-step">
      <h3>Información Personal</h3>
      <p>Necesitamos algunos datos básicos para personalizar tu experiencia.</p>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="body-weight">Peso Corporal (kg) *</label>
          <input
            id="body-weight"
            type="number"
            min="30"
            max="300"
            step="0.1"
            value={setupData.bodyWeight || ''}
            onChange={(e) => handleInputChange('bodyWeight', parseFloat(e.target.value) || 0)}
            placeholder="ej. 75.5"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="height">Altura (cm) *</label>
          <input
            id="height"
            type="number"
            min="100"
            max="250"
            step="0.5"
            value={setupData.height || ''}
            onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
            placeholder="ej. 175.0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="age">Edad *</label>
          <input
            id="age"
            type="number"
            min="13"
            max="100"
            value={setupData.age || ''}
            onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
            placeholder="ej. 25"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="gender">Género</label>
          <select
            id="gender"
            value={setupData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
          >
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="setup-step">
      <h3>Pesos Máximos (1RM)</h3>
      <p>Ingresa tus pesos máximos actuales para cada ejercicio principal.</p>
      
      <div className="max-reps-grid">
        <div className="form-group">
          <label htmlFor="max-reps-muscle-ups">Muscle-ups (kg)</label>
          <input
            id="max-reps-muscle-ups"
            type="number"
            min="0"
            step="0.5"
            value={setupData.maxReps.muscle_ups || ''}
            onChange={(e) => handleMaxRepsChange('muscle_ups', e.target.value)}
            placeholder="0"
          />
          <small>Peso adicional, no incluye peso corporal</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="max-reps-pull-ups">Pull-ups (kg)</label>
          <input
            id="max-reps-pull-ups"
            type="number"
            min="0"
            step="0.5"
            value={setupData.maxReps.pull_ups || ''}
            onChange={(e) => handleMaxRepsChange('pull_ups', e.target.value)}
            placeholder="0"
          />
          <small>Peso adicional, no incluye peso corporal</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="max-reps-dips">Dips (kg)</label>
          <input
            id="max-reps-dips"
            type="number"
            min="0"
            step="0.5"
            value={setupData.maxReps.dips || ''}
            onChange={(e) => handleMaxRepsChange('dips', e.target.value)}
            placeholder="0"
          />
          <small>Peso adicional, no incluye peso corporal</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="max-reps-squats">Squats (kg)</label>
          <input
            id="max-reps-squats"
            type="number"
            min="0"
            step="0.5"
            value={setupData.maxReps.squats || ''}
            onChange={(e) => handleMaxRepsChange('squats', e.target.value)}
            placeholder="0"
          />
          <small>Peso máximo en sentadillas</small>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="setup-step">
      <h3>Nivel de Experiencia</h3>
      <p>Selecciona tu nivel de experiencia en entrenamiento de calistenia.</p>
      
      <div className="experience-grid">
        {experienceLevels.map(level => (
          <div
            key={level.value}
            className={`experience-option ${setupData.experienceLevel === level.value ? 'selected' : ''}`}
            onClick={() => handleInputChange('experienceLevel', level.value)}
          >
            <h4>{level.label}</h4>
            <p>{level.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="setup-step">
      <h3>Objetivos de Entrenamiento</h3>
      <p>Selecciona tus objetivos principales (puedes elegir varios).</p>
      
      <div className="goals-grid">
        {trainingGoals.map(goal => (
          <div
            key={goal.value}
            className={`goal-option ${setupData.trainingGoals.includes(goal.value) ? 'selected' : ''}`}
            onClick={() => handleGoalToggle(goal.value)}
          >
            <h4>{goal.label}</h4>
            <p>{goal.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="setup-step">
      <h3>Frecuencia de Entrenamiento</h3>
      <p>¿Cuántas veces por semana planeas entrenar?</p>
      
      <div className="frequency-grid">
        {frequencyOptions.map(option => (
          <div
            key={option.value}
            className={`frequency-option ${setupData.trainingFrequency === option.value ? 'selected' : ''}`}
            onClick={() => handleInputChange('trainingFrequency', option.value)}
          >
            <span>{option.label}</span>
          </div>
        ))}
      </div>
      
      <div className="form-group">
        <label htmlFor="preferred-time">Horario Preferido</label>
        <select
          id="preferred-time"
          value={setupData.preferredTrainingTime}
          onChange={(e) => handleInputChange('preferredTrainingTime', e.target.value)}
        >
          {timeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="session-duration">Duración Máxima de Sesión (minutos)</label>
        <input
          id="session-duration"
          type="number"
          min="15"
          max="180"
          step="15"
          value={setupData.maxSessionDuration}
          onChange={(e) => handleInputChange('maxSessionDuration', parseInt(e.target.value) || 60)}
        />
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="setup-step">
      <h3>Días Disponibles</h3>
      <p>Selecciona los días en que puedes entrenar.</p>
      
      <div className="days-grid">
        {dayOptions.map(day => (
          <div
            key={day.value}
            className={`day-option ${setupData.availableTrainingDays.includes(day.value) ? 'selected' : ''}`}
            onClick={() => handleDayToggle(day.value)}
          >
            <span>{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="setup-step">
      <h3>Equipamiento Disponible</h3>
      <p>¿Qué equipamiento tienes disponible para entrenar?</p>
      
      <div className="equipment-grid">
        <div className="equipment-item">
          <label>
            <input
              type="checkbox"
              checked={setupData.hasPullUpBar}
              onChange={(e) => handleInputChange('hasPullUpBar', e.target.checked)}
            />
            <span>Barra de Pull-ups</span>
          </label>
        </div>
        
        <div className="equipment-item">
          <label>
            <input
              type="checkbox"
              checked={setupData.hasDipBars}
              onChange={(e) => handleInputChange('hasDipBars', e.target.checked)}
            />
            <span>Barras de Dips</span>
          </label>
        </div>
        
        <div className="equipment-item">
          <label>
            <input
              type="checkbox"
              checked={setupData.hasWeights}
              onChange={(e) => handleInputChange('hasWeights', e.target.checked)}
            />
            <span>Pesas</span>
          </label>
        </div>
        
        <div className="equipment-item">
          <label>
            <input
              type="checkbox"
              checked={setupData.hasGymAccess}
              onChange={(e) => handleInputChange('hasGymAccess', e.target.checked)}
            />
            <span>Acceso a Gimnasio</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep8 = () => (
    <div className="setup-step">
      <h3>Información de Salud</h3>
      <p>Información opcional para personalizar mejor tu entrenamiento.</p>
      
      <div className="health-section">
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={setupData.hasInjuries}
              onChange={(e) => handleInputChange('hasInjuries', e.target.checked)}
            />
            <span>Tengo lesiones o limitaciones físicas</span>
          </label>
        </div>
        
        {setupData.hasInjuries && (
          <div className="form-group">
            <label htmlFor="injury-details">Detalles de lesiones</label>
            <textarea
              id="injury-details"
              value={setupData.injuryDetails}
              onChange={(e) => handleInputChange('injuryDetails', e.target.value)}
              placeholder="Describe tus lesiones o limitaciones..."
              rows={3}
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="medical-conditions">Condiciones médicas</label>
          <textarea
            id="medical-conditions"
            value={setupData.medicalConditions}
            onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
            placeholder="Condiciones médicas relevantes (opcional)..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      case 8: return renderStep8();
      default: return renderStep1();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="user-setup-modal-overlay">
      <div className="user-setup-modal">
        <div className="modal-header">
          <h2>Configuración Inicial</h2>
          <div className="step-indicator">
            Paso {currentStep} de 8
          </div>
        </div>
        
        <div className="modal-content">
          {renderStep()}
        </div>
        
        <div className="modal-actions">
          {currentStep > 1 && (
            <button className="btn-secondary" onClick={prevStep}>
              Anterior
            </button>
          )}
          
          {currentStep < 8 ? (
            <button 
              className="btn-primary" 
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Siguiente
            </button>
          ) : (
            <button 
              className="btn-primary" 
              onClick={handleComplete}
            >
              Completar Configuración
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSetupModal; 