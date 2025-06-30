import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProgramTemplatesPage.css';

interface ExerciseTemplate {
  name: string;
  category: string;
  sets: number;
  reps: number;
  intensity: string | number;
  rest_seconds: number;
  weight?: number;
  percentage?: number;
  notes?: string;
}

interface ProgramTemplate {
  template_key: string;
  name: string;
  description: string;
  methodology: string;
  duration_weeks: number;
  difficulty_level: string;
  main_lifts: string[];
  frequency_per_week: number;
  estimated_time_per_workout?: number;
  highlights: string[];
  requirements: string[];
}

interface UserRMData {
  pullups: number;
  dips: number;
  muscle_ups: number;
  squats: number;
  deadlift: number;
  bench_press: number;
  overhead_press: number;
}

const ProgramTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ProgramTemplate | null>(null);
  const [userRMs, setUserRMs] = useState<UserRMData>({
    pullups: 0,
    dips: 0,
    muscle_ups: 0,
    squats: 0,
    deadlift: 0,
    bench_press: 0,
    overhead_press: 0
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Select template, 2: Enter RMs, 3: Confirm
  const [filterLevel, setFilterLevel] = useState<string>('all');

  useEffect(() => {
    fetchTemplates();
    fetchUserRMs();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/programs/templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      setError('Failed to load program templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRMs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/programs/one-rep-maxes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const rmData: UserRMData = {
          pullups: 0,
          dips: 0,
          muscle_ups: 0,
          squats: 0,
          deadlift: 0,
          bench_press: 0,
          overhead_press: 0
        };
        
        data.forEach((rm: any) => {
          if (rm.exercise in rmData) {
            rmData[rm.exercise as keyof UserRMData] = rm.one_rm;
          }
        });
        
        setUserRMs(rmData);
      }
    } catch (error) {
      console.error('Failed to fetch user RMs:', error);
    }
  };

  const handleTemplateSelect = (template: ProgramTemplate) => {
    setSelectedTemplate(template);
    setStep(2);
  };

  const handleRMChange = (exercise: keyof UserRMData, value: number) => {
    setUserRMs(prev => ({
      ...prev,
      [exercise]: value
    }));
  };

  const handleGenerateProgram = async () => {
    if (!selectedTemplate) return;
    
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/programs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template_key: selectedTemplate.template_key,
          start_date: new Date().toISOString().split('T')[0],
          user_rms: userRMs
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate program');
      
      const result = await response.json();
      
      if (result.success) {
        navigate(`/program-overview/${result.block_id}`);
      }
    } catch (error) {
      setError('Failed to generate program');
    } finally {
      setGenerating(false);
    }
  };

  const filteredTemplates = templates.filter(template => 
    filterLevel === 'all' || template.difficulty_level === filterLevel
  );

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#2196F3';
    }
  };

  const getMethodologyIcon = (methodology: string) => {
    switch (methodology) {
      case 'linear_progression': return 'LP';
      case '531': return '531';
      case 'conjugate': return 'CJ';
      case 'block_periodization': return 'BP';
      default: return 'TR';
    }
  };

  if (loading) {
    return (
      <div className="program-templates-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading program templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="program-templates-page">
      <div className="page-header">
        <h1>Choose Your Training Program</h1>
        <p>Select a program template based on your experience level and goals</p>
      </div>

      {step === 1 && (
        <div className="template-selection">
          <div className="filter-bar">
            <label>Filter by level:</label>
            <select 
              value={filterLevel} 
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="templates-grid">
            {filteredTemplates.map((template) => (
              <div 
                key={template.template_key}
                className="template-card"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="template-header">
                  <div className="template-icon">
                    {getMethodologyIcon(template.methodology)}
                  </div>
                  <div className="template-title">
                    <h3>{template.name}</h3>
                    <span 
                      className="difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(template.difficulty_level) }}
                    >
                      {template.difficulty_level}
                    </span>
                  </div>
                </div>

                <p className="template-description">{template.description}</p>

                <div className="template-stats">
                  <div className="stat">
                    <span className="stat-label">Duration</span>
                    <span className="stat-value">{template.duration_weeks} weeks</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Frequency</span>
                    <span className="stat-value">{template.frequency_per_week}x/week</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Time/Session</span>
                    <span className="stat-value">{template.estimated_time_per_workout || 60} min</span>
                  </div>
                </div>

                <div className="template-highlights">
                  <h4>Highlights:</h4>
                  <ul>
                    {template.highlights.slice(0, 3).map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>

                <div className="template-requirements">
                  <h4>Requirements:</h4>
                  <ul>
                    {template.requirements.slice(0, 2).map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>

                <div className="template-footer">
                  <button className="select-template-btn">
                    Select This Program
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && selectedTemplate && (
        <div className="rm-input-section">
          <div className="section-header">
            <h2>Enter Your 1RM (One Rep Max)</h2>
            <p>Enter your current 1RM for each exercise. This will be used to calculate your training weights.</p>
          </div>

          <div className="selected-template-info">
            <h3>Selected Program: {selectedTemplate.name}</h3>
            <p>Main lifts: {selectedTemplate.main_lifts.join(', ')}</p>
          </div>

          <div className="rm-inputs">
            {Object.entries(userRMs).map(([exercise, value]) => (
              <div key={exercise} className="rm-input-group">
                <label>{exercise.replace('_', ' ').toUpperCase()}</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={value || ''}
                    onChange={(e) => handleRMChange(exercise as keyof UserRMData, parseFloat(e.target.value) || 0)}
                    placeholder="Enter 1RM"
                    min="0"
                    step="0.5"
                  />
                  <span className="unit">kg</span>
                </div>
              </div>
            ))}
          </div>

          <div className="navigation-buttons">
            <button 
              className="btn-secondary"
              onClick={() => setStep(1)}
            >
              Back to Templates
            </button>
            <button 
              className="btn-primary"
              onClick={() => setStep(3)}
              disabled={Object.values(userRMs).every(rm => rm === 0)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && selectedTemplate && (
        <div className="confirmation-section">
          <div className="section-header">
            <h2>Confirm Program Generation</h2>
            <p>Review your selections before generating your personalized training program.</p>
          </div>

          <div className="confirmation-details">
            <div className="program-summary">
              <h3>Program: {selectedTemplate.name}</h3>
              <p>{selectedTemplate.description}</p>
              
              <div className="summary-stats">
                <div className="stat">
                  <strong>Duration:</strong> {selectedTemplate.duration_weeks} weeks
                </div>
                <div className="stat">
                  <strong>Frequency:</strong> {selectedTemplate.frequency_per_week} days per week
                </div>
                <div className="stat">
                  <strong>Methodology:</strong> {selectedTemplate.methodology.replace('_', ' ')}
                </div>
              </div>
            </div>

            <div className="rm-summary">
              <h4>Your 1RM Values:</h4>
              <div className="rm-list">
                {Object.entries(userRMs)
                  .filter(([_, value]) => value > 0)
                  .map(([exercise, value]) => (
                    <div key={exercise} className="rm-item">
                      <span>{exercise.replace('_', ' ').toUpperCase()}</span>
                      <span>{value} kg</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="generation-info">
            <h4>What happens next?</h4>
            <ul>
              <li>Your complete {selectedTemplate.duration_weeks}-week program will be generated</li>
              <li>Each workout will have specific weights, sets, and reps calculated</li>
              <li>You'll be able to track your progress and mark workouts as completed</li>
              <li>The program will automatically adjust based on your performance</li>
            </ul>
          </div>

          <div className="navigation-buttons">
            <button 
              className="btn-secondary"
              onClick={() => setStep(2)}
            >
              Back to 1RM Entry
            </button>
            <button 
              className="btn-primary generate-btn"
              onClick={handleGenerateProgram}
              disabled={generating}
            >
              {generating ? (
                <>
                  <div className="spinner-small"></div>
                  Generating Program...
                </>
              ) : (
                'Generate My Program'
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default ProgramTemplatesPage;
