import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { useApprovals, useEmployees } from '../../hooks/useOnboardOS';
import { CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';
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

