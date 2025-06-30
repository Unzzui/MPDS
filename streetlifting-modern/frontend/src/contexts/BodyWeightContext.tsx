import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface UserProfile {
  bodyWeight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  maxReps: {
    muscle_ups: number;
    pull_ups: number;
    dips: number;
    squats: number;
  };
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  trainingGoals: string[];
  trainingFrequency: '2-3' | '3-4' | '4-5' | '5-6';
  preferredTrainingTime: 'morning' | 'afternoon' | 'evening';
  availableTrainingDays: string[];
  maxSessionDuration: number;
  hasInjuries: boolean;
  injuryDetails: string;
  medicalConditions: string;
  hasPullUpBar: boolean;
  hasDipBars: boolean;
  hasWeights: boolean;
  hasGymAccess: boolean;
  hasCompletedSetup: boolean;
}

interface UserProfileContextType {
  bodyWeight: number;
  setBodyWeight: (weight: number) => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  hasCompletedSetup: boolean;
  setHasCompletedSetup: (completed: boolean) => void;
  checkSetupStatus: () => Promise<void>;
  completeSetup: (profileData: UserProfile) => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const [bodyWeight, setBodyWeight] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [hasCompletedSetup, setHasCompletedSetup] = useState<boolean>(false);

  // Load body weight from localStorage on mount
  useEffect(() => {
    const savedWeight = localStorage.getItem('bodyWeight');
    if (savedWeight) {
      setBodyWeight(parseFloat(savedWeight));
    }
  }, []);

  // Save body weight to localStorage when it changes
  useEffect(() => {
    if (bodyWeight > 0) {
      localStorage.setItem('bodyWeight', bodyWeight.toString());
    }
  }, [bodyWeight]);

  const checkSetupStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/user-profile/setup-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const setupCompleted = data.has_completed_setup;
        
        setHasCompletedSetup(setupCompleted);
        
        if (data.profile) {
          // Convert backend data (snake_case) to frontend format (camelCase)
          const convertedProfile: UserProfile = {
            bodyWeight: data.profile.body_weight || 0,
            height: data.profile.height || 0,
            age: data.profile.age || 0,
            gender: data.profile.gender || 'male',
            maxReps: {
              muscle_ups: data.profile.initial_muscle_ups_rm || 0,
              pull_ups: data.profile.initial_pull_ups_rm || 0,
              dips: data.profile.initial_dips_rm || 0,
              squats: data.profile.initial_squats_rm || 0
            },
            experienceLevel: data.profile.experience_level || 'beginner',
            trainingGoals: data.profile.training_goals || [],
            trainingFrequency: data.profile.training_frequency || '3-4',
            preferredTrainingTime: data.profile.preferred_training_time || 'afternoon',
            availableTrainingDays: data.profile.available_training_days || [],
            maxSessionDuration: data.profile.max_session_duration || 60,
            hasInjuries: data.profile.has_injuries || false,
            injuryDetails: data.profile.injury_details || '',
            medicalConditions: data.profile.medical_conditions || '',
            hasPullUpBar: data.profile.has_pull_up_bar || true,
            hasDipBars: data.profile.has_dip_bars || true,
            hasWeights: data.profile.has_weights || false,
            hasGymAccess: data.profile.has_gym_access || false,
            hasCompletedSetup: data.profile.has_completed_setup || false
          };
          
          setUserProfile(convertedProfile);
          if (data.profile.body_weight) {
            setBodyWeight(data.profile.body_weight);
          }
        }
        
        // If setup is completed, mark it as verified in localStorage
        if (setupCompleted) {
          localStorage.setItem('setup_verified', 'true');
        }
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
      // If there's an error, assume setup is not completed
      setHasCompletedSetup(false);
    }
  }, []);

  const completeSetup = useCallback(async (profileData: UserProfile) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No authentication token');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/user-profile/complete-setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body_weight: profileData.bodyWeight,
          height: profileData.height,
          age: profileData.age,
          gender: profileData.gender,
          initial_muscle_ups_rm: profileData.maxReps.muscle_ups,
          initial_pull_ups_rm: profileData.maxReps.pull_ups,
          initial_dips_rm: profileData.maxReps.dips,
          initial_squats_rm: profileData.maxReps.squats,
          experience_level: profileData.experienceLevel,
          training_goals: profileData.trainingGoals,
          training_frequency: profileData.trainingFrequency,
          preferred_training_time: profileData.preferredTrainingTime,
          available_training_days: profileData.availableTrainingDays,
          max_session_duration: profileData.maxSessionDuration,
          has_injuries: profileData.hasInjuries,
          injury_details: profileData.injuryDetails,
          medical_conditions: profileData.medicalConditions,
          has_pull_up_bar: profileData.hasPullUpBar,
          has_dip_bars: profileData.hasDipBars,
          has_weights: profileData.hasWeights,
          has_gym_access: profileData.hasGymAccess,
          has_completed_setup: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Convert backend data (snake_case) to frontend format (camelCase)
        const convertedProfile: UserProfile = {
          bodyWeight: data.profile.body_weight || profileData.bodyWeight,
          height: data.profile.height || profileData.height,
          age: data.profile.age || profileData.age,
          gender: data.profile.gender || profileData.gender,
          maxReps: {
            muscle_ups: data.profile.initial_muscle_ups_rm || profileData.maxReps.muscle_ups,
            pull_ups: data.profile.initial_pull_ups_rm || profileData.maxReps.pull_ups,
            dips: data.profile.initial_dips_rm || profileData.maxReps.dips,
            squats: data.profile.initial_squats_rm || profileData.maxReps.squats
          },
          experienceLevel: data.profile.experience_level || profileData.experienceLevel,
          trainingGoals: data.profile.training_goals || profileData.trainingGoals,
          trainingFrequency: data.profile.training_frequency || profileData.trainingFrequency,
          preferredTrainingTime: data.profile.preferred_training_time || profileData.preferredTrainingTime,
          availableTrainingDays: data.profile.available_training_days || profileData.availableTrainingDays,
          maxSessionDuration: data.profile.max_session_duration || profileData.maxSessionDuration,
          hasInjuries: data.profile.has_injuries || profileData.hasInjuries,
          injuryDetails: data.profile.injury_details || profileData.injuryDetails,
          medicalConditions: data.profile.medical_conditions || profileData.medicalConditions,
          hasPullUpBar: data.profile.has_pull_up_bar || profileData.hasPullUpBar,
          hasDipBars: data.profile.has_dip_bars || profileData.hasDipBars,
          hasWeights: data.profile.has_weights || profileData.hasWeights,
          hasGymAccess: data.profile.has_gym_access || profileData.hasGymAccess,
          hasCompletedSetup: data.profile.has_completed_setup || true
        };
        
        setUserProfile(convertedProfile);
        setHasCompletedSetup(true);
        setBodyWeight(profileData.bodyWeight);
        
        // Save to localStorage as backup
        localStorage.setItem('userProfile', JSON.stringify(convertedProfile));
      } else {
        throw new Error('Failed to complete setup');
      }
    } catch (error) {
      console.error('Error completing setup:', error);
      throw error;
    }
  }, []);

  const value: UserProfileContextType = {
    bodyWeight,
    setBodyWeight,
    userProfile,
    setUserProfile,
    hasCompletedSetup,
    setHasCompletedSetup,
    checkSetupStatus,
    completeSetup
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

// Keep the old context for backward compatibility
export const useBodyWeight = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useBodyWeight must be used within a UserProfileProvider');
  }
  return {
    bodyWeight: context.bodyWeight,
    setBodyWeight: context.setBodyWeight
  };
}; 