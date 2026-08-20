import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { Avatar } from '../../components/ui/Avatar';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  UserX,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Laptop,
  CreditCard,
  Building,
  ArrowRight,
  Loader2,
  Lock,
} from 'lucide-react';
import type { OffboardingPlan } from '../../types';

export function OffboardingPage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee, loading } = useEmployee(id);
  const [offboardPlan, setOffboardPlan] = useState<OffboardingPlan | null>(null);
  const [initiating, setInitiating] = useState(false);

  useEffect(() => {
    async function load() {
      const plan = await client.getOffboardingPlan(id);
      setOffboardPlan(plan);
    }
    load();
  }, [id]);

  const handleInitiate = async () => {
    setInitiating(true);
    try {
      const plan = await client.createOffboardingPlan(id);
      setOffboardPlan(plan);
    } finally {
      setInitiating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  const checklist = [
    { team: 'IT Operations', task: 'Revoke AWS IAM & Cloud Keys', status: 'COMPLETED' },
    { team: 'IT Operations', task: 'Revoke GitHub Org & Private Repos', status: 'RUNNING' },
    { team: 'IT Operations', task: 'Suspend Google Workspace Mailbox & 2FA', status: 'PENDING' },
    { team: 'Hardware Logistics', task: 'Collect MacBook Pro M3 (SN: C02G894LMD6R)', status: 'PENDING' },
    { team: 'HR & People Ops', task: 'Conduct Exit Interview & Benefits Briefing', status: 'PENDING' },
    { team: 'Finance Ops', task: 'Corporate Expense Card & Payroll Settlement', status: 'PENDING' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Intelligent Offboarding & Deprovisioning (FR-LIFE-02)"
        description="Cross-departmental deprovisioning orchestration across HR, IT, Finance, and Security with automated account revocation and asset recovery."
        badge={<Badge variant="warning" dot>Exit Orchestrator</Badge>}
        actions={
          <Link to={`/employees/${id}`}>
            <Button size="sm" variant="secondary">
              Back to Command Center
            </Button>
          </Link>
        }
      />

      {!offboardPlan ? (
        <Card className="p-8 text-center bg-slate-900/90 border-slate-800 space-y-4">
          <UserX className="w-12 h-12 mx-auto text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Initiate Offboarding Protocol for {employee?.name}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Triggering this workflow will synthesize a synchronized deprovisioning DAG across all corporate systems, hardware recovery logs, and security revokations.
            </p>
          </div>
          <Button
            size="md"
            variant="destructive"
            isLoading={initiating}
            onClick={handleInitiate}
            leftIcon={<UserX className="w-4 h-4" />}
          >
            Initiate Automated Offboarding
          </Button>
        </Card>
      ) : (
        <div className="space-y-5">
          {/* Status Overview Card */}
          <Card className="p-5 bg-gradient-to-r from-amber-950/20 via-slate-900 to-rose-950/20 border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-100">
                  Offboarding Protocol Active: {employee?.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scheduled Exit Date: <strong className="text-slate-200">2026-09-30</strong>
                </p>
              </div>
              <Badge variant="warning" size="sm">
                1 of 6 Tasks Complete
              </Badge>
            </div>
            <Progress value={20} variant="warning" />
          </Card>

          {/* Departmental Revocation Checklist */}
          <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Multi-Department Revocation & Logistics Checklist
            </h4>

            <div className="space-y-2.5">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    {item.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : item.status === 'RUNNING' ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-100">{item.task}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        Owner: {item.team}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      item.status === 'COMPLETED'
                        ? 'success'
                        : item.status === 'RUNNING'
                        ? 'info'
                        : 'secondary'
                    }
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
