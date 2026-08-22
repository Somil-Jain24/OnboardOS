import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { useEmployee } from '../../hooks/useOnboardOS';
import { useAuth } from '../../context/AuthContext';
import { client } from '../../services';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  HeartHandshake,
  Calendar,
  LifeBuoy,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Users,
  ClipboardList,
  Target,
  Send,
  Zap,
  Code2,
  Lock,
  Layers,
  ChevronRight,
  UserCheck,
  ArrowLeft,
  Search,
  Building2,
  MapPin,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Employee } from '../../types';

export function EmployeeDashboardPage() {
  const { activeEmployeeId, setActiveEmployeeId, isEmployeeDetailOpen, setIsEmployeeDetailOpen } = useAuth();
  const { employee, tasks, plan } = useEmployee(activeEmployeeId || 'emp-rahul');
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  useEffect(() => {
    async function loadAll() {
      try {
        const list = await client.getEmployees();
        if (list && list.length > 0) {
          setAllEmployees(list);
          if (!activeEmployeeId) {
            setActiveEmployeeId(list[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to load employees list:', err);
      }
    }
    loadAll();
  }, [activeEmployeeId, setActiveEmployeeId]);

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalCount = tasks.length || 6;
  const progressPercent = Math.round((completedCount / (totalCount || 1)) * 100);

  const getInitials = (name = 'User') =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getAvatarGradient = (idx: number) => {
    const gradients = [
      'from-blue-600 to-indigo-700',
      'from-purple-600 to-pink-600',
      'from-emerald-600 to-teal-700',
      'from-amber-500 to-orange-600',
      'from-rose-600 to-red-700',
      'from-cyan-600 to-blue-600',
    ];
    return gradients[idx % gradients.length];
  };

  const handleSelectEmployee = (empId: string) => {
    setActiveEmployeeId(empId);
    setIsEmployeeDetailOpen(true);
  };

  const filteredEmployees = allEmployees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.teamName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.departmentName === selectedDept;
    return matchesSearch && matchesDept;
  });

  const departments = ['ALL', ...Array.from(new Set(allEmployees.map((e) => e.departmentName)))];

  // ----------------------------------------------------
  // VIEW 1: FULL SCREEN 5-IN-A-ROW PROFILE CARDS (NO SIDEBAR)
  // ----------------------------------------------------
  if (!isEmployeeDetailOpen) {
    return (
      <div className="space-y-6 text-left animate-in fade-in duration-150">
        {/* Top Header Banner */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-card space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Select Employee Onboarding Workspace
                </h1>
              </div>
              <p className="text-xs md:text-sm text-slate-500">
                Click any employee profile card below to launch their personal Day-1 onboarding workspace, role requirements, and tools.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold font-mono border border-blue-200">
                {allEmployees.length} Active Profiles
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t border-slate-100">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role, department, or team..."
                className="w-full h-10 pl-10 pr-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    selectedDept === dept
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5-In-A-Row Large Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredEmployees.map((emp, idx) => {
            return (
              <div
                key={emp.id}
                onClick={() => handleSelectEmployee(emp.id)}
                className="group relative bg-white border border-slate-200/90 rounded-3xl p-5 shadow-card hover:shadow-xl hover:border-blue-500 transition-all duration-200 flex flex-col justify-between cursor-pointer space-y-4 hover:-translate-y-1"
              >
                {/* Top Status & Seniority Tag */}
                <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold">
                    {emp.seniority}
                  </span>
                  <StatusBadge
                    status={emp.status === 'ACTIVE' ? 'completed' : 'ready'}
                    label={emp.status}
                    size="sm"
                  />
                </div>

                {/* Big Avatar with Vibrant Gradient */}
                <div className="flex flex-col items-center text-center space-y-2.5 pt-1">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarGradient(
                      idx
                    )} text-white flex items-center justify-center text-xl font-bold font-mono shadow-md group-hover:scale-105 transition-transform`}
                  >
                    {getInitials(emp.name)}
                  </div>

                  <div className="space-y-1 w-full">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {emp.name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-700 truncate">
                      {emp.roleTitle}
                    </p>
                  </div>
                </div>

                {/* Info Details Pills */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{emp.departmentName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{emp.teamName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{emp.location}</span>
                  </div>
                </div>

                {/* Manager & Action CTA */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Manager:</span>
                    <strong className="text-slate-800 font-semibold truncate max-w-[110px]">
                      {emp.managerName || 'Marcus Vance'}
                    </strong>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectEmployee(emp.id);
                    }}
                    className="w-full py-2.5 px-3 rounded-2xl bg-slate-900 group-hover:bg-blue-600 text-white text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: DETAILED EMPLOYEE ONBOARDING WORKSPACE (WITH SIDEBAR)
  // ----------------------------------------------------
  return (
    <div className="space-y-6 text-left animate-in fade-in duration-150">
      {/* Top Sticky Navigation / Switch Profile Header */}
      <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-card">
        <button
          onClick={() => setIsEmployeeDetailOpen(false)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to All Employee Profiles (Full Screen 5-Card Grid)</span>
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Active Persona:</span>
          <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold font-mono">
            {employee?.name} ({employee?.roleTitle})
          </span>
        </div>
      </div>

      {/* Hero / Welcome Card */}
      <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-card overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 pointer-events-none select-none opacity-90 hidden sm:block">
          <svg className="w-full h-full object-cover" viewBox="0 0 500 240" fill="none" preserveAspectRatio="xMaxYMid meet">
            <defs>
              <linearGradient id="mountGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#EFF6FF" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="balloonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
            <circle cx="280" cy="55" r="14" fill="#FEF3C7" opacity="0.8" />
            <path d="M120 240 L260 120 L350 200 L440 100 L550 240 Z" fill="url(#mountGrad1)" />
            <g transform="translate(380, 50) scale(0.65)">
              <path d="M40 10 C65 10 75 35 68 60 C62 80 48 95 40 105 C32 95 18 80 12 60 C5 35 15 10 40 10 Z" fill="url(#balloonGrad)" />
              <line x1="32" y1="105" x2="35" y2="118" stroke="#64748B" strokeWidth="1.5" />
              <line x1="48" y1="105" x2="45" y2="118" stroke="#64748B" strokeWidth="1.5" />
              <rect x="33" y="118" width="14" height="10" rx="2" fill="#D97706" />
            </g>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold font-mono shadow-md">
                  {getInitials(employee?.name)}
                </div>
                <span className="w-4 h-4 rounded-full bg-emerald-500 ring-3 ring-white absolute bottom-0 right-0" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Welcome, {employee?.name || 'Rahul Sharma'}! 👋
                  </h2>
                </div>
                <p className="text-xs md:text-sm text-slate-600 font-medium">
                  <strong className="text-blue-700 font-bold">{employee?.roleTitle}</strong> •{' '}
                  {employee?.departmentName} ({employee?.teamName}) • Manager:{' '}
                  <strong className="text-slate-900 font-semibold">{employee?.managerName || 'Marcus Vance'}</strong>
                </p>
                <div className="pt-1.5 flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-semibold text-slate-700 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Start Date: {employee?.startDate || '2026-09-01'}</span>
                  </div>
                  <Badge variant="purple" size="sm">
                    {employee?.seniority || 'JUNIOR'} Level
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-stretch sm:self-auto">
              <Link to="/me/tasks">
                <Button size="md" variant="primary" leftIcon={<Sparkles className="w-4 h-4 text-white" />}>
                  Start Tool Onboarding
                </Button>
              </Link>
              <Link to="/me/help">
                <Button size="md" variant="secondary" leftIcon={<LifeBuoy className="w-4 h-4 text-slate-600" />}>
                  IT Helpdesk
                </Button>
              </Link>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="font-semibold text-slate-800">
                Your Onboarding Readiness Progress
              </span>
              <span className="font-bold text-blue-600 font-mono text-sm">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/70">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {completedCount} of {totalCount} Requirements Claimed & Active
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<ClipboardList className="w-6 h-6" />}
          iconBgColor="blue"
          value={String(totalCount)}
          label="Role Tool Requirements"
          actionText="View Tool Suite"
          actionHref="/me/tasks"
        />
        <StatCard
          icon={<ShieldCheck className="w-6 h-6" />}
          iconBgColor="emerald"
          value={`${completedCount} of ${totalCount}`}
          label="Activated Systems"
          actionText="Claim Pending"
          actionHref="/me/tasks"
        />
        <StatCard
          icon={<HeartHandshake className="w-6 h-6" />}
          iconBgColor="purple"
          value={employee?.managerName || 'Marcus Vance'}
          label="Manager & Signoff Lead"
          actionText="Meet Manager"
          actionHref="/me/mentor"
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          iconBgColor="amber"
          value={`${progressPercent}%`}
          label="Day-1 Readiness"
          actionText="View Schedule"
          actionHref="/me/first-week"
        />
      </div>

      {/* AI Role Requirement & Entitlement Matrix */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-7 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                AI Role Requirement & Entitlement Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Authoritative onboarding requirements synthesized for{' '}
                <strong className="text-slate-800">{employee?.roleTitle}</strong> in{' '}
                <strong className="text-slate-800">{employee?.departmentName}</strong> ({employee?.teamName})
              </p>
            </div>
          </div>
          <Link to="/me/tasks">
            <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Claim & Launch All Tools
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {tasks.map((task) => {
            const isDone = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isDone
                    ? 'bg-emerald-50/40 border-emerald-200/80 shadow-xs'
                    : 'bg-white border-slate-200/90 shadow-card hover:border-blue-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                      {task.adapterType}
                    </span>
                    <StatusBadge
                      status={isDone ? 'completed' : task.status === 'WAITING_APPROVAL' ? 'pending' : 'ready'}
                      label={task.status}
                      size="sm"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{task.name}</h4>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Category: {task.category}</span>
                  <Link to="/me/tasks" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1">
                    {isDone ? 'View Credentials' : 'Claim Tool'} <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboardPage;
