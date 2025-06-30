import React, { useState } from 'react';
import { useBodyWeight } from '../hooks/useBodyWeight';
import '../styles/BodyWeightSetup.css';

interface BodyWeightSetupProps {
  onComplete?: () => void;
}

const BodyWeightSetup: React.FC<BodyWeightSetupProps> = ({ onComplete }) => {
  const { bodyWeight, setBodyWeight, isConfigured } = useBodyWeight();
  const [weight, setWeight] = useState<string>(bodyWeight > 0 ? bodyWeight.toString() : '');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      setError('Por favor ingresa un peso válido mayor a 0');
      return;
    }
    
    if (weightValue > 300) {
      setError('El peso parece ser muy alto. Por favor verifica.');
      return;
    }
    
    setBodyWeight(weightValue);
    setError('');
    onComplete?.();
  };

  const handleSkip = () => {
    setBodyWeight(0);
    onComplete?.();
  };

  if (isConfigured && bodyWeight > 0) {
    return (
      <div className="body-weight-setup">
        <div className="setup-card">
          <h3>Peso Corporal Configurado</h3>
          <p>Tu peso corporal está configurado en <strong>{bodyWeight} kg</strong></p>
          <button 
            className="btn-secondary" 
            onClick={() => setBodyWeight(0)}
          >
            Cambiar Peso
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="body-weight-setup">
      <div className="setup-card">
        <h3>Configura tu Peso Corporal</h3>
        <p>
          Para calcular correctamente las cargas de entrenamiento, necesitamos conocer tu peso corporal.
          Esto nos ayudará a determinar las cargas totales para ejercicios como pull-ups y dips.
        </p>
        
        <form onSubmit={handleSubmit} className="weight-form">
          <div className="form-group">
            <label htmlFor="body-weight">Peso Corporal (kg)</label>
            <input
              id="body-weight"
              type="number"
              min="30"
              max="300"
              step="0.1"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setError('');
              }}
              placeholder="ej. 75.5"
              className={error ? 'error' : ''}
            />
            {error && <span className="error-text">{error}</span>}
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleSkip}>
              Saltar por ahora
            </button>
            <button type="submit" className="btn-primary">
              Guardar Peso
            </button>
          </div>
        </form>
        
        <div className="setup-info">
          <h4>¿Por qué necesitamos tu peso?</h4>
          <ul>
            <li>Para calcular cargas totales en ejercicios con peso corporal</li>
            <li>Para determinar progresiones más precisas</li>
            <li>Para generar tablas RPE más acertadas</li>
            <li>Puedes cambiarlo en cualquier momento</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BodyWeightSetup; 