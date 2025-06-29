import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WorkoutPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to workout logger with default day type
    navigate('/workout-logger/Push', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading workout...</p>
      </div>
    </div>
  );
};

export default WorkoutPage; 