import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkouts } from '../hooks/useWorkouts';
import type { WorkoutSummary } from '../types';

// Simple SVG Icons
const CalendarIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

const formatMonth = (monthIndex: number) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthIndex];
};

const WorkoutHistoryPage: React.FC = () => {
  const { workouts, isLoading, deleteWorkout, deleteWorkoutLoading } = useWorkouts();
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Filter workouts by month and year
  const filteredWorkouts = workouts?.filter((workout: WorkoutSummary) => {
    const workoutDate = new Date(workout.date);
    const workoutMonth = workoutDate.getMonth() + 1;
    const workoutYear = workoutDate.getFullYear();

    if (selectedMonth && workoutMonth !== parseInt(selectedMonth)) return false;
    if (selectedYear && workoutYear !== parseInt(selectedYear)) return false;
    
    return true;
  }) || [];

  // Get unique months and years for filters
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: formatMonth(i)
  }));

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const getDayTypeColor = (dayType: string) => {
    switch (dayType.toLowerCase()) {
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
    switch (dayType.toLowerCase()) {
      case 'push':
        return '🔥';
      case 'pull':
        return '💪';
      case 'legs':
        return '🦵';
      default:
        return '🏋️';
    }
  };

  const handleDelete = async (workoutId: number) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await deleteWorkout(workoutId);
      } catch (error) {
        console.error('Failed to delete workout:', error);
      }
    }
  };

  const clearFilters = () => {
    setSelectedMonth('');
    setSelectedYear('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Workout History</h1>
        <p className="text-gray-400">
          Track your progress and review past workouts
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Filters</h2>
          <button
            onClick={clearFilters}
            className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors"
          >
            Clear filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All months</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All years</option>
              {years.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md">
              <p className="text-sm text-gray-400">
                {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workouts List */}
      <div className="bg-gray-800 rounded-lg p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredWorkouts.length > 0 ? (
          <div className="space-y-4">
            {filteredWorkouts.map((workout: WorkoutSummary) => (
              <div
                key={workout.id}
                className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getDayTypeColor(workout.day_type)}`}></div>
                    <div>
                      <h3 className="font-medium text-white">
                        {workout.day_type} Day
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <CalendarIcon />
                          <span className="ml-1">{formatDate(workout.date)}</span>
                        </span>
                        <span>{workout.exercise_count} exercises</span>
                        <span>{workout.total_sets} sets</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getDayTypeIcon(workout.day_type)}</span>
                    
                    {/* Status indicator */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      workout.completed 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-yellow-900 text-yellow-300'
                    }`}>
                      {workout.completed ? 'Completed' : 'In Progress'}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/workout/${workout.id}`}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="View workout"
                      >
                        <EyeIcon />
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(workout.id)}
                        disabled={deleteWorkoutLoading}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete workout"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">No workouts found</h3>
            <p className="text-gray-400 mb-6">
              {selectedMonth || selectedYear 
                ? 'Try adjusting your filters or log your first workout.'
                : 'Start your fitness journey by logging your first workout!'
              }
            </p>
            <Link
              to="/workout-logger/Push"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Log Workout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutHistoryPage; 