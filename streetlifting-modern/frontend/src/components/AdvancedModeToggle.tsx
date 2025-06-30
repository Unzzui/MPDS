import React, { useState } from 'react';
import { useAdaptation, UserExperienceLevel } from '../contexts/AdaptationContext';

const AdvancedModeToggle: React.FC = () => {
  const { 
    effectiveLevel, 
    hasManualOverride, 
    setManualLevel, 
    removeManualOverride,
    getFeatureSuggestions 
  } = useAdaptation();
  
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showFeatureSuggestions, setShowFeatureSuggestions] = useState(false);
  const [featureSuggestions, setFeatureSuggestions] = useState<any>(null);

  const isAdvanced = effectiveLevel === UserExperienceLevel.ADVANCED || effectiveLevel === UserExperienceLevel.ELITE_ATHLETE;

  const handleToggleAdvanced = async () => {
    if (isAdvanced && hasManualOverride) {
      // If currently in advanced mode with manual override, remove it
      await removeManualOverride();
    } else if (!isAdvanced) {
      // If not in advanced mode, set to advanced
      await setManualLevel(UserExperienceLevel.ADVANCED, 'user_requested_advanced_view');
    } else {
      // Show level selector
      setShowLevelSelector(true);
    }
  };

  const handleShowFeatures = async () => {
    try {
      const suggestions = await getFeatureSuggestions();
      setFeatureSuggestions(suggestions);
      setShowFeatureSuggestions(true);
    } catch (error) {
      console.error('Failed to get feature suggestions:', error);
    }
  };

  const handleLevelSelect = async (level: UserExperienceLevel) => {
    await setManualLevel(level, 'user_selected_level');
    setShowLevelSelector(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-3">
        {/* Feature Discovery Button - ANTI-BIAS FEATURE */}
        <button
          onClick={handleShowFeatures}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center space-x-2"
        >
          <span>🚀</span>
          <span>Explore Features</span>
        </button>

        {/* Advanced Mode Toggle - CRITICAL ANTI-BIAS FEATURE */}
        <button
          onClick={handleToggleAdvanced}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
            isAdvanced
              ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>{isAdvanced ? '⚡' : '🔧'}</span>
          <span>{isAdvanced ? 'Advanced View' : 'Show Advanced'}</span>
        </button>

        {/* Level Override Indicator */}
        {hasManualOverride && (
          <button
            onClick={() => setShowLevelSelector(true)}
            className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors duration-200"
          >
            Override Active
          </button>
        )}
      </div>

      {/* Level Selector Modal */}
      {showLevelSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Experience Level</h3>
            <p className="text-sm text-gray-600 mb-6">
              You can change this anytime. This helps us show you the most relevant features.
            </p>
            
            <div className="space-y-3">
              {Object.values(UserExperienceLevel).map((level) => (
                <LevelOption
                  key={level}
                  level={level}
                  isSelected={level === effectiveLevel}
                  onClick={() => handleLevelSelect(level)}
                />
              ))}
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowLevelSelector(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              
              {hasManualOverride && (
                <button
                  onClick={async () => {
                    await removeManualOverride();
                    setShowLevelSelector(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Use Automatic
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feature Suggestions Modal */}
      {showFeatureSuggestions && featureSuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Discover New Features</h3>
            <p className="text-sm text-gray-600 mb-4">
              {featureSuggestions.message}
            </p>
            
            <div className="space-y-4">
              {featureSuggestions.suggestions?.map((suggestion: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    suggestion.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    suggestion.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {suggestion.difficulty}
                  </span>
                </div>
              )) || (
                <p className="text-sm text-gray-500 italic">
                  You've explored most features! Keep training consistently to unlock more insights.
                </p>
              )}
            </div>
            
            <button
              onClick={() => setShowFeatureSuggestions(false)}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Level option component for the selector
interface LevelOptionProps {
  level: UserExperienceLevel;
  isSelected: boolean;
  onClick: () => void;
}

const LevelOption: React.FC<LevelOptionProps> = ({ level, isSelected, onClick }) => {
  const getLevelInfo = (level: UserExperienceLevel) => {
    switch (level) {
      case UserExperienceLevel.ABSOLUTE_BEGINNER:
        return {
          label: 'Absolute Beginner',
          description: 'New to strength training, need simple guidance',
          icon: '🌱'
        };
      case UserExperienceLevel.COMMITTED_BEGINNER:
        return {
          label: 'Committed Beginner',
          description: 'Consistent trainer, ready for basic periodization',
          icon: '💪'
        };
      case UserExperienceLevel.INTERMEDIATE:
        return {
          label: 'Intermediate',
          description: 'Experienced trainer, want detailed tracking',
          icon: '🏃'
        };
      case UserExperienceLevel.ADVANCED:
        return {
          label: 'Advanced',
          description: 'Serious athlete, need comprehensive tools',
          icon: '🎯'
        };
      case UserExperienceLevel.ELITE_ATHLETE:
        return {
          label: 'Elite Athlete',
          description: 'Professional level, want all features',
          icon: '👑'
        };
      default:
        return {
          label: 'Unknown',
          description: '',
          icon: '❓'
        };
    }
  };

  const levelInfo = getLevelInfo(level);

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{levelInfo.icon}</span>
        <div>
          <h4 className="font-semibold text-gray-900">{levelInfo.label}</h4>
          <p className="text-sm text-gray-600">{levelInfo.description}</p>
        </div>
      </div>
    </button>
  );
};

export default AdvancedModeToggle;
