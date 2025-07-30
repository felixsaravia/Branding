import React from 'react';

interface SectionWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, description, children }) => {
  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 mb-8 border border-slate-200 shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{title}</h2>
        <p className="text-slate-500 text-lg">{description}</p>
      </div>
      <div className="space-y-8">
        {children}
      </div>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm transition-all duration-300 hover:border-indigo-300/80 hover:shadow-lg ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-2xl font-bold text-indigo-700 mb-3 tracking-tight">{children}</h3>
);

export const AiButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
    <button
      {...props}
      className="inline-flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-all duration-200 disabled:bg-violet-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500 focus-visible:ring-offset-slate-50"
    >
        {children}
    </button>
);

export default SectionWrapper;