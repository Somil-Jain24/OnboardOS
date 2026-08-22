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
  ClockAlert,
  Network,
  CircleDot,
  FileText,
  Workflow,
  Cpu,
  TrendingUp,
  ChevronDown,
  Shield,
  ChevronsLeft,
  ChevronsRight,
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
  const failedTasksCount = tasks.filter((t) => t.status === 'FAILED').length;
  const dueTasksCount = tasks.filter((t) => t.status === 'PENDING' || t.status === 'WAITING_APPROVAL' || t.status === 'FAILED').length;

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
    const nextState: Record<string, boolean> = {};
    features.forEach((f) => {
      nextState[f.id] = true;
    });
    setExpandedFeatures((prev) => ({ ...nextState, ...prev }));
  }, [currentRole]);

  const toggleFeature = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedFeatures((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleMainFeatureClick = (feature: MainFeature) => {
    navigate(feature.path);
    setExpandedFeatures((prev) => ({
      ...prev,
      [feature.id]: true,
    }));
  };

  return (
    <aside
      className={cn(
        'flex-shrink-0 border-r border-slate-200/80 bg-white flex flex-col justify-between hidden md:flex transition-all duration-300 z-20 shadow-xs select-none',
        collapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Scrollable Features Tree */}
      <div className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-thin scrollbar-thumb-slate-200">
        <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono px-2 pt-1 pb-0.5">
          Role Navigation Hub
        </div>

        {currentRole === 'EMPLOYEE' && !collapsed && (
          <div className="p-3 rounded-2xl bg-blue-50/90 border border-blue-200/90 mb-2 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase font-mono text-blue-700">Workspace Persona</span>
              <button
                onClick={() => {
                  setIsEmployeeDetailOpen(false);
                  navigate('/me');
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
              >
                Switch Profile
              </button>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate">
              {activeEmployeeId === 'emp-rahul' ? 'Rahul Sharma' : activeEmployeeId}
            </p>
          </div>
        )}

        {features.map((feature) => {
          const isExpanded = expandedFeatures[feature.id] ?? true;
          const isMainActive = location.pathname === feature.path;
          const hasActiveChild = feature.children?.some(
            (child) =>
              location.pathname === child.path ||
              (child.path !== '/' &&
                child.path !== '/hr' &&
                child.path !== '/me' &&
                child.path !== '/it' &&
                child.path !== '/manager' &&
                location.pathname.startsWith(child.path + '/'))
          );

          if (collapsed) {
            // Collapsed Compact View
            return (
              <div key={feature.id} className="space-y-1 py-1 border-b border-slate-100 last:border-0">
                <Link
                  to={feature.path}
                  title={feature.label}
                  className={cn(
                    'w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all',
                    isMainActive || hasActiveChild
                      ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  {feature.icon}
                </Link>
              </div>
            );
          }

          return (
            <div key={feature.id} className="space-y-1">
              {/* Main Feature Parent Row */}
              <div
                onClick={() => handleMainFeatureClick(feature)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group',
                  isMainActive && !feature.children
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-xs'
                    : isMainActive || hasActiveChild
                      ? 'bg-blue-50/70 text-blue-900 font-bold border border-blue-100/80 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      'transition-transform duration-150 flex-shrink-0 group-hover:scale-110',
                      isMainActive || hasActiveChild ? 'scale-105' : 'opacity-85'
                    )}
                  >
                    {feature.icon}
                  </span>
                  <span className="truncate text-xs font-bold">{feature.label}</span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {feature.badge && (
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded text-[9px] font-bold font-mono',
                        feature.badgeVariant === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : feature.badgeVariant === 'danger'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {feature.badge}
                    </span>
                  )}

                  {feature.children && (
                    <button
                      type="button"
                      onClick={(e) => toggleFeature(feature.id, e)}
                      className="p-1 rounded-md hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform duration-200',
                          isExpanded && 'transform rotate-180 text-blue-600'
                        )}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-features Nested Directly Down Below */}
              {feature.children && isExpanded && (
                <div className="ml-4 pl-2.5 border-l-2 border-slate-100 space-y-0.5 pt-0.5 pb-1 animate-in slide-in-from-top-1 duration-150">
                  {feature.children.map((subItem) => {
                    const isSubActive =
                      location.pathname === subItem.path ||
                      (subItem.path !== '/' &&
                        subItem.path !== '/hr' &&
                        subItem.path !== '/me' &&
                        subItem.path !== '/it' &&
                        subItem.path !== '/manager' &&
                        location.pathname.startsWith(subItem.path + '/'));

                    return (
                      <Link
                        key={subItem.path + subItem.label}
                        to={subItem.path}
                        className={cn(
                          'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-100 group',
                          isSubActive
                            ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100/90 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              'transition-colors flex-shrink-0',
                              isSubActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
                            )}
                          >
                            {subItem.icon}
                          </span>
                          <span className="truncate text-[11px] font-medium">{subItem.label}</span>
                        </div>

                        {subItem.badge && (
                          <span
                            className={cn(
                              'px-1.5 py-0.2 rounded text-[9px] font-bold font-mono whitespace-nowrap ml-1',
                              subItem.badgeVariant === 'danger'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : subItem.badgeVariant === 'warning'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : subItem.badgeVariant === 'info'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                            )}
                          >
                            {subItem.badge}
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

      {/* Bottom Footer Section: System Status + Collapse Toggle */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/60 flex-shrink-0">
        {!collapsed ? (
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-slate-800">System Healthy</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 truncate">Event bus & IdP synced</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Shield className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-2 text-[11px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronsLeft className="w-3.5 h-3.5" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
