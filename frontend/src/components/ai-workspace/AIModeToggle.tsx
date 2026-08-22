import React from 'react';
import { useAIMode } from './AIModeContext';
import { Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AIModeToggleProps {
  className?: string;
  variant?: 'navbar' | 'header';
}

export const AIModeToggle: React.FC<AIModeToggleProps> = ({ className, variant = 'navbar' }) => {
  const { isAIMode, toggleAIMode, theme } = useAIMode();
  const isLight = theme === 'light';

  return (
    <div
      className={cn(
        'relative inline-flex items-center p-1 rounded-full border transition-all duration-300 select-none shadow-xs',
        isLight
          ? isAIMode
            ? 'bg-blue-50/80 border-blue-200 text-slate-900'
            : 'bg-slate-100/90 border-slate-200/90 text-slate-700'
          : isAIMode
          ? 'bg-[#0B1120] border-blue-500/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
          : 'bg-slate-100/90 border-slate-200/90 text-slate-700',
        className
      )}
      role="radiogroup"
      aria-label="Mode switcher"
    >
      {/* Sliding Pill Indicator */}
      <div
        className={cn(
          'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-out pointer-events-none',
          isAIMode
            ? isLight
              ? 'left-[calc(50%+2px)] bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'left-[calc(50%+2px)] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.45)]'
            : 'left-1 bg-white text-slate-900 border border-slate-200/80 shadow-xs'
        )}
      />

      {/* Manual Mode Option */}
      <button
        type="button"
        role="radio"
        aria-checked={!isAIMode}
        onClick={() => {
          if (isAIMode) toggleAIMode(false);
        }}
        className={cn(
          'relative z-10 flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer',
          !isAIMode
            ? 'text-slate-900 font-bold'
            : isLight
            ? 'text-slate-500 hover:text-slate-900'
            : 'text-slate-400 hover:text-slate-200'
        )}
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full transition-colors',
            !isAIMode ? 'bg-slate-700' : 'bg-slate-400'
          )}
        />
        <span>Manual Mode</span>
      </button>

      {/* AI Mode Option */}
      <button
        type="button"
        role="radio"
        aria-checked={isAIMode}
        onClick={() => {
          if (!isAIMode) toggleAIMode(true);
        }}
        className={cn(
          'relative z-10 flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer',
          isAIMode
            ? 'text-white font-bold'
            : 'text-slate-600 hover:text-slate-900'
        )}
      >
        <Sparkles
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-300',
            isAIMode
              ? isLight
                ? 'text-white'
                : 'text-cyan-300 scale-110 animate-pulse'
              : 'text-blue-600 group-hover:rotate-12'
          )}
        />
        <span>AI Mode</span>
      </button>
    </div>
  );
};
