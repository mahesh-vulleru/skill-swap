import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'forest' | 'orange' | 'blue' | 'purple' | 'amber' | 'stone' | 'rose' | 'emerald';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'forest',
  size = 'md',
  icon,
}) => {
  const variantStyles = {
    forest: 'bg-forest-50 text-forest-700 border-forest-200/60',
    orange: 'bg-orange-50 text-action-dark border-orange-200/60',
    blue: 'bg-sky-50 text-sky-700 border-sky-200/60',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    stone: 'bg-stone-100 text-stone-700 border-stone-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {icon}
      {children}
    </span>
  );
};

