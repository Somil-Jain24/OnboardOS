import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2, Sparkles } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'amber' | 'ai';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-xl cursor-pointer';

    const variants = {
      primary:
        'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 border border-blue-600',
      secondary:
        'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/90 shadow-sm shadow-slate-900/5',
      outline:
        'bg-transparent hover:bg-slate-100/70 text-slate-700 border border-slate-200/90',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent',
      destructive:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 border border-rose-600',
      success:
        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 border border-emerald-600',
      amber:
        'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20 border border-amber-600',
      ai:
        'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-indigo-600/20 border border-blue-500/40',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
      md: 'h-9 px-4 text-xs md:text-sm gap-2 rounded-xl',
      lg: 'h-11 px-6 text-sm md:text-base gap-2.5 rounded-xl',
      icon: 'h-9 w-9 p-0 rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

