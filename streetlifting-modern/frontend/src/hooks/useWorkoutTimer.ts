import { useState, useEffect, useCallback, useRef } from 'react';
import type { WorkoutTimer } from '../types';

export const useWorkoutTimer = () => {
  const [timer, setTimer] = useState<WorkoutTimer>({
    is_active: false,
    current_time: 0,
  });
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startTimer = useCallback((targetRestTime?: number, exerciseName?: string, setNumber?: number) => {
    const now = Date.now();
    setTimer({
      is_active: true,
      start_time: now,
      current_time: 0,
      target_rest_time: targetRestTime,
      exercise_name: exerciseName,
      set_number: setNumber,
    });
    startTimeRef.current = now;
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    
    setTimer(prev => ({
      ...prev,
      is_active: false,
      current_time: duration,
    }));
    
    startTimeRef.current = null;
    
    return duration;
  }, []);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setTimer(prev => ({
      ...prev,
      is_active: false,
    }));
  }, []);

  const resumeTimer = useCallback(() => {
    if (!startTimeRef.current) return;
    
    setTimer(prev => ({
      ...prev,
      is_active: true,
    }));
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setTimer({
      is_active: false,
      current_time: 0,
    });
    
    startTimeRef.current = null;
  }, []);

  const getFormattedTime = useCallback((milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const isRestTimeComplete = useCallback((): boolean => {
    if (!timer.target_rest_time) return true;
    return timer.current_time >= timer.target_rest_time * 1000;
  }, [timer.current_time, timer.target_rest_time]);

  // Timer effect
  useEffect(() => {
    if (timer.is_active) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const currentTime = Date.now() - startTimeRef.current;
          setTimer(prev => ({
            ...prev,
            current_time: currentTime,
          }));
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.is_active]);

  return {
    timer,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    getFormattedTime,
    isRestTimeComplete,
  };
}; 