import React, { useState } from 'react';
import { useRoutines } from '../hooks/useRoutines';
import { useNavigate } from 'react-router-dom';
import type { RoutineSummary, RoutineTemplate } from '../types';
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
    if (window.confirm('Are you sure you want to delete this routine?')) {
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
          <p>Loading routines...</p>
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
          <h3>Error Loading Routines</h3>
          <p>There was an error loading your routines. Please try again later.</p>
          <div className="error-details">
            <p><strong>Error:</strong> {String(error)}</p>
          </div>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="routines-container">
      {/* Header */}
      <div className="routines-header">
        <h1>Routines</h1>
        <div>
          <button 
            className="btn-secondary" 
            onClick={() => setShowTemplateModal(true)}
            style={{ marginRight: '1rem' }}
          >
            From Template
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            Create Routine
          </button>
        </div>
      </div>

      {/* Active Routines Section */}
      <div className="active-routines-section">
        <h2>Active Routines ({activeRoutines.length})</h2>
        {activeRoutines.length === 0 ? (
          <div className="empty-state">
            <h3>No Active Routines</h3>
            <p>Create a routine or activate an existing one to get started.</p>
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
        <h2>All Routines ({routines.length})</h2>
        {routines.length === 0 ? (
          <div className="empty-state">
            <h3>No Routines Found</h3>
            <p>Create your first routine to start tracking your workouts.</p>
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
        <h2>Routine Templates ({templates.length})</h2>
        {templates.length === 0 ? (
          <div className="empty-state">
            <h3>No Templates Available</h3>
            <p>No routine templates are currently available.</p>
          </div>
        ) : (
          templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onCreateFromTemplate={() => {
                setSelectedTemplate(template);
                setTemplateName(`${template.name} Copy`);
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
            View
          </button>
          {!isActive && (
            <button
              className="btn-primary"
              onClick={() => onActivate(routine.id)}
              disabled={isLoading}
            >
              Activate
            </button>
          )}
          <button
            className="btn-danger"
            onClick={() => onDelete(routine.id)}
            disabled={isLoading}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="routine-stats">
        <div className="stat-item">
          <div className="stat-label">Exercises</div>
          <div className="stat-value">{routine.exercise_count}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Days</div>
          <div className="stat-value">{routine.day_count}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Status</div>
          <div className="stat-value">{isActive ? 'Active' : 'Inactive'}</div>
        </div>
      </div>

      <div className="routine-days">
        {routine.day_count > 0 && (
          <span className="day-badge">
            {routine.day_count} day{routine.day_count !== 1 ? 's' : ''}
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
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="template-card">
      <div className="template-badge">Template</div>
      <div className="routine-header">
        <div>
          <div className="routine-title">{template.name}</div>
          {template.description && (
            <div className="routine-description">{template.description}</div>
          )}
        </div>
        <div className="routine-actions">
          <button className="btn-primary" onClick={onCreateFromTemplate}>
            Use Template
          </button>
        </div>
      </div>

      <div className="routine-stats">
        <div className="stat-item">
          <div className="stat-label">Exercises</div>
          <div className="stat-value">{template.exercises.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Days</div>
          <div className="stat-value">{template.days.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Main Lifts</div>
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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Routine</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Routine Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                required
                placeholder="Enter routine name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-input form-textarea"
                placeholder="Optional description"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="exercises">Exercises</label>
              <input
                type="text"
                id="exercises"
                name="exercises"
                className="form-input"
                required
                placeholder="Pull-ups, Dips, Muscle-ups (comma separated)"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="main_lifts">Main Lifts</label>
              <input
                type="text"
                id="main_lifts"
                name="main_lifts"
                className="form-input"
                required
                placeholder="Pull-ups, Dips (comma separated)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Training Days</label>
              <div className="checkbox-group">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
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
                  Activate this routine immediately
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Routine'}
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
          <h2>Create from Template</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="template-name">Routine Name</label>
            <input
              type="text"
              id="template-name"
              className="form-input"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter routine name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Template Details</label>
            <div className="routine-stats">
              <div className="stat-item">
                <div className="stat-label">Exercises</div>
                <div className="stat-value">{template.exercises.length}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Days</div>
                <div className="stat-value">{template.days.length}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Main Lifts</div>
                <div className="stat-value">{template.main_lifts.length}</div>
              </div>
            </div>
          </div>

          {template.description && (
            <div className="form-group">
              <label className="form-label">Description</label>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {template.description}
              </p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onSubmit}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? 'Creating...' : 'Create Routine'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutinesPage; 