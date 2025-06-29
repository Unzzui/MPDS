import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { WorkoutCreate, WorkoutUpdate, WorkoutProgress } from '../types';

export const useWorkouts = (params?: {
  skip?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  day_type?: string;
}) => {
  const queryClient = useQueryClient();

  // Get workouts
  const { data: workouts, isLoading, error } = useQuery({
    queryKey: ['workouts', params],
    queryFn: () => apiService.getWorkouts(params),
  });

  // Create workout mutation
  const createWorkoutMutation = useMutation({
    mutationFn: (workout: WorkoutCreate) => apiService.createWorkout(workout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  // Update workout mutation
  const updateWorkoutMutation = useMutation({
    mutationFn: ({ id, workout }: { id: number; workout: WorkoutUpdate }) =>
      apiService.updateWorkout(id, workout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  // Delete workout mutation
  const deleteWorkoutMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: (progress: WorkoutProgress) => apiService.saveWorkoutProgress(progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  // Complete workout mutation
  const completeWorkoutMutation = useMutation({
    mutationFn: (id: number) => apiService.completeWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  return {
    workouts,
    isLoading,
    error,
    createWorkout: createWorkoutMutation.mutate,
    createWorkoutLoading: createWorkoutMutation.isPending,
    updateWorkout: updateWorkoutMutation.mutate,
    updateWorkoutLoading: updateWorkoutMutation.isPending,
    deleteWorkout: deleteWorkoutMutation.mutate,
    deleteWorkoutLoading: deleteWorkoutMutation.isPending,
    saveProgress: saveProgressMutation.mutate,
    saveProgressLoading: saveProgressMutation.isPending,
    completeWorkout: completeWorkoutMutation.mutate,
    completeWorkoutLoading: completeWorkoutMutation.isPending,
  };
};

export const useWorkout = (id: number) => {
  const { data: workout, isLoading, error } = useQuery({
    queryKey: ['workout', id],
    queryFn: () => apiService.getWorkout(id),
    enabled: !!id,
  });

  return {
    workout,
    isLoading,
    error,
  };
};

export const usePendingWorkouts = () => {
  const { data: pendingWorkouts, isLoading, error } = useQuery({
    queryKey: ['pending-workouts'],
    queryFn: apiService.getPendingWorkouts,
  });

  return {
    pendingWorkouts,
    isLoading,
    error,
  };
};

export const useWorkoutStats = (params?: {
  start_date?: string;
  end_date?: string;
}) => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['workout-stats', params],
    queryFn: () => apiService.getWorkoutStats(params),
  });

  return {
    stats,
    isLoading,
    error,
  };
}; 