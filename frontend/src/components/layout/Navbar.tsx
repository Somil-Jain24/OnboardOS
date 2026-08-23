import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { client } from '../../services';
import { cn } from '../../utils/cn';
import { getRealtimeConnectionState } from '../../utils/domainEventBus';
import {
  Bell,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Check,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import type { NotificationItem } from '../../types';
import { AIModeToggle, useAIMode } from '../ai-workspace';

export function Navbar() {
  const { currentRole, currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useAIMode();
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const navigate = useNavigate();

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
      <header className="sticky top-0 z-40 w-full h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shadow-xs">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            {/* Custom OnboardOS Geometric Logo */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-600/20 text-white font-bold group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3v3" />
                <path d="M12 18v3" />
                <path d="M3 12h3" />
                <path d="M18 12h3" />
                <path d="M5.6 5.6l2.1 2.1" />
                <path d="M16.3 16.3l2.1 2.1" />
                <path d="M5.6 18.4l2.1-2.1" />
                <path d="M16.3 7.7l2.1-2.1" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 tracking-tight">OnboardOS</span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  v1.0
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block -mt-0.5">
                AI-Assisted Orchestration
              </span>
            </div>
          </Link>
        </div>

        {/* Center Mode & Sync Pills */}
        <div className="hidden md:flex items-center gap-2.5">
          <AIModeToggle variant="navbar" />

          <div
            title={`Event Bus: ${getRealtimeConnectionState().source}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs cursor-help"
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full animate-pulse',
                getRealtimeConnectionState().color === 'emerald'
                  ? 'bg-emerald-500'
                  : getRealtimeConnectionState().color === 'amber'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
              )}
            />
            <span className="text-[11px] font-mono text-slate-600">
              {getRealtimeConnectionState().label}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={handleToggleDrawer}
              className="relative p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors cursor-pointer shadow-xs"
              title="Global Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-mono font-bold text-[9px] flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User Profile & Sign Out */}
          {currentUser ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono relative">
                  {(currentUser.name || 'User')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0 right-0" />
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono font-semibold uppercase">
                    {currentUser.role}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <span className="text-xs font-medium px-1">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Slide-over Notification Drawer */}
      {notifDrawerOpen &&
        createPortal(
          <div
            onClick={() => setNotifDrawerOpen(false)}
            className="fixed inset-0 z-[9999] bg-slate-900/30 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm sm:max-w-md h-screen bg-white border-l border-slate-200 shadow-2xl p-5 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200"
            >
              <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Smart Notification Center</h3>
                      <span className="text-[11px] text-slate-500">
                        {unreadCount > 0 ? `${unreadCount} unread actionable alerts` : 'All alerts up to date'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifDrawerOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Priority Filter Chips */}
                <div className="flex items-center justify-between gap-2 text-xs flex-shrink-0 py-1">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
                    {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((pri) => {
                      const count =
                        pri === 'ALL'
                          ? notifications.length
                          : notifications.filter((n) => n.priority === pri).length;

                      return (
                        <button
                          key={pri}
                          onClick={() => setFilterPriority(pri)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-1 ${filterPriority === pri
                            ? 'bg-white text-slate-900 font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
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
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer whitespace-nowrap px-1"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification Items List */}
                <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 pt-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                      <p className="font-semibold text-slate-700">All clear</p>
                      <p>No notifications match filter: <strong className="text-slate-900 font-mono">{filterPriority}</strong></p>
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
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer group space-y-2 ${!n.read
                            ? isCritical
                              ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                              : isHigh
                                ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                                : 'bg-blue-50/50 border-blue-200 shadow-xs'
                            : 'bg-white border-slate-200/80 opacity-70 hover:opacity-100 hover:bg-slate-50'
                            }`}
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
                              <span className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-600 transition-colors">
                                {n.title}
                              </span>
                            </div>

                            {!n.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                title="Mark as read"
                                className="text-slate-400 hover:text-slate-700 p-1 flex-shrink-0 cursor-pointer rounded-lg hover:bg-slate-100"
                              >
                                <Check className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-600" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            {n.body}
                          </p>

                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-100">
                            <span>
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="text-blue-600 flex items-center gap-1 font-sans font-semibold group-hover:translate-x-0.5 transition-transform">
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
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between flex-shrink-0">
                <span className="font-mono text-[10px]">OnboardOS Event Bus</span>
                <span className="text-slate-400 text-[10px] font-mono">Role: {currentRole}</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
