import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { OneRepMax, OneRepMaxCreate } from '../types';

export const useOneRepMaxes = () => {
  const queryClient = useQueryClient();

  // Get all OneRepMax records
  const {
    data: oneRepMaxes = [],
    isLoading: isLoadingOneRepMaxes,
    error: oneRepMaxesError,
  } = useQuery({
    queryKey: ['one-rep-maxes'],
    queryFn: async () => {
      try {
        console.log('Fetching OneRepMax records...');
        const result = await apiService.getOneRepMaxes();
        console.log('OneRepMax records fetched successfully:', result);
        return result;
      } catch (error) {
        console.error('Error fetching OneRepMax records:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Create OneRepMax mutation
  const createOneRepMaxMutation = useMutation({
    mutationFn: apiService.createOneRepMax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-rep-maxes'] });
    },
  });

  // Update OneRepMax mutation
  const updateOneRepMaxMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<OneRepMax> }) =>
      apiService.updateOneRepMax(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-rep-maxes'] });
    },
  });

  // Delete OneRepMax mutation
  const deleteOneRepMaxMutation = useMutation({
    mutationFn: apiService.deleteOneRepMax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-rep-maxes'] });
    },
  });

  // Get OneRepMax by exercise
  const getOneRepMaxByExercise = (exercise: string) => {
    return oneRepMaxes.filter(rm => rm.exercise === exercise);
  };

  // Get latest OneRepMax for each exercise
  const getLatestOneRepMaxes = () => {
    const latestByExercise: { [key: string]: OneRepMax } = {};
    
    oneRepMaxes.forEach(rm => {
      if (!latestByExercise[rm.exercise] || 
          new Date(rm.date_achieved) > new Date(latestByExercise[rm.exercise].date_achieved)) {
        latestByExercise[rm.exercise] = rm;
      }
    });
    
    return Object.values(latestByExercise);
  };

  // Get progress data for charting
  const getProgressData = (exercise: string) => {
    const exerciseRecords = getOneRepMaxByExercise(exercise);
    return exerciseRecords
      .sort((a, b) => new Date(a.date_achieved).getTime() - new Date(b.date_achieved).getTime())
      .map(rm => ({
        date: rm.date_achieved,
        value: rm.one_rm,
        label: `${rm.one_rm}kg`
      }));
  };

  return {
    // Data
    oneRepMaxes,
    latestOneRepMaxes: getLatestOneRepMaxes(),
    
    // Loading states
    isLoadingOneRepMaxes,
    
    // Error states
    oneRepMaxesError,
    
    // Mutations
    createOneRepMax: createOneRepMaxMutation.mutate,
    updateOneRepMax: updateOneRepMaxMutation.mutate,
    deleteOneRepMax: deleteOneRepMaxMutation.mutate,
    
    // Mutation states
    isCreatingOneRepMax: createOneRepMaxMutation.isPending,
    isUpdatingOneRepMax: updateOneRepMaxMutation.isPending,
    isDeletingOneRepMax: deleteOneRepMaxMutation.isPending,
    
    // Mutation errors
    createOneRepMaxError: createOneRepMaxMutation.error,
    updateOneRepMaxError: updateOneRepMaxMutation.error,
    deleteOneRepMaxError: deleteOneRepMaxMutation.error,
    
    // Utility functions
    getOneRepMaxByExercise,
    getProgressData,
  };
}; 