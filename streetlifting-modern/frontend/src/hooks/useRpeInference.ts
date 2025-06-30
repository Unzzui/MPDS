import { useCallback } from 'react';
import type { RpeInference } from '../types';

export const useRpeInference = () => {
  const inferRpe = useCallback((
    completedReps: number,
    targetReps: number,
    failureReps: number = 0
  ): RpeInference => {
    const repCompletion = completedReps / targetReps;
    const totalAttempted = completedReps + failureReps;
    
    let inferredRpe: number;
    let confidence: 'low' | 'medium' | 'high';
    let reasoning: string;

    // Perfect completion (all reps completed, no failures)
    if (repCompletion === 1 && failureReps === 0) {
      if (completedReps <= 3) {
        inferredRpe = 7;
        confidence = 'medium';
        reasoning = 'All reps completed easily - likely RPE 7';
      } else if (completedReps <= 5) {
        inferredRpe = 7.5;
        confidence = 'medium';
        reasoning = 'All reps completed - likely RPE 7-8';
      } else {
        inferredRpe = 8;
        confidence = 'medium';
        reasoning = 'All reps completed - likely RPE 8';
      }
    }
    // Near completion (1-2 reps short)
    else if (repCompletion >= 0.8 && failureReps <= 2) {
      if (failureReps === 1) {
        inferredRpe = 9;
        confidence = 'high';
        reasoning = 'Failed 1 rep - likely RPE 9';
      } else {
        inferredRpe = 9.5;
        confidence = 'high';
        reasoning = 'Failed 2 reps - likely RPE 9-10';
      }
    }
    // Significant failure (3+ reps short)
    else if (repCompletion < 0.8 || failureReps >= 3) {
      inferredRpe = 10;
      confidence = 'high';
      reasoning = 'Multiple failed reps - RPE 10+';
    }
    // Partial completion (less than 80% but no clear failure pattern)
    else {
      inferredRpe = 8.5;
      confidence = 'low';
      reasoning = 'Partial completion - RPE estimate uncertain';
    }

    // Adjust based on total attempted reps
    if (totalAttempted > targetReps + 2) {
      inferredRpe = Math.min(inferredRpe + 0.5, 10);
      reasoning += ' - Multiple attempts suggest higher RPE';
    }

    return {
      completed_reps: completedReps,
      target_reps: targetReps,
      failure_reps: failureReps,
      inferred_rpe: inferredRpe,
      confidence,
      reasoning,
    };
  }, []);

  const getRpeColor = useCallback((rpe: number): string => {
    if (rpe <= 7) return 'var(--accent-primary)'; // Green for easy
    if (rpe <= 8.5) return '#fbbf24'; // Yellow for moderate
    return '#ef4444'; // Red for hard
  }, []);

  const getRpeLabel = useCallback((rpe: number): string => {
    if (rpe <= 7) return 'EASY';
    if (rpe <= 8.5) return 'MODERATE';
    return 'HARD';
  }, []);

  return {
    inferRpe,
    getRpeColor,
    getRpeLabel,
  };
}; 