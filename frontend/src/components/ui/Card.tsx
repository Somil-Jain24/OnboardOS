import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'bordered' | 'active' | 'danger' | 'gradient';
  hoverable?: boolean;
}

export function Card({
  className,
  variant = 'default',
  hoverable = false,
  children,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-white border border-slate-200/80 text-slate-900 shadow-card',
    subtle: 'bg-slate-50/70 border border-slate-200/60 text-slate-900',
    bordered: 'bg-white border border-slate-200 text-slate-900',
    active: 'bg-white border-2 border-blue-500 shadow-md shadow-blue-500/10 text-slate-900',
    danger: 'bg-rose-50/50 border border-rose-200 text-rose-900',
    gradient: 'bg-gradient-to-r from-blue-50/60 via-white to-indigo-50/40 border border-blue-100 text-slate-900 shadow-card',
  };

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-200',
        variants[variant],
        hoverable && 'hover:shadow-card-hover hover:border-slate-300/80 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-5 md:p-6 border-b border-slate-100', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-base font-semibold leading-tight tracking-tight text-slate-900 flex items-center gap-2',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-slate-500 mt-1 leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 md:p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center p-5 md:p-6 pt-0 border-t border-slate-100 mt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

