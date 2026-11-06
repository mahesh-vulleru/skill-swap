import React, { useState } from 'react';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isOnline?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  isOnline,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const getInitials = (n: string) => {
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg font-bold',
    '2xl': 'w-24 h-24 text-2xl font-bold',
  };

  const badgeSizeClasses = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1.5',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3 h-3 ring-2',
    xl: 'w-3.5 h-3.5 ring-2',
    '2xl': 'w-4 h-4 ring-2',
  };

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover border border-stone-200/80 shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-forest-600 text-white font-medium flex items-center justify-center border border-forest-700 shadow-sm select-none`}
        >
          {getInitials(name)}
        </div>
      )}
      {typeof isOnline === 'boolean' && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full ring-white
            ${badgeSizeClasses[size]}
            ${isOnline ? 'bg-emerald-500' : 'bg-stone-300'}
          `}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};
