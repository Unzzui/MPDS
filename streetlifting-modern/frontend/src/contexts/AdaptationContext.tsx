import React, { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';
import { UserExperienceLevel } from '../types/adaptation';
import type { 
  UserProfile, 
  DashboardWidget, 
  AdaptiveDashboardResponse, 
  UserInteraction 
} from '../types/adaptation';

interface AdaptationContextType {
  // State
  userProfile: UserProfile | null;
  dashboardConfig: AdaptiveDashboardResponse | null;
  isLoading: boolean;
  
  // User level information
  currentLevel: UserExperienceLevel;
  effectiveLevel: UserExperienceLevel;
  hasManualOverride: boolean;
  
  // Dashboard customization
  visibleWidgets: DashboardWidget[];
  discoveryHints: string[];
  suggestedActions: string[];
  levelProgression: AdaptiveDashboardResponse['level_progression_status'] | null;
  
  // Actions
  trackInteraction: (interaction: UserInteraction) => Promise<void>;
  setManualLevel: (level: UserExperienceLevel, reason?: string) => Promise<void>;
  removeManualOverride: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  forceRecalculation: () => Promise<void>;
  
  // Feature discovery
  getFeatureSuggestions: () => Promise<any>;
  provideFeedback: (feedback: Record<string, any>) => Promise<void>;
  
  // Utility functions
  shouldShowFeature: (featureId: string) => boolean;
  shouldShowAdvanced: () => boolean;
  getWidgetSettings: (widgetId: string) => Record<string, any>;
}

const AdaptationContext = createContext<AdaptationContextType | undefined>(undefined);

interface AdaptationProviderProps {
  children: ReactNode;
}

// Session tracking
let sessionId: string = '';
let sessionStartTime: number = Date.now();

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getSessionDuration = (): number => {
  return (Date.now() - sessionStartTime) / 1000;
};

export const AdaptationProvider: React.FC<AdaptationProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  
  // Initialize session
  useEffect(() => {
    sessionId = generateSessionId();
    sessionStartTime = Date.now();
  }, [user]);
  
  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      return await apiService.getUserProfile();
    },
    enabled: !!user && !!token,
  });
  
  // Fetch adaptive dashboard
  const { data: dashboardConfig, isLoading: dashboardLoading } = useQuery({
    queryKey: ['adaptiveDashboard', user?.id, userProfile],
    queryFn: async () => {
      return await apiService.getAdaptiveDashboard();
    },
    enabled: !!user && !!token && !!userProfile,
  });
  
  const isLoading = profileLoading || dashboardLoading;
  
  // Interaction tracking mutation
  const trackInteractionMutation = useMutation({
    mutationFn: async (interaction: UserInteraction) => {
      return await apiService.trackInteraction({
        ...interaction,
        session_id: sessionId,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch user profile to update adaptation data
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['adaptiveDashboard', user?.id] });
    },
  });
  
  // Manual level setting mutation
  const setManualLevelMutation = useMutation({
    mutationFn: async ({ level, reason }: { level: UserExperienceLevel; reason?: string }) => {
      return await apiService.setManualLevel(level, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['adaptiveDashboard', user?.id] });
    },
  });
  
  // Remove manual override mutation
  const removeManualOverrideMutation = useMutation({
    mutationFn: async () => {
      return await apiService.removeManualOverride();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['adaptiveDashboard', user?.id] });
    },
  });
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      return await apiService.updateAdaptationProfile(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['adaptiveDashboard', user?.id] });
    },
  });
  
  // Force recalculation mutation
  const forceRecalculationMutation = useMutation({
    mutationFn: async () => {
      return await apiService.forceRecalculation();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['adaptiveDashboard', user?.id] });
    },
  });
  
  // Feature suggestions
  const getFeatureSuggestions = async () => {
    return await apiService.getFeatureSuggestions();
  };
  
  // Feedback submission
  const submitFeedback = async (feedback: Record<string, any>) => {
    return await apiService.submitFeedback(feedback);
  };
  
  // Automatic interaction tracking
  useEffect(() => {
    const handlePageVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // Track session duration when user leaves
        trackInteractionMutation.mutate({
          interaction_type: 'page_visit',
          interaction_data: { 
            page: window.location.pathname,
            action: 'session_end'
          },
          duration_seconds: getSessionDuration(),
        });
      }
    };
    
    document.addEventListener('visibilitychange', handlePageVisibility);
    return () => document.removeEventListener('visibilitychange', handlePageVisibility);
  }, []);
  
  // Track route changes - DISABLED to prevent infinite loops
  // TODO: Implement proper route tracking without causing re-render loops
  /*
  useEffect(() => {
    if (user && token && location.pathname !== lastTrackedPath) {
      setLastTrackedPath(location.pathname);
      trackInteractionMutation.mutate({
        interaction_type: 'page_visit',
        interaction_data: { 
          page: location.pathname,
          timestamp: new Date().toISOString()
        },
      });
    }
  }, [location.pathname, user?.id, token, lastTrackedPath]);
  */
  
  // Derived state
  const currentLevel = userProfile?.experience_level || UserExperienceLevel.ABSOLUTE_BEGINNER;
  const effectiveLevel = userProfile?.manual_override_level || currentLevel;
  const hasManualOverride = !!userProfile?.manual_override_level;
  const visibleWidgets = dashboardConfig?.widgets || [];
  const discoveryHints = dashboardConfig?.discovery_hints || [];
  const suggestedActions = dashboardConfig?.suggested_actions || [];
  const levelProgression = dashboardConfig?.level_progression_status || null;
  
  // Utility functions
  const shouldShowFeature = (featureId: string): boolean => {
    const config = dashboardConfig?.configuration;
    if (!config) return false;
    
    // Always allow if user has manual override to advanced level
    if (hasManualOverride && [UserExperienceLevel.ADVANCED, UserExperienceLevel.ELITE_ATHLETE].includes(effectiveLevel)) {
      return true;
    }
    
    // Check feature visibility based on level
    switch (featureId) {
      case 'advanced_metrics':
        return config.show_advanced_metrics;
      case 'projections':
        return config.show_projections;
      case 'analytics':
        return config.show_analytics;
      case 'manual_overrides':
        return config.enable_manual_overrides;
      default:
        return true;
    }
  };
  
  const shouldShowAdvanced = (): boolean => {
    return [UserExperienceLevel.ADVANCED, UserExperienceLevel.ELITE_ATHLETE].includes(effectiveLevel);
  };
  
  const getWidgetSettings = (widgetId: string): Record<string, any> => {
    return dashboardConfig?.configuration?.widget_settings?.[widgetId] || {};
  };
  
  const contextValue: AdaptationContextType = {
    // State
    userProfile,
    dashboardConfig,
    isLoading,
    
    // User level information
    currentLevel,
    effectiveLevel,
    hasManualOverride,
    
    // Dashboard customization
    visibleWidgets,
    discoveryHints,
    suggestedActions,
    levelProgression,
    
    // Actions
    trackInteraction: (interaction: UserInteraction) => trackInteractionMutation.mutateAsync(interaction),
    setManualLevel: (level: UserExperienceLevel, reason?: string) => 
      setManualLevelMutation.mutateAsync({ level, reason }),
    removeManualOverride: () => removeManualOverrideMutation.mutateAsync(),
    updateProfile: (updates: Partial<UserProfile>) => updateProfileMutation.mutateAsync(updates),
    forceRecalculation: () => forceRecalculationMutation.mutateAsync(),
    
    // Feature discovery
    getFeatureSuggestions,
    provideFeedback: submitFeedback,
    
    // Utility functions
    shouldShowFeature,
    shouldShowAdvanced,
    getWidgetSettings,
  };
  
  return (
    <AdaptationContext.Provider value={contextValue}>
      {children}
    </AdaptationContext.Provider>
  );
};

export const useAdaptation = (): AdaptationContextType => {
  const context = useContext(AdaptationContext);
  if (context === undefined) {
    throw new Error('useAdaptation must be used within an AdaptationProvider');
  }
  return context;
};
