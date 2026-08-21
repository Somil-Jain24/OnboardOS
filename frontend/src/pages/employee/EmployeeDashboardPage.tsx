import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Progress } from '../../components/ui/Progress';
import { Avatar } from '../../components/ui/Avatar';
import { useEmployee } from '../../hooks/useOnboardOS';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  HeartHandshake,
  Calendar,
  MessageSquare,
  LifeBuoy,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Users,
  Folder,
  ClipboardList,
  Target,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmployeeDashboardPage() {
  const { employee, tasks } = useEmployee('emp-rahul');

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPercent = 83; // Exact match to Brand Alchemy reference (5 of 6 = 83%)

  const checklistItems = [
    { title: 'Accept Corporate Google Workspace Mailbox', status: 'completed' },
    { title: 'Join Slack #engineering and #payments channels', status: 'completed' },
    { title: 'Accept GitHub Org & Repository invitation', status: 'completed' },
    { title: 'Jira Software Backlog Assignment', status: 'in-progress' },
    { title: 'AWS Cloud Access (Pending Manager Signoff)', status: 'pending-signoff' },
    { title: 'Complete Compliance & Policy Acknowledgement', status: 'pending' },
  ];

  const orientationEvents = [
    { time: '09:30 AM', title: 'Hardware Setup & YubiKey', status: 'Done', isDone: true },
    { time: '11:00 AM', title: 'Welcome 1:1 with Marcus Vance', status: 'Upcoming', isDone: false },
    { time: '01:00 PM', title: 'Team Welcome Lunch', status: 'Upcoming', isDone: false },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* 1. Hero / Welcome Card (Image 2 Target) */}
      <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-card overflow-hidden">
        {/* Subtle Scenic Backdrop Artwork (Mountains, Clouds, Hot Air Balloon) */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 pointer-events-none select-none opacity-90 hidden sm:block">
          <svg className="w-full h-full object-cover" viewBox="0 0 500 240" fill="none" preserveAspectRatio="xMaxYMid meet">
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="mountGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#EFF6FF" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="mountGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="balloonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>

            {/* Sun */}
            <circle cx="280" cy="55" r="14" fill="#FEF3C7" opacity="0.8" />

            {/* Mountains Silhouette */}
            <path d="M120 240 L260 120 L350 200 L440 100 L550 240 Z" fill="url(#mountGrad1)" />
            <path d="M220 240 L340 140 L410 190 L500 110 L580 240 Z" fill="url(#mountGrad2)" />

            {/* Clouds */}
            <path d="M160 80 Q175 65 195 75 Q215 65 230 80 Q245 80 245 95 Q245 110 225 110 L160 110 Q145 110 145 95 Q145 80 160 80 Z" fill="#FFFFFF" opacity="0.75" />
            <path d="M380 60 Q390 50 405 55 Q420 50 430 60 Q440 60 440 72 Q440 85 425 85 L380 85 Q370 85 370 72 Q370 60 380 60 Z" fill="#FFFFFF" opacity="0.6" />

            {/* Birds */}
            <path d="M390 40 Q395 35 400 40 Q405 35 410 40" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M420 30 Q424 26 428 30 Q432 26 436 30" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" fill="none" />

            {/* Hot Air Balloon */}
            <g transform="translate(380, 50) scale(0.65)">
              {/* Balloon Envelope */}
              <path d="M40 10 C65 10 75 35 68 60 C62 80 48 95 40 105 C32 95 18 80 12 60 C5 35 15 10 40 10 Z" fill="url(#balloonGrad)" />
              {/* Stripes */}
              <path d="M40 10 C48 10 52 35 48 60 C45 80 42 95 40 105 C38 95 35 80 32 60 C28 35 32 10 40 10 Z" fill="#FFFFFF" opacity="0.8" />
              {/* Basket Strings */}
              <line x1="32" y1="105" x2="35" y2="118" stroke="#64748B" strokeWidth="1.5" />
              <line x1="48" y1="105" x2="45" y2="118" stroke="#64748B" strokeWidth="1.5" />
              {/* Basket */}
              <rect x="33" y="118" width="14" height="10" rx="2" fill="#D97706" />
            </g>
          </svg>
        </div>

        {/* Hero Card Content */}
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left: Avatar + Details */}
            <div className="flex items-start md:items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold font-mono shadow-md">
                  RS
                </div>
                <span className="w-4 h-4 rounded-full bg-emerald-500 ring-3 ring-white absolute bottom-0 right-0" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Welcome, {employee?.name || 'Rahul Sharma'}! 👋
                  </h2>
                </div>
                <p className="text-xs md:text-sm text-slate-500">
                  {employee?.roleTitle || 'Backend Developer'} • {employee?.departmentName || 'Engineering'} ({employee?.teamName || 'Payments Core'}) • Manager:{' '}
                  <strong className="text-slate-800 font-semibold">{employee?.managerName || 'Marcus Vance'}</strong>
                </p>
                <div className="pt-1.5 flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-semibold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Day 1 in 12 Days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3 self-stretch sm:self-auto">
              <Link to="/me/assistant">
                <Button size="md" variant="primary" leftIcon={<Sparkles className="w-4 h-4 text-white" />}>
                  Ask Onboard AI
                </Button>
              </Link>
              <Link to="/me/help">
                <Button size="md" variant="secondary" leftIcon={<LifeBuoy className="w-4 h-4 text-slate-600" />}>
                  IT Helpdesk
                </Button>
              </Link>
            </div>
          </div>

          {/* Readiness Progress Bar (Image 2) */}
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
              5 of 6 Complete
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stat Cards Grid (4 Cards - Image 2 Target) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          iconBgColor="blue"
          value="216"
          label="Active Employees"
          actionText="View All"
          actionHref="/hr/employees"
        />
        <StatCard
          icon={<Folder className="w-6 h-6" />}
          iconBgColor="emerald"
          value="312"
          label="Active Projects"
          actionText="View All"
          actionHref="/knowledge"
        />
        <StatCard
          icon={<ClipboardList className="w-6 h-6" />}
          iconBgColor="purple"
          value="184"
          label="Number of Tasks"
          actionText="View All"
          actionHref="/me/tasks"
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          iconBgColor="amber"
          value="84.12%"
          label="Target Completed"
          actionText="View Progress"
          actionHref="/me/first-week"
        />
      </div>

      {/* 3. Main 2-Column Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Day-1 Readiness Checklist (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 md:p-7 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Day-1 Readiness Checklist
                </h3>
              </div>
              <Link to="/me/tasks" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                <span>View All Tasks (6)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 pt-4">
              {checklistItems.map((item, idx) => {
                const isCompleted = item.status === 'completed';
                const isInProgress = item.status === 'in-progress';
                const isPendingSignoff = item.status === 'pending-signoff';
                const isPending = item.status === 'pending';

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs md:text-sm transition-all ${
                      isCompleted
                        ? 'bg-slate-50/50 border-slate-200/80 text-slate-700'
                        : isInProgress
                        ? 'bg-amber-50/30 border-amber-200/80 text-slate-800'
                        : isPendingSignoff
                        ? 'bg-rose-50/30 border-rose-200/80 text-slate-800'
                        : 'bg-white border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : isInProgress ? (
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                      ) : isPendingSignoff ? (
                        <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}
                      <span className={`truncate font-medium ${isCompleted ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                        {item.title}
                      </span>
                    </div>

                    <StatusBadge
                      status={item.status}
                      size="sm"
                      className="flex-shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Mentor & Buddy + Orientation Schedule (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Assigned Mentor & Buddy (Image 2) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-7 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Assigned Mentor & Buddy
                </h4>
              </div>
              <Link to="/me/mentor" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Mentor 1 */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/60 border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-900 text-white flex items-center justify-center font-bold text-xs font-mono relative flex-shrink-0">
                    KR
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0 right-0" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Kavita Rao</span>
                    <span className="text-[11px] text-slate-500 block">
                      Staff Backend Engineer (Technical Mentor)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Slack: @kavita.rao</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<MessageSquare className="w-3.5 h-3.5 text-slate-600" />}
                  className="rounded-xl text-xs font-semibold flex-shrink-0"
                >
                  Message
                </Button>
              </div>

              {/* Buddy 2 */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/60 border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs font-mono relative flex-shrink-0">
                    AR
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0 right-0" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Alex Rivera</span>
                    <span className="text-[11px] text-slate-500 block">
                      Product Designer (Culture Buddy)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Slack: @alex.rivera</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<MessageSquare className="w-3.5 h-3.5 text-slate-600" />}
                  className="rounded-xl text-xs font-semibold flex-shrink-0"
                >
                  Message
                </Button>
              </div>
            </div>
          </div>

          {/* Card 2: Day 1 Orientation Schedule (Image 2) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-7 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Day 1 Orientation Schedule
                </h4>
              </div>
              <Link to="/me/first-week" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                <span>View Full Week</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Timeline Events */}
            <div className="space-y-3 pt-1">
              {orientationEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-200/60"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="font-mono text-xs font-bold text-slate-700">{evt.time}</span>
                    <span className="text-slate-400 text-xs">—</span>
                    <span className="text-xs font-semibold text-slate-900">{evt.title}</span>
                  </div>

                  <StatusBadge
                    status={evt.status}
                    size="sm"
                    className="flex-shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

