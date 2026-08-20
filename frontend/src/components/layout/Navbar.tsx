import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
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
} from 'lucide-react';
import type { UserRole } from '../../types';

export function Navbar() {
  const { currentRole, currentUser, switchRole, availableUsers } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const navigate = useNavigate();

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
    // Route to appropriate role home
    if (role === 'HR') navigate('/hr');
    else if (role === 'MANAGER') navigate('/manager');
    else if (role === 'EMPLOYEE') navigate('/me');
    else if (role === 'IT') navigate('/it');
    else if (role === 'ADMIN') navigate('/admin/roles');
  };

  return (
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
                v1.0 Demo
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

      {/* Right actions: Role switcher, Notifications, Demo Control, Profile */}
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
          title="Open Demo Control Panel (Seed, Reset, Inject Failures)"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Demo Lab</span>
        </Link>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {notifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/60 mb-2">
                <span className="text-xs font-semibold text-slate-200">Notifications</span>
                <span className="text-[10px] font-mono text-blue-400">3 priority</span>
              </div>
              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-rose-400">Jira Provisioning Failed</span>
                    <span className="text-[10px] text-slate-500">2m ago</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Rahul Sharma: 2 downstream tasks BLOCKED pending retry.
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-400">Approval Required</span>
                    <span className="text-[10px] text-slate-500">10m ago</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    AWS Production Access pending Manager signoff.
                  </p>
                </div>
              </div>
            </div>
          )}
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
  );
}
