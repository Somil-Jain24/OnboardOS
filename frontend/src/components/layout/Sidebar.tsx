import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  AlertTriangle,
  CheckSquare,
  Sparkles,
  LifeBuoy,
  Server,
  Ticket,
  Laptop,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  Sliders,
  ChevronsLeft,
  ChevronsRight,
  Shield,
  Layers,
} from 'lucide-react';
import type { UserRole } from '../../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'danger' | 'warning' | 'info';
  section?: string;
}

export function Sidebar() {
  const { currentRole } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const getNavItems = (role: UserRole): NavItem[] => {
    switch (role) {
      case 'HR':
        return [
          { section: 'ORCHESTRATION', label: 'HR Dashboard', path: '/hr', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Employee Directory', path: '/hr/employees', icon: <Users className="w-4 h-4" /> },
          { label: 'Onboard New Hire', path: '/hr/employees/new', icon: <UserPlus className="w-4 h-4" /> },
          { label: 'Exception Center', path: '/hr/exceptions', icon: <AlertTriangle className="w-4 h-4" />, badge: '1', badgeVariant: 'warning' },
          { section: 'RESOURCES', label: 'Company Knowledge', path: '/knowledge', icon: <BookOpen className="w-4 h-4" /> },
        ];
      case 'MANAGER':
        return [
          { section: 'TEAM ORCHESTRATION', label: 'Manager Hub', path: '/manager', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'My Team', path: '/hr/employees', icon: <Users className="w-4 h-4" /> },
          { label: 'Approval Queue', path: '/manager/approvals', icon: <CheckSquare className="w-4 h-4" />, badge: '1', badgeVariant: 'warning' },
          { section: 'RESOURCES', label: 'Company Knowledge', path: '/knowledge', icon: <BookOpen className="w-4 h-4" /> },
        ];
      case 'EMPLOYEE':
        return [
          { section: 'ONBOARDING HUB', label: 'My Dashboard', path: '/me', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Onboarding Tasks', path: '/me/tasks', icon: <CheckSquare className="w-4 h-4" /> },
          { label: 'AI Assistant', path: '/me/assistant', icon: <Sparkles className="w-4 h-4 text-purple-600" />, badge: 'AI', badgeVariant: 'info' },
          { label: 'IT Helpdesk', path: '/me/help', icon: <LifeBuoy className="w-4 h-4" /> },
          { section: 'RESOURCES', label: 'Company Knowledge', path: '/knowledge', icon: <BookOpen className="w-4 h-4" /> },
        ];
      case 'IT':
        return [
          { section: 'OPERATIONS', label: 'IT Dashboard', path: '/it', icon: <Server className="w-4 h-4" /> },
          { label: 'Ticket Queue', path: '/it/tickets', icon: <Ticket className="w-4 h-4" />, badge: '1', badgeVariant: 'warning' },
          { label: 'Asset Management', path: '/it/assets', icon: <Laptop className="w-4 h-4" /> },
          { label: 'Offboarding Risks', path: '/it/offboarding', icon: <ShieldAlert className="w-4 h-4" />, badge: '1', badgeVariant: 'danger' },
          { section: 'RESOURCES', label: 'Company Knowledge', path: '/knowledge', icon: <BookOpen className="w-4 h-4" /> },
        ];
      case 'ADMIN':
      default:
        return [
          { section: 'POLICY ENGINE', label: 'Birthright Policies', path: '/admin/birthright', icon: <ShieldCheck className="w-4 h-4" /> },
          { label: 'Policy Rulesets', path: '/admin/roles', icon: <Layers className="w-4 h-4" /> },
          { label: 'Users & RBAC', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
          { section: 'DEMO CONTROL', label: 'Demo Control Lab', path: '/_demo', icon: <Sliders className="w-4 h-4" />, badge: 'Demo', badgeVariant: 'info' },
          { section: 'RESOURCES', label: 'Company Knowledge', path: '/knowledge', icon: <BookOpen className="w-4 h-4" /> },
        ];
    }
  };

  const navItems = getNavItems(currentRole);

  return (
    <aside
      className={cn(
        'flex-shrink-0 border-r border-slate-200/80 bg-white flex flex-col justify-between hidden md:flex transition-all duration-300 z-20',
        collapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Scrollable Navigation List */}
      <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
        {navItems.map((item, idx) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && item.path !== '/hr' && item.path !== '/me' && item.path !== '/it' && item.path !== '/manager' && location.pathname.startsWith(item.path + '/'));

          return (
            <div key={item.path}>
              {item.section && !collapsed && (
                <div
                  className={cn(
                    'px-3 pt-4 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono',
                    idx === 0 && 'pt-1.5'
                  )}
                >
                  {item.section}
                </div>
              )}
              <Link
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group duration-150',
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'transition-colors flex-shrink-0',
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
                    )}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold font-mono',
                      item.badgeVariant === 'danger'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.badgeVariant === 'warning'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : item.badgeVariant === 'info'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Section: System Health + Collapse Toggle */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/40">
        {!collapsed ? (
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900">System Healthy</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-slate-500 truncate">Provisioning engine active</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Shield className="w-4 h-4" />
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronsLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
