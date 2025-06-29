import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkouts';

// Simple SVG Icons
const ArrowLeftIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XMarkIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PencilIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// Simple date formatting function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const WorkoutDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workout, isLoading, error } = useWorkout(parseInt(id || '0'));

  const getDayTypeColor = (dayType: string) => {
    switch (dayType?.toLowerCase()) {
      case 'push':
        return 'bg-red-500';
      case 'pull':
        return 'bg-blue-500';
      case 'legs':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDayTypeIcon = (dayType: string) => {
    // No usar emojis, retornar null o un icono SVG si se desea
    return null;
  };

  const getStatusColor = (completed: boolean, inProgress: boolean) => {
    if (completed) return 'bg-green-900 text-green-300';
    if (inProgress) return 'bg-yellow-900 text-yellow-300';
    return 'bg-gray-900 text-gray-300';
  };

  const getStatusText = (completed: boolean, inProgress: boolean) => {
    if (completed) return 'Completed';
    if (inProgress) return 'In Progress';
    return 'Not Started';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" stroke="#ff4444" strokeWidth="4" fill="none" />
            <line x1="16" y1="16" x2="32" y2="32" stroke="#ff4444" strokeWidth="4" />
            <line x1="32" y1="16" x2="16" y2="32" stroke="#ff4444" strokeWidth="4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Workout not found</h3>
        <p className="text-gray-400 mb-4">
          The workout you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          to="/workout/history"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon />
        </button>
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${getDayTypeColor(workout.day_type)}`}></div>
          <h1 className="text-2xl font-bold text-white">
            {workout.day_type} Workout
          </h1>
        </div>
      </div>

      {/* Workout Info */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <CalendarIcon />
            <div>
              <p className="text-sm text-gray-400">Date</p>
              <p className="font-medium text-white">
                {formatDate(workout.date)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ClockIcon />
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workout.completed, workout.in_progress)}`}>
                {getStatusText(workout.completed, workout.in_progress)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <CheckIcon />
            <div>
              <p className="text-sm text-gray-400">Exercises</p>
              <p className="font-medium text-white">{workout.exercises.length}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 text-gray-400"></div>
            <div>
              <p className="text-sm text-gray-400">Total Sets</p>
              <p className="font-medium text-white">
                {workout.exercises.reduce((sum, ex) => sum + 1, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {workout.notes && (
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Notes</h3>
            <p className="text-white">{workout.notes}</p>
          </div>
        )}
      </div>

      {/* Exercises */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Exercises</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/workout/${workout.id}/edit`)}
              className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
              title="Edit workout"
            >
              <PencilIcon />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this workout?')) {
                  // Handle delete
                }
              }}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Delete workout"
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {workout.exercises.length > 0 ? (
            workout.exercises.map((exercise, index) => (
              <div key={exercise.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white">{exercise.name}</h3>
                  <div className="flex items-center space-x-2">
                    {exercise.completed ? (
                      <CheckIcon />
                    ) : (
                      <XMarkIcon />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Weight</p>
                    <p className="font-medium text-white">{exercise.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Reps</p>
                    <p className="font-medium text-white">{exercise.reps}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Set</p>
                    <p className="font-medium text-white">{exercise.set_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">RPE</p>
                    <p className="font-medium text-white">{exercise.rpe || 'N/A'}</p>
                  </div>
                </div>

                {exercise.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-sm text-gray-400">{exercise.notes}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No exercises found for this workout.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailPage; 