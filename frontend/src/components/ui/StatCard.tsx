import React from 'react';
import { cn } from '../../utils/cn';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface StatCardProps {
  icon: React.ReactNode;
  iconBgColor?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'slate';
  iconColor?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'slate';
  value: string | number;
  label?: string;
  title?: string;
  sublabel?: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function StatCard({
  icon,
  iconBgColor,
  iconColor,
  value,
  label,
  title,
  sublabel,
  subtitle,
  actionText,
  actionHref,
  onAction,
  className,
}: StatCardProps) {
  const finalLabel = label || title || '';
  const finalSublabel = sublabel || subtitle;
  const finalColor = iconBgColor || iconColor || 'blue';

  const iconBgs = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const actionColors = {
    blue: 'text-blue-600 hover:text-blue-700',
    emerald: 'text-emerald-600 hover:text-emerald-700',
    purple: 'text-purple-600 hover:text-purple-700',
    amber: 'text-amber-600 hover:text-amber-700',
    rose: 'text-rose-600 hover:text-rose-700',
    slate: 'text-slate-600 hover:text-slate-700',
  };

  return (
    <div
      className={cn(
        'bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105',
            iconBgs[finalColor]
          )}
        >
          {icon}
        </div>
        <div className="flex-1 text-left pl-1">
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {value}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">{finalLabel}</div>
          {finalSublabel && <div className="text-[11px] text-slate-400 mt-0.5">{finalSublabel}</div>}
        </div>
      </div>

      {(actionText || actionHref || onAction) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-start">
          {actionHref ? (
            <Link
              to={actionHref}
              className={cn(
                'text-xs font-semibold flex items-center gap-1 transition-all group-hover:translate-x-0.5',
                actionColors[finalColor]
              )}
            >
              <span>{actionText || 'View Details'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              onClick={onAction}
              className={cn(
                'text-xs font-semibold flex items-center gap-1 transition-all group-hover:translate-x-0.5',
                actionColors[finalColor]
              )}
            >
              <span>{actionText || 'View Details'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
