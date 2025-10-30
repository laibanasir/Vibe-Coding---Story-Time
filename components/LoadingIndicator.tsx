
import React from 'react';

interface LoadingIndicatorProps {
  text: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-lg text-blue-700">{text}</p>
    </div>
  );
};

export default LoadingIndicator;
