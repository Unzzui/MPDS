import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProgramOverviewPage.css';

interface Exercise {
  name: string;
  category: string;
  sets: number;
  reps: number;
  weight: number | string;
  intensity?: string;
  rest_seconds: number;
  notes?: string;
}

interface PlannedWorkout {
  id: number;
  block_id: number;
  week_number: number;
  day_number: number;
  workout_name: string;
  focus?: string;
  estimated_duration?: number;
  exercises: Exercise[];
  notes?: string;
  is_completed: boolean;
  completed_at?: string;
  created_at?: string;
}

interface BlockStage {
  id?: number;
  block_id: number;
  name: string;
  week_number: number;
  load_percentage: number;
  volume_multiplier: number;
  intensity_focus?: string;
  description?: string;
}

interface WeeklyPlan {
  week_number: number;
  week_dates: Record<string, string>;
  stage_info: BlockStage;
  workouts: PlannedWorkout[];
  weekly_focus: string;
  weekly_notes?: string;
}

interface ProgramOverview {
  block_id: number;
  program_name: string;
  methodology: string;
  current_week: number;
  total_weeks: number;
  progress_percentage: number;
  start_date: string;
  end_date: string;
  current_stage: string;
  next_workout?: PlannedWorkout;
  weekly_schedule: WeeklyPlan[];
}

