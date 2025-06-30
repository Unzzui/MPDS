import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../contexts/BodyWeightContext';
import '../styles/CreateBlockForm.css';

interface CreateBlockFormProps {
  onSubmit: (blockData: any) => void;
  onCancel: () => void;
}

const CreateBlockForm: React.FC<CreateBlockFormProps> = ({ onSubmit, onCancel }) => {
  const { userProfile } = useUserProfile();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    strategy: 'strength' as 'strength' | 'hypertrophy' | 'endurance' | 'power',
    progression_type: 'linear' as 'linear' | 'undulating' | 'step' | 'wave',
    duration_weeks: 4,
    max_reps: {
      muscle_ups: 0,
      pull_ups: 0,
      dips: 0,
      squats: 0
    },
    // Strategy-specific fields
    intensity_focus: 85,
    volume_focus: 4,
    endurance_focus: 15,
    power_focus: 5
  });

  // Load user profile data when available
  useEffect(() => {
    if (userProfile && userProfile.maxReps) {
      setFormData(prev => ({
        ...prev,
        max_reps: {
          muscle_ups: userProfile.maxReps?.muscle_ups || 0,
          pull_ups: userProfile.maxReps?.pull_ups || 0,
          dips: userProfile.maxReps?.dips || 0,
          squats: userProfile.maxReps?.squats || 0
        }
      }));
    }
  }, [userProfile]);

  const strategies = {
    strength: {
      name: 'Fuerza',
      description: 'Enfoque en aumentar la fuerza máxima con cargas pesadas y pocas repeticiones.',
      fields: ['intensity_focus', 'volume_multiplier', 'rest_days']
    },
    hypertrophy: {
      name: 'Hipertrofia',
      description: 'Desarrollo muscular con cargas moderadas y mayor volumen de trabajo.',
      fields: ['volume_focus', 'intensity_multiplier', 'supersets']
    },
    endurance: {
      name: 'Resistencia',
      description: 'Mejora de la capacidad de trabajo con cargas ligeras y muchas repeticiones.',
      fields: ['endurance_focus', 'circuit_training', 'time_under_tension']
    },
    power: {
      name: 'Potencia',
      description: 'Desarrollo de velocidad y explosividad con cargas moderadas y movimientos explosivos.',
      fields: ['power_focus', 'plyometric_ratio', 'rest_intervals']
    }
  };

  const progressionTypes = {
    linear: {
      name: 'Lineal',
      description: 'Progresión constante semana a semana. Ideal para principiantes y desarrollo de base.',
      explanation: 'La intensidad aumenta de forma constante cada semana, permitiendo adaptación gradual.'
    },
    undulating: {
      name: 'Ondulante',
      description: 'Variación de intensidad y volumen entre sesiones. Mejora la recuperación y adaptación.',
      explanation: 'Alterna entre días de alta intensidad y días de mayor volumen para optimizar la recuperación.'
    },
    step: {
      name: 'Escalonada',
      description: 'Incrementos escalonados con períodos de estabilización. Ideal para atletas intermedios.',
      explanation: 'Aumenta la carga por escalones, manteniendo cada nivel por 2-3 semanas antes del siguiente incremento.'
    },
    wave: {
      name: 'Ondulatoria',
      description: 'Progresión en ondas con picos y valles. Para atletas avanzados que buscan maximizar el rendimiento.',
      explanation: 'Crea ondas de intensidad que permiten picos de rendimiento seguidos de períodos de recuperación.'
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMaxRepsChange = (exercise: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      max_reps: {
        ...prev.max_reps,
        [exercise]: numValue
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one max rep value is greater than 0
    const hasValidMaxReps = Object.values(formData.max_reps).some(val => val > 0);
    if (!hasValidMaxReps) {
      alert('Debes ingresar al menos un peso máximo mayor a 0');
      return;
    }

    onSubmit(formData);
  };

  const renderStrategyFields = () => {
    const strategy = strategies[formData.strategy];
    if (!strategy) return null;

    return (
      <div className="strategy-fields">
        <h4>Configuración de {strategy.name}</h4>
        <p className="strategy-description">{strategy.description}</p>
        
        {formData.strategy === 'strength' && (
          <div className="field-group">
            <label htmlFor="intensity-focus">Enfoque de Intensidad (%)</label>
            <input
              id="intensity-focus"
              type="number"
              min="70"
              max="95"
              step="5"
              value={formData.intensity_focus || 85}
              onChange={(e) => handleInputChange('intensity_focus', parseInt(e.target.value) || 85)}
            />
            <small>Porcentaje del 1RM para trabajar (70-95%)</small>
          </div>
        )}
        
        {formData.strategy === 'hypertrophy' && (
          <div className="field-group">
            <label htmlFor="volume-focus">Enfoque de Volumen (series)</label>
            <input
              id="volume-focus"
              type="number"
              min="3"
              max="6"
              step="1"
              value={formData.volume_focus || 4}
              onChange={(e) => handleInputChange('volume_focus', parseInt(e.target.value) || 4)}
            />
            <small>Número de series por ejercicio (3-6)</small>
          </div>
        )}
        
        {formData.strategy === 'endurance' && (
          <div className="field-group">
            <label htmlFor="endurance-focus">Enfoque de Resistencia (repeticiones)</label>
            <input
              id="endurance-focus"
              type="number"
              min="12"
              max="25"
              step="2"
              value={formData.endurance_focus || 15}
              onChange={(e) => handleInputChange('endurance_focus', parseInt(e.target.value) || 15)}
            />
            <small>Rango de repeticiones objetivo (12-25)</small>
          </div>
        )}
        
        {formData.strategy === 'power' && (
          <div className="field-group">
            <label htmlFor="power-focus">Enfoque de Potencia (repeticiones)</label>
            <input
              id="power-focus"
              type="number"
              min="3"
              max="8"
              step="1"
              value={formData.power_focus || 5}
              onChange={(e) => handleInputChange('power_focus', parseInt(e.target.value) || 5)}
            />
            <small>Repeticiones explosivas por serie (3-8)</small>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="create-block-form">
      <div className="form-header">
        <h2>Crear Nuevo Bloque de Entrenamiento</h2>
        <button type="button" onClick={onCancel} className="close-btn">
          ×
        </button>
      </div>

      <div className="block-form">
        <div className="form-section">
          <h3>Información Básica</h3>
          
          <div className="form-group">
            <label htmlFor="block-name">Nombre del Bloque *</label>
            <input
              id="block-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="ej. Bloque de Fuerza - Semana 1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="block-description">Descripción</label>
            <textarea
              id="block-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe el objetivo y enfoque de este bloque..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="block-duration">Duración (semanas)</label>
            <select
              id="block-duration"
              value={formData.duration_weeks}
              onChange={(e) => handleInputChange('duration_weeks', parseInt(e.target.value))}
            >
              <option value={2}>2 semanas</option>
              <option value={3}>3 semanas</option>
              <option value={4}>4 semanas</option>
              <option value={6}>6 semanas</option>
              <option value={8}>8 semanas</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Estrategia de Entrenamiento</h3>
          
          <div className="strategy-options">
            {Object.entries(strategies).map(([key, strategy]) => (
              <div
                key={key}
                className={`strategy-option ${formData.strategy === key ? 'selected' : ''}`}
                onClick={() => handleInputChange('strategy', key)}
              >
                <h5>{strategy.name}</h5>
                <p>{strategy.description}</p>
              </div>
            ))}
          </div>

          {renderStrategyFields()}
        </div>

        <div className="form-section">
          <h3>Tipo de Progresión</h3>
          <p className="section-description">
            Selecciona cómo quieres que progrese la intensidad y volumen a lo largo del bloque de entrenamiento.
          </p>
          
          <div className="strategy-options">
            {Object.entries(progressionTypes).map(([key, progression]) => (
              <div
                key={key}
                className={`strategy-option ${formData.progression_type === key ? 'selected' : ''}`}
                onClick={() => handleInputChange('progression_type', key)}
              >
                <h5>{progression.name}</h5>
                <p>{progression.description}</p>
                <div className="progression-explanation">
                  <small>{progression.explanation}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Pesos Máximos (1RM) - kg</h3>
          <p className="section-description">
            Ingresa tus pesos máximos para cada ejercicio. Estos valores se usarán para calcular las cargas de entrenamiento.
          </p>
          
          <div className="max-reps-grid">
            <div className="form-group">
              <label htmlFor="muscle-ups-rm">Muscle-ups (kg)</label>
              <input
                id="muscle-ups-rm"
                type="number"
                min="0"
                step="0.5"
                value={formData.max_reps.muscle_ups}
                onChange={(e) => handleMaxRepsChange('muscle_ups', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pull-ups-rm">Pull-ups (kg)</label>
              <input
                id="pull-ups-rm"
                type="number"
                min="0"
                step="0.5"
                value={formData.max_reps.pull_ups}
                onChange={(e) => handleMaxRepsChange('pull_ups', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dips-rm">Dips (kg)</label>
              <input
                id="dips-rm"
                type="number"
                min="0"
                step="0.5"
                value={formData.max_reps.dips}
                onChange={(e) => handleMaxRepsChange('dips', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="squats-rm">Squats (kg)</label>
              <input
                id="squats-rm"
                type="number"
                min="0"
                step="0.5"
                value={formData.max_reps.squats}
                onChange={(e) => handleMaxRepsChange('squats', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Crear Bloque
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateBlockForm;
