import React from 'react';

export const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full border-brand-500/20 border-t-brand-500 animate-spin`}
        />
        <div className="absolute inset-0 rounded-full blur-sm bg-brand-500/30 animate-pulse" />
      </div>
      {text && <p className="text-sm font-medium text-slate-400 animate-pulse">{text}</p>}
    </div>
  );
};

export default Loader;
