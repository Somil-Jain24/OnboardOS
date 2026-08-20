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
    default: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    secondary: 'bg-slate-800 text-slate-300 border-slate-700',
    outline: 'bg-transparent text-slate-300 border-slate-700',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    muted: 'bg-slate-800/60 text-slate-400 border-slate-800',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border transition-colors select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColor ||
              (variant === 'success'
                ? 'bg-emerald-400'
                : variant === 'danger'
                ? 'bg-rose-400 animate-pulse'
                : variant === 'warning'
                ? 'bg-amber-400'
                : variant === 'purple'
                ? 'bg-purple-400'
                : 'bg-blue-400')
          )}
        />
      )}
      {icon}
      {children}
    </div>
  );
}
