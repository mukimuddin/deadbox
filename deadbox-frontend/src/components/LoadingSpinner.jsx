import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', overlay = false }) => {
  const spinnerClasses = `loading-spinner ${size} ${overlay ? 'with-overlay' : ''}`;
  
  return (
    <div className={spinnerClasses}>
      <div className="spinner">
        <div className="double-bounce1"></div>
        <div className="double-bounce2"></div>
      </div>
      {overlay && <div className="spinner-overlay" />}
    </div>
  );
};

export default LoadingSpinner; 