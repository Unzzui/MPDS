import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/BodyWeightContext';
import '../styles/Profile.css';

// Terminal-style SVG Icons
const UserIcon = () => (
  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const SaveIcon = () => (
  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const WeightIcon = () => (
  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
);

const TargetIcon = () => (
  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { userProfile, bodyWeight } = useUserProfile();
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'USERNAME IS REQUIRED';
    } else if (formData.username.length < 3) {
      newErrors.username = 'USERNAME MUST BE AT LEAST 3 CHARACTERS';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'EMAIL IS REQUIRED';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'EMAIL IS INVALID';
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'CURRENT PASSWORD IS REQUIRED TO CHANGE PASSWORD';
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'NEW PASSWORD MUST BE AT LEAST 6 CHARACTERS';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'PASSWORDS DO NOT MATCH';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // TODO: Implement profile update
    console.log('Updating profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <h1 className="profile-title">PROFILE</h1>
        <p className="profile-subtitle">
          Manage your account settings and personal information
        </p>
      </div>

      {/* Personal Information Section */}
      <div className="profile-section">
        <div className="section-header">
          <h2 className="section-title">PERSONAL INFORMATION</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="edit-btn"
            >
              EDIT PROFILE
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label className="form-label">
              USERNAME
            </label>
            <div className="input-wrapper">
              <UserIcon />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!isEditing}
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Enter your username"
              />
            </div>
            {errors.username && (
              <p className="error-message">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              EMAIL ADDRESS
            </label>
            <div className="input-wrapper">
              <EmailIcon />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="error-message">{errors.email}</p>
            )}
          </div>

          {/* Account Created */}
          <div className="form-group">
            <label className="form-label">
              ACCOUNT CREATED
            </label>
            <div className="input-wrapper">
              <CalendarIcon />
              <input
                type="text"
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                disabled
                className="form-input"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="action-buttons">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="save-btn"
              >
                <SaveIcon />
                SAVE CHANGES
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Training Configuration Section */}
      {userProfile && (
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">TRAINING CONFIGURATION</h2>
          </div>

          {/* Physical Data */}
          <div className="config-grid">
            <div className="form-group">
              <label className="form-label">
                BODY WEIGHT
              </label>
              <div className="input-wrapper">
                <WeightIcon />
                <input
                  type="text"
                  value={userProfile.bodyWeight ? `${userProfile.bodyWeight} kg` : 'Not set'}
                  disabled
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                HEIGHT
              </label>
              <div className="input-wrapper">
                <TargetIcon />
                <input
                  type="text"
                  value={userProfile.height ? `${userProfile.height} cm` : 'Not set'}
                  disabled
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                AGE
              </label>
              <div className="input-wrapper">
                <UserIcon />
                <input
                  type="text"
                  value={userProfile.age ? `${userProfile.age} years` : 'Not set'}
                  disabled
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                GENDER
              </label>
              <div className="input-wrapper">
                <UserIcon />
                <input
                  type="text"
                  value={userProfile.gender ? userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1) : 'Not set'}
                  disabled
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* One Rep Max Data */}
          <div className="config-section">
            <h3 className="config-subtitle">ONE REP MAX (1RM)</h3>
            <div className="rm-grid">
              <div className="form-group">
                <label className="form-label">MUSCLE UPS</label>
                <div className="input-wrapper">
                  <WeightIcon />
                  <input
                    type="text"
                    value={userProfile.maxReps.muscle_ups ? `${userProfile.maxReps.muscle_ups} kg` : 'Not set'}
                    disabled
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">PULL UPS</label>
                <div className="input-wrapper">
                  <WeightIcon />
                  <input
                    type="text"
                    value={userProfile.maxReps.pull_ups ? `${userProfile.maxReps.pull_ups} kg` : 'Not set'}
                    disabled
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">DIPS</label>
                <div className="input-wrapper">
                  <WeightIcon />
                  <input
                    type="text"
                    value={userProfile.maxReps.dips ? `${userProfile.maxReps.dips} kg` : 'Not set'}
                    disabled
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">SQUATS</label>
                <div className="input-wrapper">
                  <WeightIcon />
                  <input
                    type="text"
                    value={userProfile.maxReps.squats ? `${userProfile.maxReps.squats} kg` : 'Not set'}
                    disabled
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Training Preferences */}
          <div className="config-section">
            <h3 className="config-subtitle">TRAINING PREFERENCES</h3>
            <div className="config-grid">
              <div className="form-group">
                <label className="form-label">EXPERIENCE LEVEL</label>
                <div className="input-wrapper">
                  <TargetIcon />
                  <input
                    type="text"
                    value={userProfile.experienceLevel ? userProfile.experienceLevel.charAt(0).toUpperCase() + userProfile.experienceLevel.slice(1) : 'Not set'}
                    disabled
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">TRAINING FREQUENCY</label>
                <div className="input-wrapper">
                  <CalendarIcon />
                  <input
                    type="text"
                    value={userProfile.trainingFrequency ? `${userProfile.trainingFrequency} times/week` : 'Not set'}
                    disabled
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">PREFERRED TIME</label>
                <div className="input-wrapper">
                  <CalendarIcon />
                  <input
                    type="text"
                    value={userProfile.preferredTrainingTime ? userProfile.preferredTrainingTime.charAt(0).toUpperCase() + userProfile.preferredTrainingTime.slice(1) : 'Not set'}
                    disabled
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">SESSION DURATION</label>
                <div className="input-wrapper">
                  <CalendarIcon />
                  <input
                    type="text"
                    value={userProfile.maxSessionDuration ? `${userProfile.maxSessionDuration} minutes` : 'Not set'}
                    disabled
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Training Goals */}
          {userProfile.trainingGoals && userProfile.trainingGoals.length > 0 && (
            <div className="config-section">
              <h3 className="config-subtitle">TRAINING GOALS</h3>
              <div className="goals-list">
                {userProfile.trainingGoals.map((goal: string, index: number) => (
                  <div key={index} className="goal-item">
                    <span className="goal-text">{goal.charAt(0).toUpperCase() + goal.slice(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Danger Zone */}
      <div className="danger-zone">
        <h2 className="danger-title">DANGER ZONE</h2>
        <div>
          <div className="danger-item">
            <div className="danger-info">
              <h3>LOGOUT</h3>
              <p>Sign out of your account</p>
            </div>
            <button
              onClick={logout}
              className="danger-btn"
            >
              LOGOUT
            </button>
          </div>
          
          <div className="danger-item">
            <div className="danger-info">
              <h3>DELETE ACCOUNT</h3>
              <p>Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  // TODO: Implement account deletion
                  console.log('Deleting account...');
                }
              }}
              className="danger-btn"
            >
              DELETE ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;