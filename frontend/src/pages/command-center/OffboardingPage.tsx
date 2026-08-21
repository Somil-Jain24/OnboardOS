import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  UserX,
  CheckCircle2,
  Clock,
  Loader2,
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
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <PageHeader
        title="Intelligent Offboarding & Deprovisioning"
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
        <div className="p-10 text-center bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
            <UserX className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Initiate Offboarding Protocol for {employee?.name}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Triggering this workflow will synthesize a synchronized deprovisioning DAG across all corporate systems, hardware recovery logs, and security revocations.
            </p>
          </div>
          <Button
            size="md"
            variant="destructive"
            isLoading={initiating}
            onClick={handleInitiate}
            className="rounded-xl"
          >
            <UserX className="w-4 h-4 mr-1.5" />
            Initiate Automated Offboarding
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Status Overview Card */}
          <div className="p-6 bg-amber-50/50 border border-amber-200 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Offboarding Protocol Active: {employee?.name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled Exit Date: <strong className="text-slate-800">2026-09-30</strong>
                </p>
              </div>
              <StatusBadge status="warning" label="1 of 6 Tasks Complete" size="sm" />
            </div>
            <Progress value={20} variant="warning" className="h-2.5" />
          </div>

          {/* Departmental Revocation Checklist */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Multi-Department Revocation & Logistics Checklist
            </h4>

            <div className="space-y-2.5">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    {item.status === 'COMPLETED' ? (
                      <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : item.status === 'RUNNING' ? (
                      <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-slate-100 text-slate-400 border border-slate-200">
                        <Clock className="w-4 h-4" />
                      </span>
                    )}
                    <div>
                      <span className="font-bold text-slate-900">{item.task}</span>
                      <span className="text-xs text-slate-500 block font-mono">
                        Owner: {item.team}
                      </span>
                    </div>
                  </div>

                  <StatusBadge
                    status={
                      item.status === 'COMPLETED'
                        ? 'completed'
                        : item.status === 'RUNNING'
                        ? 'in-progress'
                        : 'pending'
                    }
                    label={item.status}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

