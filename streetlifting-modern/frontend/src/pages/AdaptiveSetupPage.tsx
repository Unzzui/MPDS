import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdaptation } from '../contexts/AdaptationContext';
import '../styles/Setup.css';

interface OneRepMaxData {
  exercise: string;
  weight: number;
}

interface SetupFormData {
  one_rep_maxes: OneRepMaxData[];
  experience_indicators: {
    has_previous_training: boolean;
    training_years: number;
  };
  planned_frequency: number;
}

const AdaptiveSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackInteraction } = useAdaptation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SetupFormData>({
    one_rep_maxes: [
      { exercise: 'Bench Press', weight: 0 },
      { exercise: 'Squat', weight: 0 },
      { exercise: 'Deadlift', weight: 0 },
      { exercise: 'Pull-up', weight: 0 },
      { exercise: 'Dip', weight: 0 },
      { exercise: 'Muscle-up', weight: 0 }
    ],
    experience_indicators: {
      has_previous_training: false,
      training_years: 0
    },
    planned_frequency: 3
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Track setup page visit
  useEffect(() => {
    trackInteraction({
      interaction_type: 'page_visit',
      interaction_data: {
        page: 'adaptive_setup',
        step: currentStep
      }
    });
  }, [currentStep]);

  const handleExperienceChange = (field: keyof typeof formData.experience_indicators, value: any) => {
    setFormData(prev => ({
      ...prev,
      experience_indicators: {
        ...prev.experience_indicators,
        [field]: value
      }
    }));
  };

  const handleWeightChange = (exercise: string, weight: string) => {
    const numWeight = weight === '' ? 0 : parseFloat(weight);
    setFormData(prev => ({
      ...prev,
      one_rep_maxes: prev.one_rep_maxes.map(rm => 
        rm.exercise === exercise ? { ...rm, weight: numWeight } : rm
      )
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Filter out exercises with 0 weight
      const validOneRepMaxes = formData.one_rep_maxes.filter(rm => rm.weight > 0);

      const setupData = {
        ...formData,
        one_rep_maxes: validOneRepMaxes
      };

      // Call setup API
      const response = await fetch('/api/v1/setup/initial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(setupData)
      });

      if (!response.ok) {
        throw new Error('Failed to complete setup');
      }

      const result = await response.json();

      // Track setup completion
      await trackInteraction({
        interaction_type: 'feature_use',
        interaction_data: {
          feature: 'setup_completion',
          setup_summary: result.setup_summary,
          adaptive_level: result.adaptive_dashboard.user_level,
          widgets_count: result.adaptive_dashboard.widgets.length
        }
      });

      // Navigate to dashboard
      navigate('/dashboard');

    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.message || 'Error completing setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map(step => (
        <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1 && 'Experience'}
            {step === 2 && 'Strength Data'}
            {step === 3 && 'Training Plan'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="setup-step">
      <h2>¡Bienvenido, {user?.username}! 🏋️</h2>
      <p className="step-description">
        Para personalizar tu experiencia, necesitamos conocer tu nivel de experiencia.
        El sistema se adaptará automáticamente a tus necesidades.
      </p>
      
      <div className="experience-questions">
        <div className="question-group">
          <h3>¿Tienes experiencia previa en entrenamiento de fuerza?</h3>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="has_previous_training"
                checked={formData.experience_indicators.has_previous_training === false}
                onChange={() => handleExperienceChange('has_previous_training', false)}
              />
              <span>No, soy principiante</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="has_previous_training"
                checked={formData.experience_indicators.has_previous_training === true}
                onChange={() => handleExperienceChange('has_previous_training', true)}
              />
              <span>Sí, tengo experiencia</span>
            </label>
          </div>
        </div>

        {formData.experience_indicators.has_previous_training && (
          <div className="question-group">
            <h3>¿Cuántos años de experiencia tienes?</h3>
            <div className="training-years-options">
              {[
                { value: 1, label: 'Menos de 1 año' },
                { value: 2, label: '1-2 años' },
                { value: 4, label: '3-5 años' },
                { value: 7, label: '5+ años' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`year-option ${formData.experience_indicators.training_years === option.value ? 'selected' : ''}`}
                  onClick={() => handleExperienceChange('training_years', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="adaptive-preview">
        <h4>🤖 Sistema Adaptativo</h4>
        <ul>
          <li>✅ Dashboard personalizado según tu nivel</li>
          <li>✅ Funciones avanzadas se revelan gradualmente</li>
          <li>✅ Siempre puedes acceder a modo avanzado</li>
          <li>✅ El sistema aprende de tus preferencias</li>
        </ul>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="setup-step">
      <h2>Datos de Fuerza Inicial 💪</h2>
      <p className="step-description">
        Ingresa tus máximos actuales para los ejercicios que conoces. 
        Puedes dejar en 0 los que no practiques - podrás agregarlos después.
      </p>
      
      <div className="rm-grid">
        {formData.one_rep_maxes.map((rm, index) => (
          <div key={rm.exercise} className="rm-input-group">
            <label>{rm.exercise}</label>
            <div className="weight-input">
              <input
                type="number"
                min="0"
                step="0.5"
                value={rm.weight || ''}
                onChange={(e) => handleWeightChange(rm.exercise, e.target.value)}
                placeholder="0"
              />
              <span className="unit">lbs</span>
            </div>
            <div className="exercise-info">
              {getExerciseDescription(rm.exercise)}
            </div>
          </div>
        ))}
      </div>

      <div className="setup-tip">
        <div className="tip-icon">💡</div>
        <div>
          <strong>Tip:</strong> Si no estás seguro de tu 1RM, estima conservadoramente. 
          El sistema calculará proyecciones automáticamente basadas en tus entrenamientos.
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="setup-step">
      <h2>Plan de Entrenamiento 📅</h2>
      <p className="step-description">
        ¿Con qué frecuencia planeas entrenar? Esto nos ayuda a personalizar tus recomendaciones.
      </p>
      
      <div className="frequency-selector">
        <h3>Frecuencia semanal planeada:</h3>
        <div className="frequency-options">
          {[2, 3, 4, 5, 6].map(freq => (
            <button
              key={freq}
              type="button"
              className={`frequency-option ${formData.planned_frequency === freq ? 'selected' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, planned_frequency: freq }))}
            >
              <div className="freq-number">{freq}</div>
              <div className="freq-label">días/semana</div>
            </button>
          ))}
        </div>
      </div>

      <div className="setup-summary">
        <h3>Resumen de configuración:</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Experiencia:</strong> 
            {formData.experience_indicators.has_previous_training 
              ? `${formData.experience_indicators.training_years} años` 
              : 'Principiante'
            }
          </div>
          <div className="summary-item">
            <strong>Ejercicios configurados:</strong> 
            {formData.one_rep_maxes.filter(rm => rm.weight > 0).length} de 6
          </div>
          <div className="summary-item">
            <strong>Frecuencia planeada:</strong> 
            {formData.planned_frequency} días/semana
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="adaptive-setup-page">
      <div className="setup-container">
        <div className="setup-header">
          <h1>Configuración Inicial</h1>
          {renderStepIndicator()}
        </div>

        <div className="setup-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <div className="setup-navigation">
          {currentStep > 1 && (
            <button 
              type="button" 
              className="btn-secondary"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              Anterior
            </button>
          )}
          
          <div className="nav-spacer" />
          
          {currentStep < 3 ? (
            <button 
              type="button" 
              className="btn-primary"
              onClick={nextStep}
            >
              Siguiente
            </button>
          ) : (
            <button 
              type="button" 
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Configurando...' : 'Completar Setup'}
            </button>
          )}
        </div>

        <div className="setup-footer">
          <p>
            🔒 Toda esta información se usa solo para personalizar tu experiencia. 
            Puedes cambiar cualquier configuración después.
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function for exercise descriptions
const getExerciseDescription = (exercise: string): string => {
  const descriptions: Record<string, string> = {
    'Bench Press': 'Fundamental chest and triceps exercise',
    'Squat': 'Compound leg exercise, king of lower body',
    'Deadlift': 'Best indicator of overall strength',
    'Pull-up': 'Bodyweight pulling, relative strength',
    'Dip': 'Bodyweight pushing exercise',
    'Muscle-up': 'Advanced combination movement'
  };
  return descriptions[exercise] || '';
};

export default AdaptiveSetupPage;
