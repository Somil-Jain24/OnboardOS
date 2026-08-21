import React from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

export type StatusType =
  | 'completed'
  | 'ready'
  | 'in-progress'
  | 'pending'
  | 'pending-signoff'
  | 'blocked'
  | 'failed'
  | 'rejected'
  | 'warning'
  | 'ai'
  | 'upcoming';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  label,
  size = 'md',
  showIcon = false,
  className,
  ...props
}: StatusBadgeProps) {
  const norm = status.toLowerCase().replace(/_/g, '-');

  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let defaultLabel = label || status;
  let icon: React.ReactNode = null;

  if (norm === 'completed' || norm === 'done' || norm === 'ready' || norm === 'approved') {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200/90';
    defaultLabel = label || (norm === 'ready' ? 'Ready' : norm === 'done' ? 'Done' : 'Completed');
    icon = <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />;
  } else if (norm === 'in-progress' || norm === 'in-progress-it' || norm.includes('progress')) {
    style = 'bg-amber-50 text-amber-800 border-amber-200/90';
    defaultLabel = label || 'In Progress (IT)';
    icon = <Clock className="w-3 h-3 text-amber-600 flex-shrink-0" />;
  } else if (norm === 'pending-signoff' || norm.includes('signoff')) {
    style = 'bg-rose-50 text-rose-800 border-rose-200/90';
    defaultLabel = label || 'Pending Signoff';
    icon = <Clock className="w-3 h-3 text-rose-600 flex-shrink-0" />;
  } else if (norm === 'pending' || norm === 'queued') {
    style = 'bg-slate-100/90 text-slate-700 border-slate-200';
    defaultLabel = label || 'Pending';
    icon = <Clock className="w-3 h-3 text-slate-500 flex-shrink-0" />;
  } else if (norm === 'upcoming') {
    style = 'bg-slate-50 text-slate-600 border-slate-200/80';
    defaultLabel = label || 'Upcoming';
  } else if (norm === 'blocked' || norm === 'failed' || norm === 'rejected' || norm === 'risk') {
    style = 'bg-rose-50 text-rose-700 border-rose-200/90';
    defaultLabel = label || (norm === 'blocked' ? 'Blocked' : 'Failed');
    icon = <XCircle className="w-3 h-3 text-rose-600 flex-shrink-0" />;
  } else if (norm === 'warning') {
    style = 'bg-amber-50 text-amber-800 border-amber-200/90';
    defaultLabel = label || 'Warning';
    icon = <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />;
  } else if (norm === 'ai' || norm === 'recommended') {
    style = 'bg-purple-50 text-purple-700 border-purple-200/90';
    defaultLabel = label || 'AI Suggested';
    icon = <Sparkles className="w-3 h-3 text-purple-600 flex-shrink-0" />;
  }

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1 gap-2 font-semibold',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border transition-colors select-none font-sans font-medium',
        style,
        sizes[size],
        className
      )}
      {...props}
    >
      {showIcon && icon}
      <span>{defaultLabel}</span>
    </div>
  );
}
