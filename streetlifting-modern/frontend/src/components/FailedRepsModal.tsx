import React, { useState } from 'react';
import type { RpeInference } from '../types';

interface FailedRepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (completedReps: number, failedReps: number) => void;
  targetReps: number;
  exerciseName: string;
  setNumber: number;
}

const FailedRepsModal: React.FC<FailedRepsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetReps,
  exerciseName,
  setNumber,
}) => {
  const [completedReps, setCompletedReps] = useState(targetReps);
  const [failedReps, setFailedReps] = useState(0);

  const handleConfirm = () => {
    onConfirm(completedReps, failedReps);
    onClose();
    setCompletedReps(targetReps);
    setFailedReps(0);
  };

  const handleCancel = () => {
    onClose();
    setCompletedReps(targetReps);
    setFailedReps(0);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>FAILED REPS - SET {setNumber}</h3>
        <p>{exerciseName}</p>
        
        <div className="reps-inputs">
          <div className="input-group">
            <label className="form-label">COMPLETED REPS</label>
            <div className="reps-controls">
              <button 
                className="reps-btn"
                onClick={() => setCompletedReps(Math.max(0, completedReps - 1))}
                disabled={completedReps === 0}
              >
                -
              </button>
              <span className="reps-value">{completedReps}</span>
              <button 
                className="reps-btn"
                onClick={() => setCompletedReps(Math.min(targetReps, completedReps + 1))}
                disabled={completedReps === targetReps}
              >
                +
              </button>
            </div>
          </div>
          
          <div className="input-group">
            <label className="form-label">FAILED REPS</label>
            <div className="reps-controls">
              <button 
                className="reps-btn"
                onClick={() => setFailedReps(Math.max(0, failedReps - 1))}
                disabled={failedReps === 0}
              >
                -
              </button>
              <span className="reps-value">{failedReps}</span>
              <button 
                className="reps-btn"
                onClick={() => setFailedReps(failedReps + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={handleCancel}>CANCEL</button>
          <button onClick={handleConfirm}>CONFIRM</button>
        </div>
      </div>
    </div>
  );
};

export default FailedRepsModal; 