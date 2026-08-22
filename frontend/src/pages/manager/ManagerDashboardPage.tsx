import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { useApprovals, useEmployees } from '../../hooks/useOnboardOS';
import { CheckCircle2, Clock, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ManagerDashboardPage() {
  const { approvals } = useApprovals('MANAGER');
  const { employees } = useEmployees();

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;
  const directReports = employees.filter((e) => e.managerName === 'Marcus Vance' || !e.managerName);

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Manager Onboarding Dashboard"
        description="Oversee new hire readiness, complete SLA-gated access approvals, and track Day-1 milestones for direct reports."
        badge={
          pendingCount > 0 ? (
            <Badge variant="warning" dot>
              {pendingCount} Action Required
            </Badge>
          ) : (
            <Badge variant="success" dot>
              All Clear
            </Badge>
          )
        }
        actions={
          <Link to="/manager/approvals">
            <Button size="sm" variant="primary" leftIcon={<Clock className="w-3.5 h-3.5" />}>
              Review Approval Queue ({pendingCount})
            </Button>
          </Link>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          iconBgColor="blue"
          value={String(directReports.length)}
          label="Direct Reports Onboarding"
          actionText="Active Cohorts"
          actionHref="/hr/employees"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="amber"
          value={String(pendingCount)}
          label="Pending Approvals"
          actionText="High-Privilege Gates"
          actionHref="/manager/approvals"
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBgColor="emerald"
          value="78%"
          label="Avg Day-1 Readiness"
          actionText="On Track"
          actionHref="/manager/approvals"
        />
      </div>

      {/* AI Attention Queue Card */}
      <div className="p-6 bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 border border-amber-200/90 rounded-3xl shadow-card space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                AI Manager Attention Queue
              </h3>
              <p className="text-[11px] text-slate-600">
                Prioritized action items needing manager intervention to unblock joiners.
              </p>
            </div>
          </div>
          <Badge variant="warning" dot>1 Gated Privilege</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-3.5 bg-white border border-amber-200 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">AWS Production Cloud IAM</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                SLA: 4h Remaining
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Rahul Sharma (Junior Backend Developer) requires manager authorization per SOC-2 Policy POL-CLOUD-01.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <Link
                to="/manager/approvals"
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-xs"
              >
                <span>Review & Authorize</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-amber-200 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Direct Report Readiness Alert</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                65% Ready (At Risk)
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Rahul Sharma has 1 blocked dependency (Jira rate limit). IT Operations is auto-retrying.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <Link
                to="/employees/emp-rahul"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
              >
                <span>Inspect Command Center</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Team Cohort List */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Direct Reports Onboarding
          </h3>
          <Link to="/hr/employees" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>View All Cohorts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 pt-1">
          {directReports.map((emp) => (
            <div key={emp.id} className="p-4 bg-slate-50/60 border border-slate-200/80 hover:bg-slate-50 rounded-2xl transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <Avatar name={emp.name} size="md" status={emp.id === 'emp-rahul' ? 'failed' : 'online'} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{emp.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {emp.roleTitle} • {emp.teamName} • Start Date: <span className="font-mono text-slate-700 font-semibold">{emp.startDate}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <Link to={`/employees/${emp.id}`}>
                    <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-slate-600" />}>
                      Command Center
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

