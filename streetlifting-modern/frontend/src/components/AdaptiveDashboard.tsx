import React, { useEffect } from 'react';
import { useAdaptation, UserExperienceLevel } from '../contexts/AdaptationContext';
import DashboardWidget from './DashboardWidget';
import DiscoveryHints from './DiscoveryHints';
import LevelIndicator from './LevelIndicator';
import AdvancedModeToggle from './AdvancedModeToggle';

const AdaptiveDashboard: React.FC = () => {
  const {
    isLoading,
    effectiveLevel,
    hasManualOverride,
    visibleWidgets,
    discoveryHints,
    suggestedActions,
    levelProgression,
    trackInteraction,
    shouldShowFeature,
    shouldShowAdvanced,
  } = useAdaptation();

  // Track dashboard view
  useEffect(() => {
    trackInteraction({
      interaction_type: 'page_visit',
      interaction_data: {
        page: 'adaptive_dashboard',
        level: effectiveLevel,
        has_override: hasManualOverride,
      },
    });
  }, [effectiveLevel, hasManualOverride]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Personalizing your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with level indicator and advanced mode toggle */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <LevelIndicator level={effectiveLevel} hasOverride={hasManualOverride} />
        </div>
        
        {/* CRITICAL ANTI-BIAS FEATURE: Always visible advanced mode toggle */}
        <AdvancedModeToggle />
      </div>

      {/* Level progression indicator */}
      {levelProgression && levelProgression.next_level && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-blue-900">Your Progress</h3>
            <span className="text-sm text-blue-600 font-medium">
              {Math.round(levelProgression.progress_to_next)}% to {levelProgression.next_level}
            </span>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-3 mb-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${levelProgression.progress_to_next}%` }}
            ></div>
          </div>
          
          {levelProgression.can_advance && (
            <p className="text-sm text-blue-700">
              🎉 You're ready to advance! Keep up the great work.
            </p>
          )}
          
          {levelProgression.areas_to_improve.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-blue-700 mb-2">Areas to focus on:</p>
              <ul className="text-sm text-blue-600 space-y-1">
                {levelProgression.areas_to_improve.slice(0, 2).map((area, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Discovery hints - ANTI-BIAS FEATURE */}
      {discoveryHints.length > 0 && (
        <DiscoveryHints hints={discoveryHints} />
      )}

      {/* Main dashboard content */}
      <div className="grid gap-6">
        {/* Quick actions for different levels */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestedActions.map((action, index) => (
              <ActionButton
                key={index}
                action={action}
                level={effectiveLevel}
                onAction={() => trackInteraction({
                  interaction_type: 'feature_use',
                  interaction_data: { feature: `quick_action_${action}` }
                })}
              />
            ))}
          </div>
        </div>

        {/* Adaptive widgets */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {visibleWidgets.map((widget) => (
            <DashboardWidget
              key={widget.id}
              widget={widget}
              level={effectiveLevel}
              onInteraction={(data) => trackInteraction({
                interaction_type: 'feature_use',
                interaction_data: { feature: `widget_${widget.id}`, ...data }
              })}
            />
          ))}
        </div>

        {/* Advanced features section - only shown for higher levels */}
        {shouldShowAdvanced() && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shouldShowFeature('analytics') && (
                <AdvancedFeatureCard
                  title="Deep Analytics"
                  description="Analyze training patterns and performance"
                  icon="📊"
                  onClick={() => trackInteraction({
                    interaction_type: 'feature_use',
                    interaction_data: { feature: 'advanced_analytics' }
                  })}
                />
              )}
              
              {shouldShowFeature('manual_overrides') && (
                <AdvancedFeatureCard
                  title="Program Customization"
                  description="Fine-tune your training parameters"
                  icon="⚙️"
                  onClick={() => trackInteraction({
                    interaction_type: 'feature_use',
                    interaction_data: { feature: 'manual_programming' }
                  })}
                />
              )}
              
              <AdvancedFeatureCard
                title="Data Export"
                description="Export your training data"
                icon="📈"
                onClick={() => trackInteraction({
                  interaction_type: 'feature_use',
                  interaction_data: { feature: 'data_export' }
                })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick action button component
interface ActionButtonProps {
  action: string;
  level: UserExperienceLevel;
  onAction: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ action, level, onAction }) => {
  const getActionConfig = (action: string) => {
    switch (action) {
      case 'Log Today\'s Workout':
        return {
          icon: '🏋️',
          color: 'bg-blue-600 hover:bg-blue-700',
          text: level === UserExperienceLevel.ABSOLUTE_BEGINNER ? 'Start Workout' : action
        };
      case 'View Progress':
        return { icon: '📈', color: 'bg-green-600 hover:bg-green-700', text: action };
      case 'Create Routine':
        return { icon: '📋', color: 'bg-purple-600 hover:bg-purple-700', text: action };
      case 'Plan Training Block':
        return { icon: '🎯', color: 'bg-orange-600 hover:bg-orange-700', text: action };
      case 'Analyze Progress':
        return { icon: '🔍', color: 'bg-indigo-600 hover:bg-indigo-700', text: action };
      default:
        return { icon: '⭐', color: 'bg-gray-600 hover:bg-gray-700', text: action };
    }
  };

  const config = getActionConfig(action);

  return (
    <button
      onClick={onAction}
      className={`${config.color} text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2`}
    >
      <span className="text-lg">{config.icon}</span>
      <span>{config.text}</span>
    </button>
  );
};

// Advanced feature card component
interface AdvancedFeatureCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

const AdvancedFeatureCard: React.FC<AdvancedFeatureCardProps> = ({
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-center space-x-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default AdaptiveDashboard;
