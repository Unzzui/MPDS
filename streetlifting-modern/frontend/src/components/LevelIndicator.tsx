import React from 'react';
import { UserExperienceLevel } from '../contexts/AdaptationContext';

interface LevelIndicatorProps {
  level: UserExperienceLevel;
  hasOverride: boolean;
}

const LevelIndicator: React.FC<LevelIndicatorProps> = ({ level, hasOverride }) => {
  const getLevelDisplay = (level: UserExperienceLevel) => {
    switch (level) {
      case UserExperienceLevel.ABSOLUTE_BEGINNER:
        return { label: 'Beginner', color: 'bg-green-100 text-green-800', icon: '🌱' };
      case UserExperienceLevel.COMMITTED_BEGINNER:
        return { label: 'Committed', color: 'bg-blue-100 text-blue-800', icon: '💪' };
      case UserExperienceLevel.INTERMEDIATE:
        return { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800', icon: '🏃' };
      case UserExperienceLevel.ADVANCED:
        return { label: 'Advanced', color: 'bg-orange-100 text-orange-800', icon: '🎯' };
      case UserExperienceLevel.ELITE_ATHLETE:
        return { label: 'Elite', color: 'bg-purple-100 text-purple-800', icon: '👑' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: '❓' };
    }
  };

  const levelDisplay = getLevelDisplay(level);

  return (
    <div className="flex items-center space-x-2">
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${levelDisplay.color} flex items-center space-x-2`}>
        <span>{levelDisplay.icon}</span>
        <span>{levelDisplay.label}</span>
        {hasOverride && (
          <span className="text-xs bg-white bg-opacity-50 px-2 py-0.5 rounded">
            Manual
          </span>
        )}
      </div>
    </div>
  );
};

export default LevelIndicator;
