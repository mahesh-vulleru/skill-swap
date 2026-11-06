import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading SkillSwap...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-forest-100 border-t-forest-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-action" />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-stone-500 animate-pulse">{message}</p>
    </div>
  );
};

