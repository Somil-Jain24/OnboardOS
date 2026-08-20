import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { useEmployees, useExceptions } from '../../hooks/useOnboardOS';
import {
  Users,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function HRDashboardPage() {
  const { employees } = useEmployees();
  const { exceptions } = useExceptions();

  const activeExceptions = exceptions.filter((e) => e.severity !== 'RESOLVED');

  const getReadiness = (empId: string) => {
    if (empId === 'emp-rahul') return 65;
    if (empId === 'emp-priya') return 90;
    if (empId === 'emp-aman') return 100;
    return 80;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Operations Command Center"
        description="Real-time visibility across all onboarding cohorts, policy execution, day-one readiness scores, and provisioning exceptions."
        badge={<Badge variant="default" dot>Q3 Cohort Active</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/hr/exceptions">
              <Button
                size="sm"
                variant={activeExceptions.length > 0 ? 'destructive' : 'secondary'}
                leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
              >
                Exceptions ({activeExceptions.length})
              </Button>
            </Link>
            <Link to="/hr/employees/new">
              <Button size="sm" variant="primary" leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                Onboard New Hire
              </Button>
            </Link>
          </div>
        }
      />

      {/* Incident Banner if Active Exceptions */}
      {activeExceptions.length > 0 && (
        <Card variant="danger" className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-100">
                1 Active Provisioning Exception: Jira Rate Limit (HTTP 503)
              </h4>
              <p className="text-xs text-rose-300/90 mt-0.5">
                Impacts Rahul Sharma (Engineering). 2 downstream tasks on Payments Board are blocked.
              </p>
            </div>
          </div>
          <Link to="/employees/emp-rahul/provisioning">
            <Button size="sm" variant="destructive" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Resolve Exception
            </Button>
          </Link>
        </Card>
      )}

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/80 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Active Cohort Hires</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-2">{employees.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Engineering, Design, HR</span>
        </Card>

        <Card className="p-4 bg-slate-900/80 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Cohort Day-1 Readiness</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-2">85%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">2 of 3 Ready for Day 1</span>
        </Card>

        <Card className="p-4 bg-slate-900/80 border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-2">1</div>
          <span className="text-[11px] text-amber-300/80 mt-1 block">AWS Production Signoff</span>
        </Card>

        <Card className="p-4 bg-slate-900/80 border-rose-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Active Exceptions</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-2">{activeExceptions.length}</div>
          <span className="text-[11px] text-rose-300/80 mt-1 block">Jira 503 Rate Limit</span>
        </Card>
      </div>

      {/* Cohort Status Table */}
      <Card className="space-y-4 p-5 bg-slate-900/90 border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              In-Flight Onboarding Cohorts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status, day-one readiness scores, and command center shortcuts for active new hires.
            </p>
          </div>
          <Link to="/hr/employees" className="text-xs text-blue-400 hover:underline">
            View Full Directory →
          </Link>
        </div>

        <div className="space-y-2.5">
          {employees.map((emp) => {
            const readiness = getReadiness(emp.id);
            const isBlocked = emp.id === 'emp-rahul';

            return (
              <div
                key={emp.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={emp.name} size="md" status={isBlocked ? 'failed' : 'online'} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{emp.name}</span>
                      {isBlocked ? (
                        <Badge variant="danger" size="sm" dot>
                          Blocked (Jira 503)
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm" dot>
                          Active
                        </Badge>
                      )}
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      {emp.roleTitle} • {emp.departmentName} ({emp.teamName}) • Start:{' '}
                      <span className="font-mono text-slate-300">{emp.startDate}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-center">
                  <div className="text-right font-mono">
                    <span className="text-slate-500 text-[10px] block">Day-1 Readiness</span>
                    <span
                      className={`text-xs font-bold ${
                        readiness >= 90
                          ? 'text-emerald-400'
                          : readiness >= 50
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {readiness}%
                    </span>
                  </div>

                  <Link to={`/employees/${emp.id}`}>
                    <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Command Center
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
