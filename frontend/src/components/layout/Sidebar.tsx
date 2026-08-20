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
  Calendar,
  HeartHandshake,
  SmilePlus,
  Server,
  Ticket,
  Laptop,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  MessageSquare,
  Sliders,
  Package,
  ShoppingBag,
  Clock,
  ClipboardCheck,
  KeyRound,
  GitCompare,
  Users2,
  FileCheck2,
  ClockAlert,
  CreditCard,
  Bot,
  UserCheck,
  TrendingUp,
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

  const getNavItems = (role: UserRole): NavItem[] => {
    switch (role) {
      case 'HR':
        return [
          { section: 'ORCHESTRATION', label: 'HR Command Center', path: '/hr', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Employee Directory', path: '/hr/employees', icon: <Users className="w-4 h-4" /> },
          { label: 'New Hire Onboard', path: '/hr/employees/new', icon: <UserPlus className="w-4 h-4" /> },
          { label: 'Exception Center', path: '/hr/exceptions', icon: <AlertTriangle className="w-4 h-4" />, badge: '2', badgeVariant: 'warning' },
          { section: 'WORKSPACE', label: 'Company Knowledge', path: '/knowledge', icon: <BookOpen className="w-4 h-4" /> },
          { label: 'Community Hub', path: '/community', icon: <MessageSquare className="w-4 h-4" /> },
        ];
      case 'MANAGER':
        return [
          { section: 'TEAM ORCHESTRATION', label: 'Manager Hub', path: '/manager', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Approval Queue', path: '/manager/approvals', icon: <CheckSquare className="w-4 h-4" />, badge: '4', badgeVariant: 'warning' },
          { label: 'Access Reviews', path: '/admin/certifications', icon: <ClipboardCheck className="w-4 h-4" />, badge: 'UAR', badgeVariant: 'info' },
          { section: 'WORKSPACE', label: 'Company Knowledge', path: '/knowledge', icon: <BookOpen className="w-4 h-4" /> },
          { label: 'Community Hub', path: '/community', icon: <MessageSquare className="w-4 h-4" /> },
        ];
      case 'EMPLOYEE':
        return [
          { section: 'MY ONBOARDING', label: 'Employee Portal', path: '/me', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'My Daily Tasks', path: '/me/tasks', icon: <CheckSquare className="w-4 h-4" /> },
          { label: 'Access Marketplace', path: '/admin/marketplace', icon: <ShoppingBag className="w-4 h-4" />, badge: 'New', badgeVariant: 'info' },
          { label: 'AI Assistant', path: '/me/assistant', icon: <Sparkles className="w-4 h-4" />, badge: 'AI', badgeVariant: 'info' },
          { label: 'IT Helpdesk', path: '/me/help', icon: <LifeBuoy className="w-4 h-4" /> },
          { section: 'LIFECYCLE', label: 'First-Week Plan', path: '/me/first-week', icon: <Calendar className="w-4 h-4" /> },
          { label: 'My Mentor & Buddy', path: '/me/mentor', icon: <HeartHandshake className="w-4 h-4" /> },
          { label: 'Employee Pulse', path: '/me/pulse', icon: <SmilePlus className="w-4 h-4" /> },
          { section: 'WORKSPACE', label: 'Company Knowledge', path: '/knowledge', icon: <BookOpen className="w-4 h-4" /> },
          { label: 'Community Hub', path: '/community', icon: <MessageSquare className="w-4 h-4" /> },
        ];
      case 'IT':
        return [
          { section: 'OPERATIONS', label: 'IT Dashboard', path: '/it', icon: <Server className="w-4 h-4" /> },
          { label: 'Ticket Queue', path: '/it/tickets', icon: <Ticket className="w-4 h-4" />, badge: '3', badgeVariant: 'warning' },
          { label: 'Asset Management', path: '/it/assets', icon: <Laptop className="w-4 h-4" /> },
          { label: 'Offboarding Risks', path: '/it/offboarding', icon: <ShieldAlert className="w-4 h-4" />, badge: '1', badgeVariant: 'danger' },
          { label: 'Time-Bound Grants', path: '/admin/grants', icon: <Clock className="w-4 h-4" /> },
          { label: 'SCIM Connectors', path: '/admin/scim', icon: <Server className="w-4 h-4" /> },
          { section: 'WORKSPACE', label: 'Company Knowledge', path: '/knowledge', icon: <BookOpen className="w-4 h-4" /> },
          { label: 'Community Hub', path: '/community', icon: <MessageSquare className="w-4 h-4" /> },
        ];
      case 'ADMIN':
      default:
        return [
          { section: 'P0 IDENTITY GOVERNANCE', label: 'Birthright Policies', path: '/admin/birthright', icon: <ShieldCheck className="w-4 h-4" />, badge: 'P0', badgeVariant: 'info' },
          { label: 'Access Packages', path: '/admin/packages', icon: <Package className="w-4 h-4" /> },
          { label: 'Access Marketplace', path: '/admin/marketplace', icon: <ShoppingBag className="w-4 h-4" /> },
          { label: 'Time-Bound Grants', path: '/admin/grants', icon: <Clock className="w-4 h-4" /> },
          { label: 'Access Certifications', path: '/admin/certifications', icon: <ClipboardCheck className="w-4 h-4" /> },
          { label: 'SoD Conflict Center', path: '/admin/sod', icon: <ShieldAlert className="w-4 h-4" /> },

          { section: 'P1 ADVANCED GOVERNANCE', label: 'JIT Privileged Access', path: '/admin/jit', icon: <KeyRound className="w-4 h-4" />, badge: 'P1', badgeVariant: 'warning' },
          { label: 'Identity Reconciliation', path: '/admin/reconciliation', icon: <GitCompare className="w-4 h-4" /> },
          { label: 'SCIM Connectors', path: '/admin/scim', icon: <Server className="w-4 h-4" /> },
          { label: 'External Identities', path: '/admin/external-identities', icon: <Users2 className="w-4 h-4" /> },
          { label: 'Compliance Evidence', path: '/admin/compliance', icon: <FileCheck2 className="w-4 h-4" /> },
          { label: 'Stale Access Detection', path: '/admin/stale-access', icon: <ClockAlert className="w-4 h-4" /> },

          { section: 'P2 STRATEGIC EXTENSIONS', label: 'Device Trust Posture', path: '/admin/devices', icon: <Laptop className="w-4 h-4" />, badge: 'P2', badgeVariant: 'default' },
          { label: 'SaaS License Intel', path: '/admin/licenses', icon: <CreditCard className="w-4 h-4" /> },
          { label: 'AI Agent Governance', path: '/admin/agents', icon: <Bot className="w-4 h-4" /> },
          { label: 'Delegated Admin', path: '/admin/delegated-admin', icon: <UserCheck className="w-4 h-4" /> },
          { label: 'Executive Analytics', path: '/admin/analytics', icon: <TrendingUp className="w-4 h-4" /> },

          { section: 'PLATFORM ADMIN', label: 'Policy Rulesets', path: '/admin/roles', icon: <ShieldCheck className="w-4 h-4" /> },
          { label: 'User & RBAC', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
          { section: 'SIMULATION', label: 'Demo Control Lab', path: '/_demo', icon: <Sliders className="w-4 h-4" />, badge: 'Demo', badgeVariant: 'info' },
          { section: 'WORKSPACE', label: 'Company Knowledge', path: '/knowledge', icon: <BookOpen className="w-4 h-4" /> },
          { label: 'Community Hub', path: '/community', icon: <MessageSquare className="w-4 h-4" /> },
        ];
    }
  };

  const navItems = getNavItems(currentRole);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-sm flex flex-col justify-between hidden md:flex">
      <div className="p-3 space-y-1 overflow-y-auto max-h-screen">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));

          return (
            <div key={item.path}>
              {item.section && (
                <div className={cn('px-3 pt-4 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono', idx === 0 && 'pt-1')}>
                  {item.section}
                </div>
              )}
              <Link
                to={item.path}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30 shadow-sm shadow-blue-600/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn('transition-colors', isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300')}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono',
                      item.badgeVariant === 'danger'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : item.badgeVariant === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : item.badgeVariant === 'info'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
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
    </aside>
  );
}
