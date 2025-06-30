import React, { useState } from 'react';
import { useRoutines } from '../hooks/useRoutines';
import { useNavigate } from 'react-router-dom';
import type { RoutineSummary, RoutineTemplate } from '../types';
import ExerciseSelector from '../components/ExerciseSelector';
import '../styles/Routines.css';

const RoutinesPage: React.FC = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RoutineTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');

  const {
    routines,
    activeRoutines,
    templates,
    isLoadingRoutines,
    isLoadingActiveRoutines,
    isLoadingTemplates,
    routinesError,
    activeRoutinesError,
    templatesError,
    createRoutine,
    deleteRoutine,
    activateRoutine,
    createFromTemplate,
    isCreatingRoutine,
    isDeletingRoutine,
    isActivatingRoutine,
    isCreatingFromTemplate,
  } = useRoutines();

  const handleCreateRoutine = (formData: FormData) => {
    const routineData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      exercises: (formData.get('exercises') as string).split(',').map(e => e.trim()).filter(Boolean),
      days: Array.from(formData.getAll('days')).map(day => parseInt(day as string)),
      main_lifts: (formData.get('main_lifts') as string).split(',').map(e => e.trim()).filter(Boolean),
      is_active: formData.has('is_active'),
    };

    createRoutine(routineData, {
      onSuccess: () => {
        setShowCreateModal(false);
      },
    });
  };

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate || !templateName.trim()) return;

    createFromTemplate(
      { templateId: selectedTemplate.id, name: templateName },
      {
        onSuccess: () => {
          setShowTemplateModal(false);
          setSelectedTemplate(null);
          setTemplateName('');
        },
      }
    );
  };

  const handleDeleteRoutine = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
      deleteRoutine(id);
    }
  };

  const handleActivateRoutine = (id: number) => {
    activateRoutine(id);
  };

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Helper function to convert Routine to RoutineSummary for display
  const convertToSummary = (routine: any): RoutineSummary => ({
    id: routine.id,
    name: routine.name,
    description: routine.description,
    exercise_count: routine.exercises?.length || 0,
    day_count: routine.days?.length || 0,
    is_active: routine.is_active,
    created_at: routine.created_at,
  });

  if (isLoadingRoutines || isLoadingActiveRoutines || isLoadingTemplates) {
    return (
      <div className="routines-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Cargando rutinas...</p>
        </div>
      </div>
    );
  }

  if (routinesError || activeRoutinesError || templatesError) {
    const error = routinesError || activeRoutinesError || templatesError;
    console.error('Routines page error:', error);
    
    return (
      <div className="routines-container">
        <div className="empty-state">
          <h3>Error al Cargar Rutinas</h3>
          <p>Hubo un error al cargar tus rutinas. Por favor, inténtalo de nuevo más tarde.</p>
          <div className="error-details">
            <p><strong>Error:</strong> {String(error)}</p>
          </div>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="routines-container">
      {/* Header */}
      <div className="routines-header">
        <h1>Rutinas</h1>
        <div>
          <button 
            className="btn-secondary" 
            onClick={() => setShowTemplateModal(true)}
            style={{ marginRight: '1rem' }}
          >
            Desde Plantilla
          </button>
          <button className="btn-create-routine" onClick={() => setShowCreateModal(true)}>
            + Crear Rutina
          </button>
        </div>
      </div>

      {/* Active Routines Section */}
      <div className="active-routines-section">
        <h2>Rutinas Activas ({activeRoutines.length})</h2>
        {activeRoutines.length === 0 ? (
          <div className="empty-state">
            <h3>No Hay Rutinas Activas</h3>
            <p>Crea una rutina o activa una existente para comenzar.</p>
            <button className="btn-create-routine" onClick={() => setShowCreateModal(true)}>
              + Crear Primera Rutina
            </button>
          </div>
        ) : (
          activeRoutines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={convertToSummary(routine)}
              onDelete={handleDeleteRoutine}
              onActivate={handleActivateRoutine}
              isActive={true}
              isLoading={isDeletingRoutine || isActivatingRoutine}
            />
          ))
        )}
      </div>

      {/* All Routines Section */}
      <div className="routines-section">
        <h2>Todas las Rutinas ({routines.length})</h2>
        {routines.length === 0 ? (
          <div className="empty-state">
            <h3>No Se Encontraron Rutinas</h3>
            <p>Crea tu primera rutina para comenzar a rastrear tus entrenamientos.</p>
            <button className="btn-create-routine" onClick={() => setShowCreateModal(true)}>
              + Crear Primera Rutina
            </button>
          </div>
        ) : (
          routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onDelete={handleDeleteRoutine}
              onActivate={handleActivateRoutine}
              isActive={routine.is_active}
              isLoading={isDeletingRoutine || isActivatingRoutine}
            />
          ))
        )}
      </div>

      {/* Templates Section */}
      <div className="templates-section">
        <h2>Plantillas de Rutinas ({templates.length})</h2>
        {templates.length === 0 ? (
          <div className="empty-state">
            <h3>No Hay Plantillas Disponibles</h3>
            <p>No hay plantillas de rutinas disponibles actualmente.</p>
          </div>
        ) : (
          templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onCreateFromTemplate={() => {
                setSelectedTemplate(template);
                setTemplateName(`${template.name} Copia`);
                setShowTemplateModal(true);
              }}
            />
          ))
        )}
      </div>

      {/* Create Routine Modal */}
      {showCreateModal && (
        <CreateRoutineModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateRoutine}
          isLoading={isCreatingRoutine}
        />
      )}

      {/* Create from Template Modal */}
      {showTemplateModal && selectedTemplate && (
        <CreateFromTemplateModal
          template={selectedTemplate}
          name={templateName}
          onNameChange={setTemplateName}
          onClose={() => {
            setShowTemplateModal(false);
            setSelectedTemplate(null);
            setTemplateName('');
          }}
          onSubmit={handleCreateFromTemplate}
          isLoading={isCreatingFromTemplate}
        />
      )}
    </div>
  );
};

