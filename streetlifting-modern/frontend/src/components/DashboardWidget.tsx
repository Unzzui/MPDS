import React from 'react';
import { UserExperienceLevel, type DashboardWidget as DashboardWidgetType } from '../contexts/AdaptationContext';

interface DashboardWidgetProps {
  widget: DashboardWidgetType;
  level: UserExperienceLevel;
  onInteraction: (data: Record<string, any>) => void;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ widget, level, onInteraction }) => {
  const renderWidget = () => {
    switch (widget.type) {
      case 'action_button':
        return <ActionButtonWidget widget={widget} level={level} onInteraction={onInteraction} />;
      case 'progress_chart':
        return <ProgressChartWidget widget={widget} level={level} onInteraction={onInteraction} />;
      case 'workout_list':
        return <WorkoutListWidget widget={widget} level={level} onInteraction={onInteraction} />;
      case 'projection_chart':
        return <ProjectionChartWidget widget={widget} level={level} onInteraction={onInteraction} />;
      case 'analytics_panel':
        return <AnalyticsPanelWidget widget={widget} level={level} onInteraction={onInteraction} />;
      default:
        return <DefaultWidget widget={widget} onInteraction={onInteraction} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {renderWidget()}
    </div>
  );
};

// Individual widget components
const ActionButtonWidget: React.FC<DashboardWidgetProps> = ({ widget, level, onInteraction }) => {
  const handleClick = () => {
    onInteraction({ action: 'button_click', widget_id: widget.id });
  };

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
      <button
        onClick={handleClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3"
      >
        <span className="text-2xl">🏋️</span>
        <span>{level === UserExperienceLevel.ABSOLUTE_BEGINNER ? 'Start Workout' : 'Log Workout'}</span>
      </button>
    </div>
  );
};

const ProgressChartWidget: React.FC<DashboardWidgetProps> = ({ widget, onInteraction }) => {
  const complexity = widget.settings?.complexity || 'simple';
  
  const handleViewDetails = () => {
    onInteraction({ action: 'view_details', widget_id: widget.id });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
        <button
          onClick={handleViewDetails}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View Details
        </button>
      </div>
      
      {complexity === 'simple' ? (
        <SimpleProgressChart />
      ) : (
        <DetailedProgressChart />
      )}
    </div>
  );
};

const WorkoutListWidget: React.FC<DashboardWidgetProps> = ({ widget, onInteraction }) => {
  const showDetails = widget.settings?.show_details !== false;
  
  const handleWorkoutClick = (workoutId: string) => {
    onInteraction({ action: 'workout_click', widget_id: widget.id, workout_id: workoutId });
  };

  // Mock workout data
  const recentWorkouts = [
    { id: '1', name: 'Upper Body', date: '2025-06-28', exercises: 5 },
    { id: '2', name: 'Lower Body', date: '2025-06-26', exercises: 4 },
    { id: '3', name: 'Full Body', date: '2025-06-24', exercises: 6 },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
      <div className="space-y-3">
        {recentWorkouts.map((workout) => (
          <div
            key={workout.id}
            onClick={() => handleWorkoutClick(workout.id)}
            className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">{workout.name}</h4>
              <span className="text-sm text-gray-500">{workout.date}</span>
            </div>
            {showDetails && (
              <p className="text-sm text-gray-600 mt-1">{workout.exercises} exercises</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectionChartWidget: React.FC<DashboardWidgetProps> = ({ widget, onInteraction }) => {
  const handleViewProjections = () => {
    onInteraction({ action: 'view_projections', widget_id: widget.id });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
        <button
          onClick={handleViewProjections}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        <ProjectionItem exercise="Bench Press" current="185 lbs" projected="195 lbs" />
        <ProjectionItem exercise="Squat" current="225 lbs" projected="240 lbs" />
        <ProjectionItem exercise="Deadlift" current="275 lbs" projected="290 lbs" />
      </div>
    </div>
  );
};

const AnalyticsPanelWidget: React.FC<DashboardWidgetProps> = ({ widget, onInteraction }) => {
  const handleViewAnalytics = () => {
    onInteraction({ action: 'view_analytics', widget_id: widget.id });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
        <button
          onClick={handleViewAnalytics}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Deep Dive
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <AnalyticCard title="Weekly Volume" value="15,240 lbs" trend="+5.2%" />
        <AnalyticCard title="Consistency" value="92%" trend="+2.1%" />
        <AnalyticCard title="Intensity" value="78% 1RM" trend="-1.5%" />
        <AnalyticCard title="Recovery" value="Good" trend="stable" />
      </div>
    </div>
  );
};

const DefaultWidget: React.FC<Pick<DashboardWidgetProps, 'widget' | 'onInteraction'>> = ({ widget, onInteraction }) => {
  const handleClick = () => {
    onInteraction({ action: 'widget_click', widget_id: widget.id });
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{widget.title}</h3>
      <p className="text-gray-600">Widget type: {widget.type}</p>
    </div>
  );
};

// Helper components
const SimpleProgressChart: React.FC = () => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-600">Overall Progress</span>
      <span className="text-lg font-semibold text-green-600">+12%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div className="bg-green-500 h-3 rounded-full" style={{ width: '68%' }}></div>
    </div>
    <p className="text-xs text-gray-500 mt-2">Great progress this month!</p>
  </div>
);

const DetailedProgressChart: React.FC = () => (
  <div className="space-y-4">
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-blue-600">+8.5%</p>
          <p className="text-xs text-gray-600">Strength</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600">+12%</p>
          <p className="text-xs text-gray-600">Volume</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-600">94%</p>
          <p className="text-xs text-gray-600">Consistency</p>
        </div>
      </div>
    </div>
  </div>
);

interface ProjectionItemProps {
  exercise: string;
  current: string;
  projected: string;
}

const ProjectionItem: React.FC<ProjectionItemProps> = ({ exercise, current, projected }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div>
      <h4 className="font-medium text-gray-900">{exercise}</h4>
      <p className="text-sm text-gray-600">Current: {current}</p>
    </div>
    <div className="text-right">
      <p className="font-semibold text-blue-600">{projected}</p>
      <p className="text-xs text-gray-500">Projected</p>
    </div>
  </div>
);

interface AnalyticCardProps {
  title: string;
  value: string;
  trend: string;
}

const AnalyticCard: React.FC<AnalyticCardProps> = ({ title, value, trend }) => (
  <div className="text-center">
    <p className="text-lg font-semibold text-gray-900">{value}</p>
    <p className="text-xs text-gray-600">{title}</p>
    <p className={`text-xs ${
      trend.startsWith('+') ? 'text-green-600' : 
      trend.startsWith('-') ? 'text-red-600' : 
      'text-gray-500'
    }`}>
      {trend}
    </p>
  </div>
);

export default DashboardWidget;
