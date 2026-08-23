import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApprovals, useExceptions, useEmployee } from '../../hooks/useOnboardOS';
import { cn } from '../../utils/cn';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  AlertTriangle,
  CheckSquare,
  Sparkles,
  HeartHandshake,
  Calendar,
  Server,
  Laptop,
  ShieldAlert,
  ShieldCheck,
  ClipboardCheck,
  Sliders,
  Package,
  ShoppingBag,
  Clock,
  CircleDot,
  FileText,
  Workflow,
  Cpu,
  TrendingUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ArrowRightLeft,
  BarChart3,
  Target,
  RotateCcw,
  Award,
} from 'lucide-react';
import type { UserRole } from '../../types';

interface SubFeature {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'danger' | 'warning' | 'info' | 'success';
}

interface MainFeature {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'danger' | 'warning' | 'info' | 'success';
  children?: SubFeature[];
}

export function Sidebar() {
  const { currentRole, activeEmployeeId, setIsEmployeeDetailOpen } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});

  const { approvals } = useApprovals();
  const { exceptions } = useExceptions();
  const { tasks } = useEmployee(activeEmployeeId || 'emp-rahul');

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;
  const activeExceptionsCount = exceptions.filter((e) => e.severity !== 'RESOLVED').length;
  const dueTasksCount = tasks.filter((t) => t.status === 'PENDING' || t.status === 'WAITING_APPROVAL' || t.status === 'FAILED').length;

  const employeeAnalysisFeature: MainFeature = {
    id: 'employee-analysis',
    label: 'Employee Analysis',
    path: '/analysis/role-recommendation',
    icon: <BarChart3 className="w-4 h-4 text-emerald-600" />,
    badge: '4 Tools',
    badgeVariant: 'info',
    children: [
      { label: 'AI Role Recommendation', path: '/analysis/role-recommendation', icon: <Sparkles className="w-3 h-3 text-blue-600" /> },
      { label: 'AI Recovery Plan', path: '/analysis/recovery-plan', icon: <RotateCcw className="w-3 h-3 text-rose-500" /> },
      { label: 'Pre vs Post Comparison', path: '/analysis/readiness-comparison', icon: <ArrowRightLeft className="w-3 h-3 text-purple-600" /> },
      { label: 'Role Readiness Passport', path: '/analysis/role-passport', icon: <Award className="w-3 h-3 text-amber-500" /> },
    ],
  };

  const getMainFeatures = (role: UserRole): MainFeature[] => {
    switch (role) {
      case 'HR':
        return [
          {
            id: 'hr-command',
            label: 'HR Operations & Directory',
            path: '/hr',
            icon: <LayoutDashboard className="w-4 h-4 text-blue-600" />,
            badge: 'Active',
            children: [
              { label: 'HR Command Center', path: '/hr', icon: <CircleDot className="w-3 h-3 text-blue-600" /> },
              { label: 'Employee Directory', path: '/hr/employees', icon: <Users className="w-3 h-3 text-slate-500" /> },
              { label: 'Add New Employee (CSV/Form)', path: '/hr/employees/new', icon: <UserPlus className="w-3 h-3 text-emerald-600" /> },
              { label: 'Employee Offboarding', path: '/hr/offboarding', icon: <ShieldAlert className="w-3 h-3 text-rose-600" /> },
              { 
                label: 'Exception Center', 
                path: '/hr/exceptions', 
                icon: <AlertTriangle className="w-3 h-3 text-amber-500" />, 
                badge: activeExceptionsCount > 0 ? String(activeExceptionsCount) : undefined, 
                badgeVariant: 'warning' 
              },
            ],
          },
          employeeAnalysisFeature,
          {
            id: 'hr-employee-360',
            label: 'Employee Orchestration Hub',
            path: '/employees/emp-rahul',
            icon: <Cpu className="w-4 h-4 text-purple-600" />,
            badge: '360°',
            children: [
              { label: 'Command Center 360°', path: '/employees/emp-rahul', icon: <CircleDot className="w-3 h-3 text-purple-600" /> },
              { label: 'Onboarding Plan Detail', path: '/employees/emp-rahul/plan', icon: <FileText className="w-3 h-3 text-slate-500" /> },
              { label: 'Access Graph Topology', path: '/employees/emp-rahul/access', icon: <Workflow className="w-3 h-3 text-blue-600" /> },
              { label: 'Provisioning DAG Queue', path: '/employees/emp-rahul/provisioning', icon: <Cpu className="w-3 h-3 text-amber-500" /> },
              { label: 'Audit & State Timeline', path: '/employees/emp-rahul/timeline', icon: <Clock className="w-3 h-3 text-slate-500" /> },
              { label: 'What-If Simulation Lab', path: '/employees/emp-rahul/whatif', icon: <Sliders className="w-3 h-3 text-indigo-600" /> },
              { label: 'Risk & Readiness Metrics', path: '/employees/emp-rahul/risk', icon: <TrendingUp className="w-3 h-3 text-emerald-600" /> },
            ],
          },
          {
            id: 'hr-people',
            label: 'Lifecycle & People Platform',
            path: '/employees/emp-rahul/mentor',
            icon: <HeartHandshake className="w-4 h-4 text-rose-500" />,
            children: [
              { label: 'Mentors & Buddies', path: '/employees/emp-rahul/mentor', icon: <HeartHandshake className="w-3 h-3 text-rose-500" /> },
              { label: 'First-Week Planner', path: '/employees/emp-rahul/first-week', icon: <Calendar className="w-3 h-3 text-cyan-600" /> },
            ],
          },
        ];

      case 'MANAGER':
        return [
          {
            id: 'mgr-dashboard',
            label: 'Manager Dashboard & Approvals',
            path: '/manager',
            icon: <LayoutDashboard className="w-4 h-4 text-amber-600" />,
            badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : undefined,
            badgeVariant: 'warning',
            children: [
              { label: 'Direct Reports Dashboard', path: '/manager', icon: <CircleDot className="w-3 h-3 text-amber-600" /> },
              { 
                label: 'Access Approval Queue', 
                path: '/manager/approvals', 
                icon: <CheckSquare className="w-3 h-3 text-emerald-600" />, 
                badge: pendingApprovalsCount > 0 ? String(pendingApprovalsCount) : undefined, 
                badgeVariant: 'warning' 
              },
            ],
          },
          employeeAnalysisFeature,
          {
            id: 'mgr-enablement',
            label: 'Team Enablement & Readiness',
            path: '/employees/emp-rahul/risk',
            icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
            children: [
              { label: 'Direct Report 360 View', path: '/employees/emp-rahul', icon: <Users className="w-3 h-3 text-slate-500" /> },
              { label: 'Risk & Readiness Metrics', path: '/employees/emp-rahul/risk', icon: <TrendingUp className="w-3 h-3 text-blue-600" /> },
              { label: 'Assign Peer Mentors', path: '/employees/emp-rahul/mentor', icon: <HeartHandshake className="w-3 h-3 text-rose-500" /> },
              { label: 'First-Week Schedule Check', path: '/employees/emp-rahul/first-week', icon: <Calendar className="w-3 h-3 text-cyan-600" /> },
            ],
          },
        ];

      case 'IT':
        return [
          {
            id: 'it-operations',
            label: 'Core Workplace Operations',
            path: '/it',
            icon: <Server className="w-4 h-4 text-purple-600" />,
            badge: 'Active',
            children: [
              { label: 'IT Operations Dashboard', path: '/it', icon: <CircleDot className="w-3 h-3 text-purple-600" /> },
              { label: 'Hardware Asset Tracking', path: '/it/assets', icon: <Laptop className="w-3 h-3 text-emerald-600" /> },
            ],
          },
          {
            id: 'it-security',
            label: 'Security & Access Lifecycle',
            path: '/it/offboarding',
            icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
            children: [
              { label: 'Offboarding Security Risks', path: '/it/offboarding', icon: <ShieldAlert className="w-3 h-3 text-rose-600" /> },
            ],
          },
        ];

      case 'EMPLOYEE':
        return [
          {
            id: 'emp-workspace',
            label: 'My Onboarding Workspace',
            path: '/me',
            icon: <LayoutDashboard className="w-4 h-4 text-emerald-600" />,
            badge: 'Active',
            children: [
              { label: 'My Dashboard Overview', path: '/me', icon: <CircleDot className="w-3 h-3 text-emerald-600" /> },
              { 
                label: 'Daily Tasks & Checklist', 
                path: '/me/tasks', 
                icon: <CheckSquare className="w-3 h-3 text-blue-600" />, 
                badge: dueTasksCount > 0 ? `${dueTasksCount} Due` : undefined, 
                badgeVariant: 'info' 
              },
              { label: 'AI Onboarding Copilot', path: '/me/assistant', icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" />, badge: 'AI', badgeVariant: 'info' },
              { label: 'Request Access Marketplace', path: '/me/marketplace', icon: <ShoppingBag className="w-3 h-3 text-cyan-600" /> },
            ],
          },
          {
            id: 'emp-journey',
            label: 'First Week & Connections',
            path: '/me/first-week',
            icon: <Calendar className="w-4 h-4 text-cyan-600" />,
            children: [
              { label: 'First-Week Schedule', path: '/me/first-week', icon: <Calendar className="w-3 h-3 text-cyan-600" /> },
              { label: 'My Mentor & Buddy', path: '/me/mentor', icon: <HeartHandshake className="w-3 h-3 text-rose-500" /> },
            ],
          },
          {
            id: 'emp-mobility',
            label: 'Career & Internal Transfer',
            path: '/me/transfer',
            icon: <ArrowRightLeft className="w-4 h-4 text-indigo-600" />,
            children: [
              { label: 'Internal Role Transfer', path: '/me/transfer', icon: <ArrowRightLeft className="w-3 h-3 text-indigo-600" /> },
            ],
          },
        ];

      case 'ADMIN':
      default:
        return [
          {
            id: 'adm-p0',
            label: 'Identity & Access Governance',
            path: '/admin/birthright',
            icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
            badge: 'Core',
            children: [
              { label: 'Birthright Policies', path: '/admin/birthright', icon: <ShieldCheck className="w-3 h-3 text-blue-600" /> },
              { label: 'Access Packages Catalog', path: '/admin/packages', icon: <Package className="w-3 h-3 text-indigo-600" /> },
              { label: 'Access Request Marketplace', path: '/admin/marketplace', icon: <ShoppingBag className="w-3 h-3 text-cyan-600" /> },
              { label: 'Time-Bound Grants (TTL)', path: '/admin/grants', icon: <Clock className="w-3 h-3 text-amber-600" /> },
              { label: 'Access Certifications (UAR)', path: '/admin/certifications', icon: <ClipboardCheck className="w-3 h-3 text-emerald-600" /> },
              { label: 'SoD Toxic Conflict Center', path: '/admin/sod', icon: <ShieldAlert className="w-3 h-3 text-rose-600" /> },
            ],
          },
          {
            id: 'adm-platform',
            label: 'Platform Engine & Simulation',
            path: '/admin/roles',
            icon: <Sliders className="w-4 h-4 text-indigo-600" />,
            children: [
              { label: 'Policy Rulesets Engine', path: '/admin/roles', icon: <ShieldCheck className="w-3 h-3 text-slate-500" /> },
              { label: 'User & RBAC Permissions', path: '/admin/users', icon: <Users className="w-3.5 h-3.5 text-slate-500" /> },
              { label: 'Executive Governance Analytics', path: '/admin/analytics', icon: <TrendingUp className="w-3 h-3 text-blue-600" /> },
              { label: 'Demo Control Lab', path: '/_demo', icon: <Sliders className="w-3 h-3 text-indigo-600" />, badge: 'Demo', badgeVariant: 'info' },
            ],
          },
        ];
    }
  };

  const features = getMainFeatures(currentRole);

  useEffect(() => {
    const active = features.find((f) => {
      if (location.pathname === f.path) return true;
      return f.children?.some((c) => location.pathname === c.path);
    });
    if (active) {
      setExpandedFeatures((prev) => ({ ...prev, [active.id]: true }));
    }
  }, [location.pathname, currentRole]);

  const toggleFeature = (id: string) => {
    setExpandedFeatures((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isChildActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-slate-200/80 bg-white transition-all duration-300 select-none z-20 shadow-xs',
        collapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 tracking-tight block">OnboardOS</span>
              <span className="text-[10px] font-semibold text-blue-600 block uppercase tracking-wider">Enterprise</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
            <Cpu className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors',
            collapsed && 'hidden'
          )}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {features.map((feature) => {
          const isExpanded = Boolean(expandedFeatures[feature.id]);
          const hasChildren = Boolean(feature.children && feature.children.length > 0);

          return (
            <div key={feature.id} className="space-y-1">
              {!collapsed && (
                <button
                  onClick={() => {
                    if (hasChildren) {
                      toggleFeature(feature.id);
                    } else {
                      navigate(feature.path);
                      if (currentRole === 'EMPLOYEE') setIsEmployeeDetailOpen(true);
                    }
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700 transition-colors group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {feature.icon}
                    <span>{feature.label}</span>
                  </span>
                  {hasChildren && (
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      )}
                    />
                  )}
                </button>
              )}

              {/* Sub-items */}
              {(!collapsed && isExpanded && hasChildren) && (
                <div className="pl-2 space-y-0.5 border-l border-slate-100 ml-3 mt-1">
                  {feature.children?.map((sub) => {
                    const active = isChildActive(sub.path);
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        onClick={() => {
                          if (currentRole === 'EMPLOYEE') setIsEmployeeDetailOpen(true);
                        }}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group',
                          active
                            ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          {sub.icon}
                          <span className="truncate">{sub.label}</span>
                        </span>
                        {sub.badge && (
                          <span
                            className={cn(
                              'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                              sub.badgeVariant === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : sub.badgeVariant === 'info'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            )}
                          >
                            {sub.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapse Toggle Footer */}
      {collapsed && (
        <div className="p-3 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
