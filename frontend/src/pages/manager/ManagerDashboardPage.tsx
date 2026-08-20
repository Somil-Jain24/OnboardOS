import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useApprovals, useEmployees } from '../../hooks/useOnboardOS';
import { CheckCircle2, Clock, AlertTriangle, Users, ArrowRight, Shield, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ManagerDashboardPage() {
  const { approvals } = useApprovals('MANAGER');
  const { employees } = useEmployees();

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;
  const directReports = employees.filter((e) => e.managerName === 'Marcus Vance' || !e.managerName);

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900/80 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Direct Reports Onboarding</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-2">{directReports.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active cohorts in Engineering & Design</span>
        </Card>

        <Card className="p-4 bg-slate-900/80 border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-2">{pendingCount}</div>
          <span className="text-[11px] text-amber-300/80 mt-1 block">High-privilege cloud IAM gates</span>
        </Card>

        <Card className="p-4 bg-slate-900/80 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Avg Day-1 Readiness</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-2">78%</div>
          <span className="text-[11px] text-slate-400 mt-1 block">On track for start date</span>
        </Card>
      </div>

      {/* Team Cohort List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Direct Reports Onboarding
          </h3>
          <Link to="/hr/employees" className="text-xs text-blue-400 hover:underline">
            View All Cohorts →
          </Link>
        </div>

        <div className="space-y-2">
          {directReports.map((emp) => (
            <Card key={emp.id} className="p-4 bg-slate-900/80 hover:border-slate-700 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={emp.name} size="md" status={emp.id === 'emp-rahul' ? 'failed' : 'online'} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{emp.name}</h4>
                    <p className="text-xs text-slate-400">
                      {emp.roleTitle} • {emp.teamName} • Start Date: <span className="font-mono text-slate-300">{emp.startDate}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <Link to={`/employees/${emp.id}`}>
                    <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Command Center
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
