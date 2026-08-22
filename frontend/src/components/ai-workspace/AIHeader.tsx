import React from 'react';
import { useAIMode } from './AIModeContext';
import { useAuth } from '../../context/AuthContext';
import { AIModeToggle } from './AIModeToggle';
import { Sparkles, Menu, Bell, Sun, Moon } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AIHeader: React.FC = () => {
  const { setSidebarMobileOpen, theme, toggleTheme } = useAIMode();
  const { currentRole, currentUser } = useAuth();
  const isLight = theme === 'light';

  const title = 'AI Assistant';
  const subtitle = 'Your intelligent onboarding copilot';

  const initials = (currentUser?.name || (currentRole === 'HR' ? 'Somil Jain' : 'Rahul Sharma'))
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className={cn(
        'h-16 px-4 md:px-8 border-b flex items-center justify-between z-30 select-none flex-shrink-0 transition-colors duration-300',
        isLight
          ? 'bg-white/95 border-slate-200/80 backdrop-blur-md text-slate-900'
          : 'bg-[#080D1A]/90 border-slate-800/80 backdrop-blur-md text-white'
      )}
    >
      {/* Left: Role Intelligence Badge & Subtitle */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={() => setSidebarMobileOpen(true)}
          className={cn(
            'p-2 -ml-2 rounded-xl md:hidden cursor-pointer transition-colors',
            isLight
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          )}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className={cn('w-4 h-4', isLight ? 'text-blue-600' : 'text-blue-400')} />
            <span
              className={cn(
                'font-bold text-sm md:text-base tracking-tight',
                isLight ? 'text-slate-900' : 'text-white'
              )}
            >
              {title}
            </span>
          </div>

          <span
            className={cn(
              'hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border',
              isLight
                ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                : 'bg-blue-900/30 text-blue-300 border-blue-700/40'
            )}
          >
            {subtitle}
          </span>
        </div>
      </div>

      {/* Right: Mode Toggle + Quick Utility Icons */}
      <div className="flex items-center gap-3">
        {/* The Global [ Manual Mode | ✨ AI Mode ] Toggle */}
        <AIModeToggle variant="header" />

        {/* Theme Toggle / Notifications / User Avatar */}
        <div
          className={cn(
            'hidden sm:flex items-center gap-2 pl-2 border-l transition-colors',
            isLight ? 'border-slate-200' : 'border-slate-800'
          )}
        >
          {/* Workable Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              'p-2 rounded-xl transition-all duration-200 cursor-pointer',
              isLight
                ? 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                : 'text-slate-400 hover:text-yellow-300 hover:bg-slate-800/60'
            )}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? (
              <Sun className="w-4 h-4 text-amber-500 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-300 hover:-rotate-12 transition-transform" />
            )}
          </button>

          <button
            type="button"
            className={cn(
              'p-2 rounded-xl transition-colors relative cursor-pointer',
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            )}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full absolute top-2 right-2',
                isLight ? 'bg-blue-600' : 'bg-cyan-400 shadow-[0_0_6px_#38bdf8]'
              )}
            />
          </button>

          {/* User Badge */}
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ml-1 shadow-xs',
              isLight
                ? 'bg-blue-100 border border-blue-200 text-blue-700'
                : 'bg-slate-800 border border-slate-700 text-slate-200'
            )}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};
