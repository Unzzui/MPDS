import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOneRepMaxes } from '../hooks/useOneRepMaxes';
import { useQueryClient } from '@tanstack/react-query';
import '../styles/Setup.css';

interface InitialRMData {
  muscleUp: number;
  pullUp: number;
  dips: number;
  squat: number;
}

const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { latestOneRepMaxes, createOneRepMax, isCreatingOneRepMax } = useOneRepMaxes();
  
  const [formData, setFormData] = useState<InitialRMData>({
    muscleUp: 0,
    pullUp: 0,
    dips: 0,
    squat: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has existing 1RM data
  const hasExistingData = latestOneRepMaxes && latestOneRepMaxes.length > 0;

  const handleInputChange = (field: keyof InitialRMData, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.muscleUp < 0) {
      newErrors.muscleUp = 'El valor debe ser mayor o igual a 0';
    }
    if (formData.pullUp < 0) {
      newErrors.pullUp = 'El valor debe ser mayor o igual a 0';
    }
    if (formData.dips < 0) {
      newErrors.dips = 'El valor debe ser mayor o igual a 0';
    }
    if (formData.squat < 0) {
      newErrors.squat = 'El valor debe ser mayor o igual a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Create 1RM records for each exercise
      const exercises = [
        { name: 'Muscle Up', value: formData.muscleUp },
        { name: 'Pull Up', value: formData.pullUp },
        { name: 'Dips', value: formData.dips },
        { name: 'Squat', value: formData.squat }
      ];
      
      // Create all 1RM records
      for (const exercise of exercises) {
        if (exercise.value > 0) {
          await createOneRepMax({
            exercise: exercise.name,
            one_rm: exercise.value,
            date_achieved: today
          });
        }
      }
      
      // Mark setup as completed in localStorage
      localStorage.setItem('setup_verified', 'true');
      
      // Invalidate the 1RM query to trigger the redirect logic
      queryClient.invalidateQueries({ queryKey: ['one-rep-maxes'] });
      
      // Navigate to dashboard after successful setup
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error setting up initial 1RM:', error);
      // You could show an error message here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Mark setup as completed even when skipping
    localStorage.setItem('setup_verified', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="setup-page">
      <div className="setup-container">
        <div className="setup-header">
          <h1 className="setup-title">CONFIGURACION INICIAL</h1>
          <p className="setup-subtitle">
            {hasExistingData ? 'ACTUALIZAR DATOS DE ENTRENAMIENTO' : 'BIENVENIDO AL SISTEMA'}
            <br />
            {user?.username ? `USUARIO: ${user.username.toUpperCase()}` : 'ATLETA'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-section">
            <h2 className="section-title">
              {hasExistingData ? 'ACTUALIZAR 1RM' : 'CONFIGURAR 1RM INICIALES'}
            </h2>
            <p className="section-description">
              {hasExistingData 
                ? 'Actualiza tus mejores marcas personales para optimizar las sugerencias de entrenamiento'
                : 'Establece tus mejores marcas personales en cada ejercicio para comenzar a trackear tu progreso'
              }
            </p>
            
            <div className="rm-inputs">
              <div className="rm-input-group">
                <label htmlFor="muscleUp" className="rm-label">
                  <span className="exercise-name">MUSCLE-UP</span>
                  <span className="exercise-description">Dominadas con transicion</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="muscleUp"
                    value={formData.muscleUp || ''}
                    onChange={(e) => handleInputChange('muscleUp', e.target.value)}
                    className={`rm-input ${errors.muscleUp ? 'error' : ''}`}
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                  <span className="unit">KG</span>
                </div>
                {errors.muscleUp && <span className="error-message">{errors.muscleUp}</span>}
              </div>

              <div className="rm-input-group">
                <label htmlFor="pullUp" className="rm-label">
                  <span className="exercise-name">PULL-UP</span>
                  <span className="exercise-description">Dominadas con peso adicional</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="pullUp"
                    value={formData.pullUp || ''}
                    onChange={(e) => handleInputChange('pullUp', e.target.value)}
                    className={`rm-input ${errors.pullUp ? 'error' : ''}`}
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                  <span className="unit">KG</span>
                </div>
                {errors.pullUp && <span className="error-message">{errors.pullUp}</span>}
              </div>

              <div className="rm-input-group">
                <label htmlFor="dips" className="rm-label">
                  <span className="exercise-name">DIPS</span>
                  <span className="exercise-description">Fondos con peso adicional</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="dips"
                    value={formData.dips || ''}
                    onChange={(e) => handleInputChange('dips', e.target.value)}
                    className={`rm-input ${errors.dips ? 'error' : ''}`}
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                  <span className="unit">KG</span>
                </div>
                {errors.dips && <span className="error-message">{errors.dips}</span>}
              </div>

              <div className="rm-input-group">
                <label htmlFor="squat" className="rm-label">
                  <span className="exercise-name">SQUAT</span>
                  <span className="exercise-description">Sentadillas con barra</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="squat"
                    value={formData.squat || ''}
                    onChange={(e) => handleInputChange('squat', e.target.value)}
                    className={`rm-input ${errors.squat ? 'error' : ''}`}
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                  <span className="unit">KG</span>
                </div>
                {errors.squat && <span className="error-message">{errors.squat}</span>}
              </div>
            </div>
          </div>

          <div className="setup-actions">
            <button
              type="submit"
              className="setup-btn primary"
              disabled={isSubmitting || isCreatingOneRepMax}
            >
              {isSubmitting || isCreatingOneRepMax ? 'PROCESANDO...' : (hasExistingData ? 'ACTUALIZAR DATOS' : 'INICIAR ENTRENAMIENTO')}
            </button>
            
            <button
              type="button"
              onClick={handleSkip}
              className="setup-btn secondary"
              disabled={isSubmitting || isCreatingOneRepMax}
            >
              {hasExistingData ? 'MANTENER DATOS ACTUALES' : 'CONFIGURAR DESPUES'}
            </button>
          </div>
        </form>

        <div className="setup-info">
          <h3>INFORMACION DEL SISTEMA</h3>
          <ul>
            <li>Si no conoces tu 1RM exacto, puedes estimarlo basandote en tu experiencia</li>
            <li>Puedes actualizar estos numeros en cualquier momento desde tu perfil</li>
            <li>Estos datos te ayudaran a calcular pesos sugeridos para tus entrenamientos</li>
            <li>El sistema utiliza la formula de Epley para estimar 1RM a partir de series con mas repeticiones</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SetupPage; 