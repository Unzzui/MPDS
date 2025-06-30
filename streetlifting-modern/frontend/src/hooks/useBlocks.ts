import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { TrainingBlock, TrainingBlockCreate, BlockProgress } from '../types';

export const useBlocks = () => {
  const queryClient = useQueryClient();

  // Get all training blocks
  const {
    data: blocks = [],
    isLoading: isLoadingBlocks,
    error: blocksError,
  } = useQuery({
    queryKey: ['blocks'],
    queryFn: apiService.getAllBlocks,
  });

  // Get current active block
  const {
    data: currentBlock,
    isLoading: isLoadingCurrentBlock,
    error: currentBlockError,
  } = useQuery({
    queryKey: ['blocks', 'current'],
    queryFn: apiService.getCurrentBlock,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors (no current block)
      if (error?.response?.status === 404) {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
  });

  // Create new block mutation
  const createBlockMutation = useMutation({
    mutationFn: apiService.createBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
    },
  });

  // Update block mutation
  const updateBlockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TrainingBlockCreate> }) =>
      apiService.updateBlock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
    },
  });

  // Delete block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: apiService.deleteBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
    },
  });

  // Activate block mutation
  const activateBlockMutation = useMutation({
    mutationFn: apiService.activateBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
      queryClient.invalidateQueries({ queryKey: ['blocks', 'current'] });
    },
  });

  return {
    // Data
    blocks,
    currentBlock,
    
    // Loading states
    isLoadingBlocks,
    isLoadingCurrentBlock,
    
    // Error states
    blocksError,
    currentBlockError,
    
    // Mutations
    createBlock: createBlockMutation.mutate,
    updateBlock: updateBlockMutation.mutate,
    deleteBlock: deleteBlockMutation.mutate,
    activateBlock: activateBlockMutation.mutate,
    
    // Mutation states
    isCreatingBlock: createBlockMutation.isPending,
    isUpdatingBlock: updateBlockMutation.isPending,
    isDeletingBlock: deleteBlockMutation.isPending,
    isActivatingBlock: activateBlockMutation.isPending,
    
    // Mutation errors
    createBlockError: createBlockMutation.error,
    updateBlockError: updateBlockMutation.error,
    deleteBlockError: deleteBlockMutation.error,
    activateBlockError: activateBlockMutation.error,
  };
};

export const useBlockProgress = (blockId: string) => {
  const {
    data: progress,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['blocks', blockId, 'progress'],
    queryFn: () => apiService.getBlockProgress(blockId),
    enabled: !!blockId,
  });

  return {
    progress,
    isLoading,
    error,
  };
};

export const useWeeklyProjections = (blockId: string) => {
  const {
    data: projections,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['blocks', blockId, 'projections'],
    queryFn: () => apiService.getWeeklyProjections(blockId),
    enabled: !!blockId,
  });

  return {
    projections,
    isLoading,
    error,
  };
};

export const useRpeTables = (blockId: string) => {
  const {
    data: rpeTables,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['blocks', blockId, 'rpe-tables'],
    queryFn: () => apiService.getRpeTables(blockId),
    enabled: !!blockId,
  });

  return {
    rpeTables,
    isLoading,
    error,
  };
}; 