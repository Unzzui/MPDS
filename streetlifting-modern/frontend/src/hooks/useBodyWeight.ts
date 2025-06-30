import { useState, useEffect } from 'react';

interface UseBodyWeightReturn {
  bodyWeight: number;
  setBodyWeight: (weight: number) => void;
  isConfigured: boolean;
}

export const useBodyWeight = (): UseBodyWeightReturn => {
  const [bodyWeight, setBodyWeightState] = useState<number>(0);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    // Load body weight from localStorage
    const savedWeight = localStorage.getItem('userBodyWeight');
    if (savedWeight) {
      const weight = parseFloat(savedWeight);
      if (!isNaN(weight) && weight > 0) {
        setBodyWeightState(weight);
        setIsConfigured(true);
      }
    }
  }, []);

  const setBodyWeight = (weight: number) => {
    setBodyWeightState(weight);
    localStorage.setItem('userBodyWeight', weight.toString());
    setIsConfigured(true);
  };

  return {
    bodyWeight,
    setBodyWeight,
    isConfigured
  };
}; 