// Routine Card Component
interface RoutineCardProps {
  routine: RoutineSummary;
  onDelete: (id: number) => void;
  onActivate: (id: number) => void;
  isActive: boolean;
  isLoading: boolean;
}

const RoutineCard: React.FC<RoutineCardProps> = ({
  routine,
  onDelete,
  onActivate,
  isActive,
  isLoading,
}) => {
  const navigate = useNavigate();

  return (
    <div className={`routine-card ${isActive ? 'active' : ''}`}>
      <div className="routine-header">
        <div>
          <div className="routine-title">{routine.name}</div>
          {routine.description && (
            <div className="routine-description">{routine.description}</div>
          )}
        </div>
        <div className="routine-actions">
          <button
            className="btn-accent"
            onClick={() => navigate(`/routines/${routine.id}`)}
            disabled={isLoading}
          >
            Ver
          </button>
          {!isActive && (
            <button
              className="btn-primary"
              onClick={() => onActivate(routine.id)}
              disabled={isLoading}
            >
              Activar
            </button>
          )}
          <button
            className="btn-danger"
            onClick={() => onDelete(routine.id)}
            disabled={isLoading}
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="routine-stats">
        <div className="stat-item">
          <div className="stat-label">Ejercicios</div>
          <div className="stat-value">{routine.exercise_count}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Días</div>
          <div className="stat-value">{routine.day_count}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Estado</div>
          <div className="stat-value">{isActive ? 'Activa' : 'Inactiva'}</div>
        </div>
      </div>

      <div className="routine-days">
        {routine.day_count > 0 && (
          <span className="day-badge">
            {routine.day_count} día{routine.day_count !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

// Template Card Component
interface TemplateCardProps {
  template: RoutineTemplate;
  onCreateFromTemplate: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onCreateFromTemplate }) => {
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="template-card">
      <div className="template-badge">Plantilla</div>
      <div className="routine-header">
        <div>
          <div className="routine-title">{template.name}</div>
          {template.description && (
            <div className="routine-description">{template.description}</div>
          )}
        </div>
        <div className="routine-actions">
          <button className="btn-primary" onClick={onCreateFromTemplate}>
            Usar Plantilla
          </button>
        </div>
      </div>

      <div className="routine-stats">
        <div className="stat-item">
          <div className="stat-label">Ejercicios</div>
          <div className="stat-value">{template.exercises.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Días</div>
          <div className="stat-value">{template.days.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Lifts Principales</div>
          <div className="stat-value">{template.main_lifts.length}</div>
        </div>
      </div>

      <div className="routine-days">
        {template.days.map((day) => (
          <span key={day} className="day-badge">
            {dayNames[day - 1]}
          </span>
        ))}
      </div>

      <div className="routine-exercises">
        <div className="exercises-list">
          {template.exercises.slice(0, 5).map((exercise, index) => (
            <span
              key={index}
              className={`exercise-tag ${
                template.main_lifts.includes(exercise) ? 'main-lift-tag' : ''
              }`}
            >
              {exercise}
            </span>
          ))}
          {template.exercises.length > 5 && (
            <span className="exercise-tag">+{template.exercises.length - 5} more</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Routine Modal Component
interface CreateRoutineModalProps {
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

const CreateRoutineModal: React.FC<CreateRoutineModalProps> = ({
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [selectedMainLifts, setSelectedMainLifts] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Agregar ejercicios y lifts principales desde el estado
    formData.set('exercises', selectedExercises.join(','));
    formData.set('main_lifts', selectedMainLifts.join(','));
    
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Nueva Rutina</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Nombre de la Rutina</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                required
                placeholder="Ingresa el nombre de la rutina"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                className="form-input form-textarea"
                placeholder="Descripción opcional"
              />
            </div>

            <ExerciseSelector
              selectedExercises={selectedExercises}
              onExercisesChange={setSelectedExercises}
              label="Ejercicios"
              placeholder="Busca y selecciona ejercicios"
              required={true}
            />

            <ExerciseSelector
              selectedExercises={selectedMainLifts}
              onExercisesChange={setSelectedMainLifts}
              label="Lifts Principales"
              placeholder="Selecciona los ejercicios principales"
              required={true}
            />

            <div className="form-group">
              <label className="form-label">Días de Entrenamiento</label>
              <div className="checkbox-group">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => (
                  <div key={day} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`day-${index + 1}`}
                      name="days"
                      value={index + 1}
                      className="checkbox-input"
                    />
                    <label htmlFor={`day-${index + 1}`} className="checkbox-label">
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  className="checkbox-input"
                />
                <label htmlFor="is_active" className="checkbox-label">
                  Activar esta rutina inmediatamente
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Rutina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create from Template Modal Component
interface CreateFromTemplateModalProps {
  template: RoutineTemplate;
  name: string;
  onNameChange: (name: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const CreateFromTemplateModal: React.FC<CreateFromTemplateModalProps> = ({
  template,
  name,
  onNameChange,
  onClose,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear desde Plantilla</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="template-name">Nombre de la Rutina</label>
            <input
              type="text"
              id="template-name"
              className="form-input"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ingresa el nombre de la rutina"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detalles de la Plantilla</label>
            <div className="routine-stats">
              <div className="stat-item">
                <div className="stat-label">Ejercicios</div>
                <div className="stat-value">{template.exercises.length}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Días</div>
                <div className="stat-value">{template.days.length}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Lifts Principales</div>
                <div className="stat-value">{template.main_lifts.length}</div>
              </div>
            </div>
          </div>

          {template.description && (
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {template.description}
              </p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onSubmit}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? 'Creando...' : 'Crear Rutina'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutinesPage; 