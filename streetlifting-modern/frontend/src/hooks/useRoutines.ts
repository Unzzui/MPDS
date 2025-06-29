import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { 
  Routine, RoutineCreate, RoutineUpdate, RoutineSummary, 
  RoutineTemplate, RoutineExercise, RoutineExerciseCreate 
} from '../types';

export const useRoutines = () => {
  const queryClient = useQueryClient();

  // Get all routines
  const {
    data: routines = [],
    isLoading: isLoadingRoutines,
    error: routinesError,
  } = useQuery({
    queryKey: ['routines'],
    queryFn: async () => {
      try {
        console.log('Fetching routines...');
        const result = await apiService.getRoutines();
        console.log('Routines fetched successfully:', result);
        return result;
      } catch (error) {
        console.error('Error fetching routines:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Get active routines
  const {
    data: activeRoutines = [],
    isLoading: isLoadingActiveRoutines,
    error: activeRoutinesError,
  } = useQuery({
    queryKey: ['routines', 'active'],
    queryFn: async () => {
      try {
        console.log('Fetching active routines...');
        const result = await apiService.getActiveRoutines();
        console.log('Active routines fetched successfully:', result);
        return result;
      } catch (error) {
        console.error('Error fetching active routines:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Get routine templates
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useQuery({
    queryKey: ['routines', 'templates'],
    queryFn: async () => {
      try {
        console.log('Fetching routine templates...');
        const result = await apiService.getRoutineTemplates();
        console.log('Routine templates fetched successfully:', result);
        return result;
      } catch (error) {
        console.error('Error fetching routine templates:', error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Create routine mutation
  const createRoutineMutation = useMutation({
    mutationFn: apiService.createRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });

  // Update routine mutation
  const updateRoutineMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoutineUpdate }) =>
      apiService.updateRoutine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });

  // Delete routine mutation
  const deleteRoutineMutation = useMutation({
    mutationFn: apiService.deleteRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });

  // Activate routine mutation
  const activateRoutineMutation = useMutation({
    mutationFn: apiService.activateRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['routines', 'active'] });
    },
  });

  // Create from template mutation
  const createFromTemplateMutation = useMutation({
    mutationFn: ({ templateId, name }: { templateId: number; name: string }) =>
      apiService.createFromTemplate(templateId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });

  return {
    // Data
    routines,
    activeRoutines,
    templates,
    
    // Loading states
    isLoadingRoutines,
    isLoadingActiveRoutines,
    isLoadingTemplates,
    
    // Error states
    routinesError,
    activeRoutinesError,
    templatesError,
    
    // Mutations
    createRoutine: createRoutineMutation.mutate,
    updateRoutine: updateRoutineMutation.mutate,
    deleteRoutine: deleteRoutineMutation.mutate,
    activateRoutine: activateRoutineMutation.mutate,
    createFromTemplate: createFromTemplateMutation.mutate,
    
    // Mutation states
    isCreatingRoutine: createRoutineMutation.isPending,
    isUpdatingRoutine: updateRoutineMutation.isPending,
    isDeletingRoutine: deleteRoutineMutation.isPending,
    isActivatingRoutine: activateRoutineMutation.isPending,
    isCreatingFromTemplate: createFromTemplateMutation.isPending,
    
    // Mutation errors
    createRoutineError: createRoutineMutation.error,
    updateRoutineError: updateRoutineMutation.error,
    deleteRoutineError: deleteRoutineMutation.error,
    activateRoutineError: activateRoutineMutation.error,
    createFromTemplateError: createFromTemplateMutation.error,
  };
};

export const useRoutine = (id: number) => {
  const queryClient = useQueryClient();

  const {
    data: routine,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['routines', id],
    queryFn: () => apiService.getRoutine(id),
    enabled: !!id,
  });

  return {
    routine,
    isLoading,
    error,
  };
};

export const useRoutinesByDay = (day: number) => {
  const {
    data: routines = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['routines', 'day', day],
    queryFn: () => apiService.getRoutinesByDay(day),
    enabled: day >= 1 && day <= 7,
  });

  return {
    routines,
    isLoading,
    error,
  };
};

export const useRoutineExercises = (routineId: number) => {
  const queryClient = useQueryClient();

  const {
    data: exercises = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['routines', routineId, 'exercises'],
    queryFn: () => apiService.getRoutineExercises(routineId),
    enabled: !!routineId,
  });

  // Add exercise mutation
  const addExerciseMutation = useMutation({
    mutationFn: (exercise: RoutineExerciseCreate) =>
      apiService.addRoutineExercise(routineId, exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', routineId, 'exercises'] });
    },
  });

  return {
    exercises,
    isLoading,
    error,
    addExercise: addExerciseMutation.mutate,
    isAddingExercise: addExerciseMutation.isPending,
    addExerciseError: addExerciseMutation.error,
  };
}; 