
import React from 'react';

interface LoaderProps {
  color?: 'indigo' | 'white';
  size?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ color = 'indigo', size = '8', className = '' }) => {
  const sizeClasses = `h-${size} w-${size}`;
  const colorClasses = color === 'white' ? 'border-white' : 'border-indigo-400';
  return (
    <div className={`animate-spin rounded-full ${sizeClasses} border-b-2 border-t-2 ${colorClasses} ${className}`}></div>
  );
};

export default Loader;