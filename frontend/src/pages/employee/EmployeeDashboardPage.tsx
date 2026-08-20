import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
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
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Laptop,
  CheckSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmployeeDashboardPage() {
  const { employee, tasks, risk } = useEmployee('emp-rahul');

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedCount / (tasks.length || 1)) * 100);

  const checklistItems = [
    { title: 'Accept Corporate Google Workspace Mailbox', done: true },
    { title: 'Join Slack #engineering and #payments channels', done: true },
    { title: 'Accept GitHub Org & Repository invitation', done: true },
    { title: 'Jira Software Backlog Assignment', done: false, blocked: true },
    { title: 'AWS Cloud Access (Pending Manager Signoff)', done: false, pending: true },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <Card className="p-6 bg-gradient-to-r from-blue-950/60 via-slate-900 to-purple-950/40 border-blue-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={employee?.name || 'Rahul Sharma'} size="lg" status="online" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">Welcome, {employee?.name || 'Rahul'}! 👋</h2>
                <Badge variant="success" size="sm">
                  Day 1 in 12 Days
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {employee?.roleTitle} • {employee?.departmentName} ({employee?.teamName}) • Manager:{' '}
                <strong className="text-slate-100">{employee?.managerName || 'Marcus Vance'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Link to="/employee/ai-assistant">
              <Button size="sm" variant="primary" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                Ask Onboard AI
              </Button>
            </Link>
            <Link to="/employee/helpdesk">
              <Button size="sm" variant="outline" leftIcon={<HelpCircle className="w-3.5 h-3.5" />}>
                IT Helpdesk
              </Button>
            </Link>
          </div>
        </div>

        {/* Readiness Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">
              Your Onboarding Readiness Progress: {completedCount} of {tasks.length} Complete
            </span>
            <span className="font-mono font-bold text-blue-400">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} variant="gradient" />
        </div>
      </Card>

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Action Items & Day-1 Checklist */}
        <Card className="lg:col-span-7 space-y-4 p-5 bg-slate-900/90 border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              Day-1 Readiness Checklist
            </h3>
            <Link to="/employee/tasks" className="text-xs text-blue-400 hover:underline">
              View All Tasks ({tasks.length}) →
            </Link>
          </div>

          <div className="space-y-2.5">
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  item.done
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                    : item.blocked
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : item.blocked ? (
                    <Clock className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                  <span className={item.done ? 'line-through text-slate-400' : 'font-medium'}>
                    {item.title}
                  </span>
                </div>

                <Badge
                  variant={item.done ? 'success' : item.blocked ? 'danger' : 'warning'}
                  size="sm"
                >
                  {item.done ? 'Ready' : item.blocked ? 'In Progress (IT)' : 'Pending Signoff'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Mentor / Buddy & First Week Teaser */}
        <div className="lg:col-span-5 space-y-5">
          {/* Mentor Card */}
          <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
                <HeartHandshake className="w-4 h-4 text-purple-400" />
                Assigned Mentor & Buddy
              </h4>
              <Link to="/employee/mentor" className="text-[11px] text-blue-400 hover:underline">
                Details →
              </Link>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center gap-3">
                <Avatar name="Kavita Rao" size="md" status="online" />
                <div>
                  <span className="font-semibold text-slate-100">Kavita Rao</span>
                  <span className="text-[11px] text-slate-400 block">
                    Staff Backend Engineer (Technical Mentor)
                  </span>
                  <span className="text-[10px] font-mono text-purple-300">Slack: @kavita.rao</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
                <Avatar name="Alex Rivera" size="md" status="online" />
                <div>
                  <span className="font-semibold text-slate-100">Alex Rivera</span>
                  <span className="text-[11px] text-slate-400 block">
                    Product Designer (Culture Buddy)
                  </span>
                  <span className="text-[10px] font-mono text-blue-300">Slack: @alex.rivera</span>
                </div>
              </div>
            </div>
          </Card>

          {/* First Week Orientation */}
          <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Day 1 Orientation Schedule
              </h4>
              <Link to="/employee/first-week" className="text-[11px] text-blue-400 hover:underline">
                Full Week →
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-950 flex justify-between items-center">
                <span>09:30 AM — Hardware Setup & YubiKey</span>
                <Badge variant="success" size="sm">
                  Done
                </Badge>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 flex justify-between items-center">
                <span>11:00 AM — Welcome 1:1 with Marcus Vance</span>
                <Badge variant="secondary" size="sm">
                  Upcoming
                </Badge>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 flex justify-between items-center">
                <span>01:00 PM — Team Welcome Lunch</span>
                <Badge variant="secondary" size="sm">
                  Upcoming
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
