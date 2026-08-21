import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { useEmployees, useExceptions } from '../../hooks/useOnboardOS';
import {
  Users,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Activity,
  UserCheck,
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
    <div className="space-y-6 text-left">
      <PageHeader
        title="HR Operations Command Center"
        description="Real-time visibility across all onboarding cohorts, policy execution, day-one readiness scores, and provisioning exceptions."
        badge={<Badge variant="default" dot>Q3 Cohort Active</Badge>}
        actions={
          <div className="flex items-center gap-2.5">
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
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-3xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 flex-shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-950">
                1 Active Provisioning Exception: Jira Rate Limit (HTTP 503)
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Impacts Rahul Sharma (Engineering). 2 downstream tasks on Payments Board are blocked.
              </p>
            </div>
          </div>
          <Link to="/employees/emp-rahul/provisioning">
            <Button size="sm" variant="destructive" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="whitespace-nowrap">
              Resolve Exception
            </Button>
          </Link>
        </div>
      )}

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          iconBgColor="blue"
          value={String(employees.length)}
          label="Active Cohort Hires"
          actionText="View Directory"
          actionHref="/hr/employees"
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBgColor="emerald"
          value="85%"
          label="Cohort Day-1 Readiness"
          actionText="2 of 3 Ready"
          actionHref="/hr/employees"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="amber"
          value="1"
          label="Pending Approvals"
          actionText="AWS Signoff"
          actionHref="/manager/approvals"
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          iconBgColor="rose"
          value={String(activeExceptions.length)}
          label="Active Exceptions"
          actionText="Jira 503 Retry"
          actionHref="/hr/exceptions"
        />
      </div>

      {/* Cohort Status Table */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                In-Flight Onboarding Cohorts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live status, day-one readiness scores, and command center shortcuts for active new hires.
              </p>
            </div>
          </div>
          <Link to="/hr/employees" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>View Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 pt-1">
          {employees.map((emp) => {
            const readiness = getReadiness(emp.id);
            const isBlocked = emp.id === 'emp-rahul';

            return (
              <div
                key={emp.id}
                className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs md:text-sm"
              >
                <div className="flex items-center gap-3.5">
                  <Avatar name={emp.name} size="md" status={isBlocked ? 'failed' : 'online'} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{emp.name}</span>
                      {isBlocked ? (
                        <StatusBadge status="blocked" label="Blocked (Jira 503)" size="sm" showIcon />
                      ) : (
                        <StatusBadge status="completed" label="Active" size="sm" showIcon />
                      )}
                    </div>
                    <span className="text-slate-500 text-xs mt-0.5 block">
                      {emp.roleTitle} • {emp.departmentName} ({emp.teamName}) • Start:{' '}
                      <span className="font-mono text-slate-700 font-semibold">{emp.startDate}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-center">
                  <div className="text-right font-mono">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Day-1 Readiness</span>
                    <span
                      className={`text-sm font-bold ${
                        readiness >= 90
                          ? 'text-emerald-600'
                          : readiness >= 50
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {readiness}%
                    </span>
                  </div>

                  <Link to={`/employees/${emp.id}`}>
                    <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-slate-600" />}>
                      Command Center
                    </Button>
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

