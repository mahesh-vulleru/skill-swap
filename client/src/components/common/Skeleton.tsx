import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'rounded-xl',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-stone-200/70 ${rounded} ${className}`}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton rounded="rounded-full" className="w-11 h-11 flex-shrink-0" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
    <div className="flex gap-2 pt-2 border-t border-stone-100">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
);

export const SkeletonStat: React.FC = () => (
  <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm space-y-2">
    <div className="flex justify-between items-center">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton rounded="rounded-lg" className="w-8 h-8" />
    </div>
    <Skeleton className="h-8 w-20" />
    <Skeleton className="h-3 w-32" />
  </div>
);

export const SkeletonRow: React.FC = () => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200/60">
    <div className="flex items-center gap-3.5 flex-1">
      <Skeleton rounded="rounded-full" className="w-10 h-10 flex-shrink-0" />
      <div className="space-y-1.5 flex-1 max-w-xs">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-8 w-24 rounded-lg" />
  </div>
);