const ProgramOverviewPage: React.FC = () => {
  const { blockId } = useParams<{ blockId: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<ProgramOverview | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingWorkout, setCompletingWorkout] = useState<number | null>(null);

  useEffect(() => {
    if (blockId) {
      fetchProgramOverview();
    }
  }, [blockId]);

  const fetchProgramOverview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/programs/${blockId}/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch program overview');
      
      const data = await response.json();
      setProgram(data);
      setSelectedWeek(data.current_week || 1);
    } catch (error) {
      setError('Failed to load program overview');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWorkout = async (workoutId: number) => {
    setCompletingWorkout(workoutId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/programs/workouts/${workoutId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workout_id: workoutId,
          completed_exercises: [],
          actual_duration: 60,
          difficulty_rating: 7,
          notes: "Completed via overview page"
        })
      });
      
      if (!response.ok) throw new Error('Failed to complete workout');
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the overview
        await fetchProgramOverview();
        
        // Show achievements if any
        if (result.achievements && result.achievements.length > 0) {
          alert(result.achievements.join('\n'));
        }
      }
    } catch (error) {
      setError('Failed to complete workout');
    } finally {
      setCompletingWorkout(null);
    }
  };

  const formatWeight = (weight: number | string) => {
    if (typeof weight === 'string') return weight;
    return `${weight} kg`;
  };

  const getExerciseIcon = (category: string) => {
    switch (category) {
      case 'main_lift': return '🏋️';
      case 'accessory': return '💪';
      case 'power': return '⚡';
      case 'core': return '🔥';
      case 'conditioning': return '🏃';
      case 'skill': return '🎯';
      default: return '💪';
    }
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayNumber - 1] || `Day ${dayNumber}`;
  };

  if (loading) {
    return (
      <div className="program-overview-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your training program...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="program-overview-page">
        <div className="error-state">
          <h2>Error Loading Program</h2>
          <p>{error || 'Program not found'}</p>
          <button onClick={() => navigate('/program-templates')} className="btn-primary">
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  const currentWeekPlan = program.weekly_schedule.find(week => week.week_number === selectedWeek);

  return (
    <div className="program-overview-page">
      {/* Program Header */}
      <div className="program-header">
        <div className="header-content">
          <div className="program-info">
            <h1>{program.program_name}</h1>
            <p className="methodology">{program.methodology.replace('_', ' ').toUpperCase()}</p>
            <div className="program-dates">
              {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}
            </div>
          </div>
          
          <div className="progress-section">
            <div className="progress-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e1e5e9" strokeWidth="10"/>
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="#667eea" 
                  strokeWidth="10"
                  strokeDasharray={`${program.progress_percentage * 2.83} 283`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="45" textAnchor="middle" className="progress-text">
                  {Math.round(program.progress_percentage)}%
                </text>
                <text x="50" y="58" textAnchor="middle" className="progress-label">
                  Complete
                </text>
              </svg>
            </div>
            
            <div className="week-info">
              <div className="current-week">
                Week {program.current_week} of {program.total_weeks}
              </div>
              <div className="current-stage">
                {program.current_stage}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Workout Card */}
      {program.next_workout && (
        <div className="next-workout-card">
          <div className="card-header">
            <h3>🎯 Next Workout</h3>
            <span className="workout-type">{program.next_workout.focus?.toUpperCase()}</span>
          </div>
          
          <div className="workout-info">
            <h4>{program.next_workout.workout_name}</h4>
            <p>Week {program.next_workout.week_number}, Day {program.next_workout.day_number} • 
               {program.next_workout.estimated_duration} min</p>
          </div>
          
          <div className="exercises-preview">
            {program.next_workout.exercises.slice(0, 3).map((exercise, index) => (
              <div key={index} className="exercise-preview">
                <span className="exercise-icon">{getExerciseIcon(exercise.category)}</span>
                <span className="exercise-name">{exercise.name}</span>
                <span className="exercise-details">
                  {exercise.sets}x{exercise.reps} @ {formatWeight(exercise.weight)}
                </span>
              </div>
            ))}
            {program.next_workout.exercises.length > 3 && (
              <div className="more-exercises">
                +{program.next_workout.exercises.length - 3} more exercises
              </div>
            )}
          </div>
          
          <button 
            className="start-workout-btn"
            onClick={() => navigate(`/workout-logger?workoutId=${program.next_workout?.id}`)}
          >
            Start Workout
          </button>
        </div>
      )}

      {/* Week Navigation */}
      <div className="week-navigation">
        <div className="week-tabs">
          {program.weekly_schedule.map((week) => (
            <button
              key={week.week_number}
              className={`week-tab ${selectedWeek === week.week_number ? 'active' : ''} ${
                week.week_number < program.current_week ? 'completed' : ''
              }`}
              onClick={() => setSelectedWeek(week.week_number)}
            >
              <span className="week-number">Week {week.week_number}</span>
              <span className="week-focus">{week.weekly_focus}</span>
              {week.week_number < program.current_week && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Overview */}
      {currentWeekPlan && (
        <div className="weekly-overview">
          <div className="week-header">
            <div className="week-title">
              <h2>Week {currentWeekPlan.week_number}</h2>
              <span className="week-focus-badge">{currentWeekPlan.weekly_focus}</span>
            </div>
            
            <div className="week-stats">
              <div className="stat">
                <span className="stat-label">Load</span>
                <span className="stat-value">{currentWeekPlan.stage_info.load_percentage}%</span>
              </div>
              <div className="stat">
                <span className="stat-label">Volume</span>
                <span className="stat-value">{Math.round(currentWeekPlan.stage_info.volume_multiplier * 100)}%</span>
              </div>
              <div className="stat">
                <span className="stat-label">Workouts</span>
                <span className="stat-value">{currentWeekPlan.workouts.length}</span>
              </div>
            </div>
          </div>

          {currentWeekPlan.stage_info.description && (
            <div className="week-description">
              <p>{currentWeekPlan.stage_info.description}</p>
            </div>
          )}

          {/* Daily Workouts */}
          <div className="daily-workouts">
            {currentWeekPlan.workouts.map((workout) => (
              <div 
                key={workout.id} 
                className={`workout-card ${workout.is_completed ? 'completed' : ''}`}
              >
                <div className="workout-header">
                  <div className="workout-title">
                    <h4>{workout.workout_name}</h4>
                    <span className="day-info">
                      {getDayName(workout.day_number)} • {workout.estimated_duration} min
                    </span>
                  </div>
                  
                  <div className="workout-status">
                    {workout.is_completed ? (
                      <span className="completed-badge">✓ Completed</span>
                    ) : (
                      <button 
                        className="complete-btn"
                        onClick={() => handleCompleteWorkout(workout.id)}
                        disabled={completingWorkout === workout.id}
                      >
                        {completingWorkout === workout.id ? 'Completing...' : 'Mark Complete'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="exercises-list">
                  {workout.exercises.map((exercise, index) => (
                    <div key={index} className="exercise-row">
                      <span className="exercise-icon">{getExerciseIcon(exercise.category)}</span>
                      <div className="exercise-details">
                        <span className="exercise-name">{exercise.name}</span>
                        <span className="exercise-specs">
                          {exercise.sets} sets × {exercise.reps} reps @ {formatWeight(exercise.weight)}
                        </span>
                        {exercise.rest_seconds && (
                          <span className="rest-time">Rest: {Math.floor(exercise.rest_seconds / 60)}:{(exercise.rest_seconds % 60).toString().padStart(2, '0')}</span>
                        )}
                      </div>
                      <div className="exercise-category">
                        {exercise.category.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>

                {workout.notes && (
                  <div className="workout-notes">
                    <p>{workout.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="btn-secondary"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
        <button 
          className="btn-primary"
          onClick={() => navigate('/program-templates')}
        >
          Create New Program
        </button>
      </div>

      {error && (
        <div className="error-toast">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default ProgramOverviewPage;
