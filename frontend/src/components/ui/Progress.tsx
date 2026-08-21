import { cn } from '../../utils/cn';

export interface ProgressProps {
  value: number; // 0 - 100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
  color?: 'default' | 'success' | 'warning' | 'danger' | 'gradient' | 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | string;
  showLabel?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  variant,
  color,
  showLabel = false,
  className,
}: ProgressProps) {
  const finalVariant = variant || (color === 'emerald' ? 'success' : color === 'amber' ? 'warning' : color === 'rose' ? 'danger' : 'default');

  const percentage = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const variants = {
    default: 'bg-blue-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    gradient: 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-slate-100 border border-slate-200/60 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out shadow-sm',
            variants[finalVariant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 mt-1.5 font-mono">
          <span>{value} / {max}</span>
          <span className="font-semibold text-slate-700">{percentage}%</span>
        </div>
      )}
    </div>
  );
}

