import React from 'react';
import { useBlocks } from '../hooks/useBlocks';
import type { TrainingBlock } from '../types';
import '../styles/BlockIntegration.css';

interface BlockIntegrationProps {
  exerciseName: string;
  currentWeight: number;
  currentReps: number;
  rpe: number;
  onWeightSuggestion?: (weight: number) => void;
}

const BlockIntegration: React.FC<BlockIntegrationProps> = ({
  exerciseName,
  currentWeight,
  currentReps,
  rpe,
  onWeightSuggestion
}) => {
  const { currentBlock } = useBlocks();
  
  if (!currentBlock) {
    return null;
  }
  
  const getExerciseRM = (block: TrainingBlock, exerciseName: string): number => {
    const exerciseMap: { [key: string]: number } = {
      'pull up': block.rm_pullups,
      'pull-up': block.rm_pullups,
      'pullup': block.rm_pullups,
      'pullups': block.rm_pullups,
      'dip': block.rm_dips,
      'dips': block.rm_dips,
      'muscle up': block.rm_muscleups,
      'muscle-up': block.rm_muscleups,
      'muscleup': block.rm_muscleups,
      'muscleups': block.rm_muscleups,
      'squat': block.rm_squats,
      'squats': block.rm_squats,
    };
    
    const normalizedName = exerciseName.toLowerCase().trim();
    return exerciseMap[normalizedName] || 0;
  };
  
  const calculateSuggestedWeight = (): number => {
    const baseRM = getExerciseRM(currentBlock, exerciseName);
    if (baseRM === 0) return 0;
    
    // Apply weekly progression
    const weeklyMultiplier = 1 + ((currentBlock.current_week - 1) * (currentBlock.weekly_increment / 100));
    const projectedRM = baseRM * weeklyMultiplier;
    
    // RPE adjustments
    const rpeAdjustment: { [key: number]: number } = {
      10: 1.0,
      9: 0.97,
      8: 0.94,
      7: 0.91,
      6: 0.88,
      5: 0.85
    };
    
    // Rep adjustments (approximate)
    const repAdjustment: { [key: number]: number } = {
      1: 1.0,
      2: 0.97,
      3: 0.94,
      4: 0.91,
      5: 0.88,
      6: 0.85,
      7: 0.82,
      8: 0.79,
      9: 0.76,
      10: 0.73,
      11: 0.70,
      12: 0.67
    };
    
    const rpeMultiplier = rpeAdjustment[rpe] || 0.85;
    const repMultiplier = repAdjustment[currentReps] || 0.70;
    
    return Math.round(projectedRM * rpeMultiplier * repMultiplier);
  };
  
  const suggestedWeight = calculateSuggestedWeight();
  const baseRM = getExerciseRM(currentBlock, exerciseName);
  
  if (baseRM === 0) {
    return null;
  }
  
  const isSignificantDifference = Math.abs(suggestedWeight - currentWeight) > (suggestedWeight * 0.1);
  
  return (
    <div className="block-integration">
      <div className="block-info-header">
        <span className="block-name">{currentBlock.name}</span>
        <span className="block-week">Semana {currentBlock.current_week}</span>
      </div>
      
      <div className="weight-suggestion">
        <div className="suggestion-row">
          <span className="label">Peso sugerido:</span>
          <span className="suggested-weight">{suggestedWeight} kg</span>
          {isSignificantDifference && (
            <button
              className="apply-suggestion-btn"
              onClick={() => onWeightSuggestion?.(suggestedWeight)}
              title="Aplicar peso sugerido"
            >
              Aplicar
            </button>
          )}
        </div>
        
        <div className="suggestion-details">
          <span className="base-rm">RM Base: {baseRM}</span>
          <span className="progression">+{currentBlock.weekly_increment}%/sem</span>
        </div>
      </div>
      
      {isSignificantDifference && (
        <div className="difference-indicator">
          <span className="difference-text">
            {suggestedWeight > currentWeight ? '+' : ''}
            {suggestedWeight - currentWeight} kg vs actual
          </span>
        </div>
      )}
    </div>
  );
};

export default BlockIntegration;
