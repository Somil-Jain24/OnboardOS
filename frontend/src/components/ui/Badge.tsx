import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'purple'
    | 'muted';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  dotColor?: string;
  icon?: React.ReactNode;
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  dotColor,
  icon,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-blue-50 text-blue-700 border-blue-200/80',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-white text-slate-700 border-slate-200 shadow-sm',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    muted: 'bg-slate-100/70 text-slate-500 border-slate-200/70',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border transition-colors select-none font-sans',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotColor ||
              (variant === 'success'
                ? 'bg-emerald-500'
                : variant === 'danger'
                ? 'bg-rose-500 animate-pulse'
                : variant === 'warning'
                ? 'bg-amber-500'
                : variant === 'purple'
                ? 'bg-purple-500'
                : 'bg-blue-500')
          )}
        />
      )}
      {icon}
      {children}
    </div>
  );
}

