export const UserExperienceLevel = {
  ABSOLUTE_BEGINNER: 'absolute_beginner',
  COMMITTED_BEGINNER: 'committed_beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  ELITE_ATHLETE: 'elite_athlete'
} as const;

export type UserExperienceLevel = typeof UserExperienceLevel[keyof typeof UserExperienceLevel];

export const InteractionType = {
  PAGE_VISIT: 'page_visit',
  FEATURE_USE: 'feature_use',
  HELP_REQUEST: 'help_request',
  MANUAL_OVERRIDE: 'manual_override',
  WORKOUT_LOG: 'workout_log',
  DATA_ANALYSIS: 'data_analysis',
  SETTINGS_CHANGE: 'settings_change'
} as const;

export type InteractionType = typeof InteractionType[keyof typeof InteractionType];

export interface UserProfile {
  id: number;
  user_id: number;
  experience_level: UserExperienceLevel;
  manual_override_level?: UserExperienceLevel;
  technical_experience_score: number;
  training_commitment_score: number;
  needs_sophistication_score: number;
  navigation_patterns: Record<string, any>;
  feature_usage_frequency: Record<string, any>;
  session_duration_avg: number;
  terminology_usage: Record<string, any>;
  manual_adjustments_count: number;
  help_requests: Record<string, any>;
  workout_frequency_7d: number;
  workout_frequency_30d: number;
  data_quality_score: number;
  preferred_dashboard_layout: string;
  feature_discovery_enabled: boolean;
  auto_adaptation_enabled: boolean;
  created_at: string;
  updated_at?: string;
  last_level_calculation: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: string;
  settings: Record<string, any>;
  priority: number;
}

export interface DashboardConfiguration {
  id: number;
  experience_level: UserExperienceLevel;
  visible_widgets: string[];
  widget_order: string[];
  widget_settings: Record<string, any>;
  visible_nav_items: string[];
  featured_actions: string[];
  show_advanced_metrics: boolean;
  show_projections: boolean;
  show_analytics: boolean;
  enable_manual_overrides: boolean;
  suggested_features: string[];
  onboarding_flow: string[];
  created_at: string;
  updated_at?: string;
}

export interface AdaptiveDashboardResponse {
  user_level: UserExperienceLevel;
  configuration: DashboardConfiguration;
  widgets: DashboardWidget[];
  suggested_actions: string[];
  discovery_hints: string[];
  level_progression_status: {
    current_score: number;
    next_level?: UserExperienceLevel;
    progress_to_next: number;
    can_advance: boolean;
    areas_to_improve: string[];
  };
}

export interface UserInteraction {
  interaction_type: string;
  interaction_data?: Record<string, any>;
  duration_seconds?: number;
  session_id?: string;
} 