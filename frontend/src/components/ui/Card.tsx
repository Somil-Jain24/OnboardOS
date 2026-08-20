import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered' | 'active' | 'danger';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-slate-900/90 border border-slate-800 text-slate-100 shadow-sm',
    glass: 'bg-slate-900/60 backdrop-blur-md border border-slate-800/80 text-slate-100 shadow-md',
    bordered: 'bg-slate-950 border border-slate-800 text-slate-100',
    active: 'bg-slate-900/90 border-2 border-blue-500/50 shadow-md shadow-blue-500/10 text-slate-100',
    danger: 'bg-rose-950/20 border border-rose-500/30 text-rose-200',
  };

  return (
    <div
      className={cn('rounded-xl overflow-hidden transition-all', variants[variant], className)}
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
      className={cn('flex flex-col space-y-1.5 p-5 border-b border-slate-800/60', className)}
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
      className={cn('text-base font-semibold leading-none tracking-tight text-slate-100 flex items-center gap-2', className)}
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
    <p className={cn('text-xs text-slate-400 mt-1', className)} {...props}>
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
    <div className={cn('p-5', className)} {...props}>
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
      className={cn('flex items-center p-5 pt-0 border-t border-slate-800/40 mt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}
