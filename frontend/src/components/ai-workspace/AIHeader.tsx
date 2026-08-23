import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAIMode } from './AIModeContext';
import { useAuth } from '../../context/AuthContext';
import { AIModeToggle } from './AIModeToggle';
import { Badge } from '../ui/Badge';
import { client } from '../../services';
import type { NotificationItem } from '../../types';
import {
  Sparkles,
  Menu,
  Bell,
  Sun,
  Moon,
  CheckCircle2,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const AIHeader: React.FC = () => {
  const { setSidebarMobileOpen, theme, toggleTheme, toggleAIMode } = useAIMode();
  const { currentRole, currentUser } = useAuth();
  const isLight = theme === 'light';
  const navigate = useNavigate();

  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const roleTitles: Record<string, { title: string; subtitle: string }> = {
    HR: { title: 'OnboardOS HR Intelligence', subtitle: 'Workforce Orchestration & RBAC Policies' },
    MANAGER: { title: 'OnboardOS Manager Intelligence', subtitle: 'Team Enablement & Performance Insights' },
    EMPLOYEE: { title: 'OnboardOS Employee Copilot', subtitle: 'Your Personal Onboarding Track & Work Tools' },
    IT: { title: 'OnboardOS IT Intelligence', subtitle: 'Hardware & System Access Orchestration' },
    ADMIN: { title: 'OnboardOS Admin Intelligence', subtitle: 'Governance & RBAC Policy Orchestration' },
  };

  const { title, subtitle } = roleTitles[currentRole] || {
    title: 'OnboardOS Intelligence',
    subtitle: 'Your intelligent onboarding copilot',
  };

  const initials = (currentUser?.name || (currentRole === 'HR' ? 'Somil Jain' : 'Rahul Sharma'))
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    loadNotifications();
  }, [currentRole, currentUser]);

  async function loadNotifications() {
    try {
      const data = await client.getNotifications(currentRole);
      setNotifications([...data]);
    } catch {
      // fallback
    }
  }

  const handleToggleDrawer = async () => {
    const nextState = !notifDrawerOpen;
    setNotifDrawerOpen(nextState);
    if (nextState) {
      await loadNotifications();
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await client.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await client.markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    await client.markNotificationAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setNotifDrawerOpen(false);

    // Switch out of AI Mode to inspect the target page
    toggleAIMode(false);

    const ref = notif.refType || '';
    const titleLower = notif.title.toLowerCase();

    // 1. Employee role isolation: strictly /me/* routes
    if (currentRole === 'EMPLOYEE') {
      if (ref === 'Copilot' || titleLower.includes('copilot') || titleLower.includes('assistant')) {
        navigate('/me/assistant');
      } else if (ref === 'FirstWeek' || titleLower.includes('first-week') || titleLower.includes('orientation')) {
        navigate('/me/first-week');
      } else if (ref === 'Mentor' || titleLower.includes('mentor') || titleLower.includes('buddy')) {
        navigate('/me/mentor');
      } else if (ref === 'Marketplace' || titleLower.includes('marketplace') || titleLower.includes('package')) {
        navigate('/me/marketplace');
      } else {
        navigate('/me/tasks');
      }
      return;
    }

    // 2. IT role isolation: strictly /it/* routes
    if (currentRole === 'IT') {
      if (ref === 'Asset' || titleLower.includes('asset') || titleLower.includes('hardware')) {
        navigate('/it/assets');
      } else if (ref === 'Offboarding' || titleLower.includes('offboard')) {
        navigate('/it/offboarding');
      } else if (ref === 'Ticket' || titleLower.includes('ticket')) {
        navigate('/it/tickets');
      } else {
        navigate('/it');
      }
      return;
    }

    // 3. Manager role isolation: strictly /manager/* routes
    if (currentRole === 'MANAGER') {
      if (ref === 'Approval' || titleLower.includes('approval') || titleLower.includes('signoff')) {
        navigate('/manager/approvals');
      } else {
        navigate('/manager');
      }
      return;
    }

    // 4. Admin role isolation: strictly /admin/* routes
    if (currentRole === 'ADMIN') {
      if (ref === 'Marketplace' || titleLower.includes('marketplace')) {
        navigate('/admin/marketplace');
      } else if (ref === 'Users' || titleLower.includes('user') || titleLower.includes('role')) {
        navigate('/admin/users');
      } else {
        navigate('/admin/birthright');
      }
      return;
    }

    // 5. HR role: strictly /hr/* routes
    if (ref === 'Exception' || titleLower.includes('exception') || titleLower.includes('incident')) {
      navigate('/hr/exceptions');
    } else if (ref === 'BulkCSV' || titleLower.includes('bulk') || titleLower.includes('csv') || titleLower.includes('new')) {
      navigate('/hr/employees/new');
    } else if (ref === 'Offboarding' || titleLower.includes('offboard')) {
      navigate('/hr/offboarding');
    } else {
      navigate('/hr/employees');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications.filter(
    (n) => filterPriority === 'ALL' || n.priority === filterPriority
  );

  return (
    <>
      <header
        className={cn(
          'h-16 px-4 md:px-8 border-b flex items-center justify-between z-30 select-none flex-shrink-0 transition-colors duration-300',
          isLight
            ? 'bg-white/95 border-slate-200/80 backdrop-blur-md text-slate-900'
            : 'bg-[#000000]/90 border-neutral-800 backdrop-blur-md text-neutral-100'
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
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            )}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className={cn('w-4 h-4', isLight ? 'text-blue-600' : 'text-neutral-300')} />
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
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700'
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
              isLight ? 'border-slate-200' : 'border-neutral-800'
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
                  : 'text-neutral-400 hover:text-yellow-300 hover:bg-neutral-800'
              )}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? (
                <Sun className="w-4 h-4 text-amber-500 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-200 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Functional Notifications Button */}
            <button
              type="button"
              onClick={handleToggleDrawer}
              className={cn(
                'p-2 rounded-xl transition-colors relative cursor-pointer',
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800',
                notifDrawerOpen && (isLight ? 'bg-blue-50 text-blue-600' : 'bg-neutral-800 text-white')
              )}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span
                  className={cn(
                    'w-2 h-2 rounded-full absolute top-1.5 right-1.5 ring-2',
                    isLight ? 'bg-blue-600 ring-white' : 'bg-rose-500 ring-black'
                  )}
                />
              )}
            </button>

            {/* User Badge */}
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ml-1 shadow-xs',
                isLight
                  ? 'bg-blue-100 border border-blue-200 text-blue-700'
                  : 'bg-[#262626] border border-neutral-700 text-neutral-200'
              )}
            >
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Drawer Portal for AI Mode */}
      {notifDrawerOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex justify-end">
            {/* Backdrop */}
            <div
              onClick={() => setNotifDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            />

            {/* Drawer Container */}
            <div
              className={cn(
                'relative w-full max-w-md h-full shadow-2xl p-5 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 border-l',
                isLight
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-[#121212] border-neutral-800 text-neutral-100'
              )}
            >
              <div className="flex flex-col h-full overflow-hidden space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-3 flex-shrink-0 border-inherit">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center',
                        isLight ? 'bg-blue-50 text-blue-600' : 'bg-neutral-800 text-neutral-200'
                      )}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Notifications</h3>
                      <p className={cn('text-[11px]', isLight ? 'text-slate-500' : 'text-neutral-400')}>
                        {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setNotifDrawerOpen(false)}
                    className={cn(
                      'p-1.5 rounded-xl cursor-pointer transition-colors',
                      isLight
                        ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    )}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Priority Filter Chips */}
                <div className="flex items-center justify-between gap-2 text-xs flex-shrink-0 py-1">
                  <div
                    className={cn(
                      'flex items-center gap-1 p-1 rounded-xl border overflow-x-auto',
                      isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#1c1c1c] border-neutral-800'
                    )}
                  >
                    {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((pri) => {
                      const count =
                        pri === 'ALL'
                          ? notifications.length
                          : notifications.filter((n) => n.priority === pri).length;

                      return (
                        <button
                          key={pri}
                          onClick={() => setFilterPriority(pri)}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-1',
                            filterPriority === pri
                              ? isLight
                                ? 'bg-white text-slate-900 font-bold shadow-xs'
                                : 'bg-[#282828] text-white font-bold shadow-xs'
                              : isLight
                              ? 'text-slate-600 hover:text-slate-900'
                              : 'text-neutral-400 hover:text-white'
                          )}
                        >
                          <span>{pri}</span>
                          <span className="text-[9px] opacity-75 font-sans">({count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className={cn(
                        'text-[11px] font-semibold cursor-pointer whitespace-nowrap px-1',
                        isLight ? 'text-blue-600 hover:text-blue-700' : 'text-neutral-300 hover:text-white underline'
                      )}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification Items List */}
                <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 pt-1 ai-scrollbar">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center text-xs space-y-2 text-neutral-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                      <p className="font-semibold text-neutral-300">All clear</p>
                      <p>
                        No notifications match filter:{' '}
                        <strong className="font-mono text-neutral-200">{filterPriority}</strong>
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((n) => {
                      const isCritical = n.priority === 'CRITICAL';
                      const isHigh = n.priority === 'HIGH';
                      const isMedium = n.priority === 'MEDIUM';

                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={cn(
                            'p-3.5 rounded-2xl border transition-all cursor-pointer group space-y-2',
                            !n.read
                              ? isLight
                                ? isCritical
                                  ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                                  : isHigh
                                  ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                                  : 'bg-blue-50/50 border-blue-200 shadow-xs'
                                : isCritical
                                ? 'bg-rose-950/20 border-rose-900/50 shadow-xs'
                                : isHigh
                                ? 'bg-amber-950/20 border-amber-900/50 shadow-xs'
                                : 'bg-[#1c1c1c] border-neutral-700 shadow-xs'
                              : isLight
                              ? 'bg-white border-slate-200/80 opacity-70 hover:opacity-100 hover:bg-slate-50'
                              : 'bg-[#171717] border-neutral-800 opacity-70 hover:opacity-100 hover:bg-[#212121]'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge
                                variant={
                                  isCritical
                                    ? 'danger'
                                    : isHigh
                                    ? 'warning'
                                    : isMedium
                                    ? 'info'
                                    : 'default'
                                }
                                size="sm"
                                className="text-[10px] font-mono"
                              >
                                {n.priority}
                              </Badge>
                              <span
                                className={cn(
                                  'font-bold text-xs truncate transition-colors',
                                  isLight
                                    ? 'text-slate-900 group-hover:text-blue-600'
                                    : 'text-neutral-100 group-hover:text-white'
                                )}
                              >
                                {n.title}
                              </span>
                            </div>

                            {!n.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                title="Mark as read"
                                className={cn(
                                  'p-1 flex-shrink-0 cursor-pointer rounded-lg transition-colors',
                                  isLight
                                    ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                )}
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              </button>
                            )}
                          </div>

                          <p
                            className={cn(
                              'text-xs leading-relaxed font-normal',
                              isLight ? 'text-slate-600' : 'text-neutral-300'
                            )}
                          >
                            {n.body}
                          </p>

                          <div
                            className={cn(
                              'flex items-center justify-between text-[10px] font-mono pt-1.5 border-t',
                              isLight ? 'border-slate-100 text-slate-400' : 'border-neutral-800 text-neutral-400'
                            )}
                          >
                            <span>
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span
                              className={cn(
                                'flex items-center gap-1 font-sans font-semibold group-hover:translate-x-0.5 transition-transform',
                                isLight ? 'text-blue-600' : 'text-neutral-200'
                              )}
                            >
                              Take Action <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div
                className={cn(
                  'pt-3 border-t text-[11px] flex items-center justify-between flex-shrink-0',
                  isLight ? 'border-slate-100 text-slate-500' : 'border-neutral-800 text-neutral-400'
                )}
              >
                <span className="font-mono text-[10px]">OnboardOS Event Bus</span>
                <span className="font-mono text-[10px]">Role: {currentRole}</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
