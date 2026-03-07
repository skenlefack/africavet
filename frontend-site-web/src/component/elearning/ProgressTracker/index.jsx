import React from 'react';

const ProgressTracker = ({
  progress = 0,
  size = 'md',
  showLabel = true,
  label = '',
  completedText = 'termine',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="progress-tracker">
      <div className={`progress-tracker__bar ${size}`}>
        <div
          className="progress-tracker__fill"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="progress-tracker__label">
          <span>{label || `${clampedProgress}% ${completedText}`}</span>
          {!label && <span>{clampedProgress}%</span>}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
