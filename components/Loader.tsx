
import React from 'react';

const Loader = ({ size = '8' }: { size?: string }) => {
  const sizeClasses = `h-${size} w-${size}`;
  return (
    <div className={`animate-spin rounded-full ${sizeClasses} border-b-2 border-t-2 border-indigo-400`}></div>
  );
};

export default Loader;
