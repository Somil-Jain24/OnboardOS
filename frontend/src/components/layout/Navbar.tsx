import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { client } from '../../services';
import {
  Layers,
  Bell,
  Sliders,
  Shield,
  UserCheck,
  Briefcase,
  Terminal,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Check,
  X,
  Filter,
} from 'lucide-react';
import type { UserRole, NotificationItem } from '../../types';

export function Navbar() {
  const { currentRole, currentUser, switchRole, availableUsers } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [currentUser]);

  async function loadNotifications() {
    try {
      const data = await client.getNotifications('');
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

    if (
      notif.refType === 'Task' ||
      notif.title.toLowerCase().includes('jira') ||
      notif.title.toLowerCase().includes('provisioning')
    ) {
      navigate('/employees/emp-rahul/provisioning');
    } else if (
      notif.refType === 'Approval' ||
      notif.title.toLowerCase().includes('approval')
    ) {
      navigate('/manager/approvals');
    } else if (
      notif.refType === 'Campaign' ||
      notif.title.toLowerCase().includes('review')
    ) {
      navigate('/admin/certifications');
    } else if (
      notif.refType === 'Reconciliation' ||
      notif.title.toLowerCase().includes('drift')
    ) {
      navigate('/admin/reconciliation');
    } else if (
      notif.refType === 'Pulse' ||
      notif.title.toLowerCase().includes('pulse')
    ) {
      navigate('/me/pulse');
    } else if (
      notif.refType === 'Community' ||
      notif.title.toLowerCase().includes('community')
    ) {
      navigate('/community');
    } else {
      navigate('/hr/exceptions');
    }
  };

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
    HR: {
      label: 'HR Operations',
      icon: <Briefcase className="w-3.5 h-3.5" />,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      desc: 'Employee directory, plan generation, exceptions',
    },
    MANAGER: {
      label: 'Team Manager',
      icon: <UserCheck className="w-3.5 h-3.5" />,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      desc: 'Approvals queue, direct reports readiness',
    },
    EMPLOYEE: {
      label: 'New Employee',
      icon: <Layers className="w-3.5 h-3.5" />,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      desc: 'Self onboarding, daily tasks, AI assistant',
    },
    IT: {
      label: 'IT Operations',
      icon: <Terminal className="w-3.5 h-3.5" />,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      desc: 'Provisioning retries, ticket triage, assets',
    },
    ADMIN: {
      label: 'Security & Admin',
      icon: <Shield className="w-3.5 h-3.5" />,
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      desc: 'Policy rulesets, full platform governance',
    },
  };

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setRoleMenuOpen(false);
    if (role === 'HR') navigate('/hr');
    else if (role === 'MANAGER') navigate('/manager');
    else if (role === 'EMPLOYEE') navigate('/me');
    else if (role === 'IT') navigate('/it');
    else if (role === 'ADMIN') navigate('/admin/roles');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications.filter(
    (n) => filterPriority === 'ALL' || n.priority === filterPriority
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-600/20 border border-blue-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-100 tracking-tight">OnboardOS</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  v1.0
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wide block -mt-0.5">
                AI-Assisted Orchestration
              </span>
            </div>
          </Link>
        </div>

        {/* Center status banner */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-slate-400">Mode:</span>
          <span className="font-semibold text-emerald-400">Deterministic Rules + AI Reasoning</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-xs font-medium text-slate-200 transition-all cursor-pointer"
            >
              <span className="text-slate-400 text-[11px] uppercase tracking-wider">Role:</span>
              <Badge
                variant="default"
                size="sm"
                className={roleLabels[currentRole].color}
                icon={roleLabels[currentRole].icon}
              >
                {roleLabels[currentRole].label}
              </Badge>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800/60 mb-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Persona / Role View
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Simulate role-guarded experiences live
                  </p>
                </div>
                {availableUsers.map((user) => {
                  const config = roleLabels[user.role];
                  const isActive = user.role === currentRole;
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleRoleSwitch(user.role)}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-600/15 border border-blue-500/30'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5">{config.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">
                            {config.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {user.name.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {config.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Demo Control Panel Button */}
          <Link
            to="/_demo"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 text-xs font-medium text-indigo-300 transition-colors"
            title="Open Demo Control Panel"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Lab</span>
          </Link>

          {/* TASK-185: Enhanced Global Notifications Bell Trigger */}
          <div className="relative">
            <button
              onClick={handleToggleDrawer}
              className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
              title="Global Notification Center"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-mono font-bold text-[9px] flex items-center justify-center shadow-md animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <Avatar name={currentUser.name} size="sm" status="online" />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-medium text-slate-200 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">
                {currentUser.role}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* TASK-185: Slide-over Notification Center Drawer Portal (Renders to Body to prevent clipping) */}
      {notifDrawerOpen &&
        createPortal(
          <div
            onClick={() => setNotifDrawerOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm sm:max-w-md h-screen bg-slate-950 border-l border-slate-800 shadow-2xl p-4 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200"
            >
              <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">Smart Notification Center</h3>
                      <span className="text-[11px] text-slate-400">
                        {unreadCount > 0 ? `${unreadCount} unread actionable alerts` : 'All alerts up to date'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Priority Filter Chips & Quick Actions Bar */}
                <div className="flex items-center justify-between gap-2 text-xs flex-shrink-0 py-1">
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto">
                    {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((pri) => {
                      const count =
                        pri === 'ALL'
                          ? notifications.length
                          : notifications.filter((n) => n.priority === pri).length;

                      return (
                        <button
                          key={pri}
                          onClick={() => setFilterPriority(pri)}
                          className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                            filterPriority === pri
                              ? 'bg-blue-600 text-white font-bold shadow-sm'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer whitespace-nowrap px-1"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification Items List */}
                <div className="space-y-2 overflow-y-auto flex-1 pr-1 pt-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs space-y-2">
                      <CheckCircle2 className="w-6 h-6 mx-auto text-slate-600" />
                      <p>No notifications match priority filter: <strong className="text-slate-400 font-mono">{filterPriority}</strong></p>
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
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer group space-y-2 ${
                            !n.read
                              ? isCritical
                                ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500 shadow-sm'
                                : isHigh
                                ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500 shadow-sm'
                                : 'bg-blue-950/20 border-blue-500/40 hover:border-blue-500 shadow-sm'
                              : 'bg-slate-900/60 border-slate-800/80 opacity-70 hover:opacity-100 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
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
                                className="text-[9px] px-1.5 py-0 flex-shrink-0 font-mono"
                              >
                                {n.priority}
                              </Badge>
                              <span className="font-semibold text-slate-100 text-xs truncate group-hover:text-blue-300">
                                {n.title}
                              </span>
                            </div>

                            {!n.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                title="Mark as read"
                                className="text-slate-400 hover:text-slate-200 p-1 flex-shrink-0 cursor-pointer rounded hover:bg-slate-800"
                              >
                                <Check className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-400" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed font-normal">
                            {n.body}
                          </p>

                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                            <span>
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="text-blue-400 flex items-center gap-1 font-sans font-medium group-hover:translate-x-0.5 transition-transform">
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
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between flex-shrink-0">
                <span className="font-mono text-[10px]">OnboardOS Event Bus</span>
                <Link
                  to="/hr/exceptions"
                  onClick={() => setNotifDrawerOpen(false)}
                  className="text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Incident Center <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
