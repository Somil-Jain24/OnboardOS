import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { Progress } from '../../components/ui/Progress';
import { useEmployee } from '../../hooks/useOnboardOS';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Activity,
} from 'lucide-react';

export function RiskReadinessPage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee, risk, tasks, loading } = useEmployee(id);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-xs">Computing risk and readiness factors...</span>
      </div>
    );
  }

  const readinessScore = risk?.readinessScore ?? 65;
  const riskScore = risk?.riskScore ?? 75;
  const isDayOneReady = risk?.dayOneReady ?? false;
  const breakdown = risk?.readinessBreakdown || {
    criticalTasksTotal: 5,
    criticalTasksComplete: 3,
    requiredAccessTotal: 5,
    requiredAccessComplete: 3,
    requiredTrainingTotal: 1,
    requiredTrainingComplete: 0,
    blockingFailures: 1,
    pendingApprovals: 1,
  };

  const riskFactors = risk?.factors || [
    {
      factor: 'Active Provisioning Failure (Jira 503)',
      weight: 40,
      detail: 'External API rate limit is actively blocking 2 downstream sprint tasks.',
      severity: 'HIGH' as const,
    },
    {
      factor: 'Pending Production Privilege Approval',
      weight: 35,
      detail: 'AWS production cloud IAM grant awaiting manager authorization.',
      severity: 'HIGH' as const,
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={
          <div className="flex items-center gap-3.5">
            <Avatar name={employee?.name || 'Rahul Sharma'} size="md" status={isDayOneReady ? 'online' : 'failed'} />
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-slate-900">Risk & Readiness: {employee?.name}</span>
                {isDayOneReady ? (
                  <StatusBadge status="completed" label="Day-1 Ready" size="sm" showIcon />
                ) : (
                  <StatusBadge status="blocked" label="Blocked from Day-1 Work" size="sm" showIcon />
                )}
              </div>
              <span className="text-xs font-normal text-slate-500 block mt-0.5">
                Deterministic mathematical scoring of access completion, gating approvals, and operational risk.
              </span>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Link to={`/employees/${id}/provisioning`}>
              <Button size="sm" variant="destructive">
                Resolve Blockers
              </Button>
            </Link>
            <Link to={`/employees/${id}`}>
              <Button size="sm" variant="secondary">
                Command Center
              </Button>
            </Link>
          </div>
        }
      />

      {/* Dual Gauge Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Readiness Index */}
        <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card flex flex-col items-center justify-center space-y-4">
          <ScoreRing
            score={readinessScore}
            size="lg"
            type="readiness"
            label="Day-1 Readiness Index"
            sublabel={`${breakdown.requiredAccessComplete} of ${breakdown.requiredAccessTotal} Access Items Granted`}
          />
          <div className="text-center max-w-sm text-xs text-slate-500">
            {isDayOneReady ? (
              <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                All Day-1 critical access, training, and accounts have been validated.
              </span>
            ) : (
              <span className="text-rose-700 font-semibold flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Blocked: Requires 100% access completion with 0 failures before Day-1 readiness is granted.
              </span>
            )}
          </div>
        </div>

        {/* Risk Index */}
        <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card flex flex-col items-center justify-center space-y-4">
          <ScoreRing
            score={riskScore}
            size="lg"
            type="risk"
            label="Aggregated Risk Score"
            sublabel="Based on weighted security & availability factors"
          />
          <div className="text-center max-w-sm text-xs text-slate-500">
            {riskScore > 50 ? (
              <span className="text-amber-800 font-semibold flex items-center justify-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Elevated Risk: Active adapter failures and pending privileged approval gates.
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Low Risk: Standard least-privilege policies active with no anomalies.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 font-mono text-xs">
        <div className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-2">
          <span className="text-slate-500 text-xs block font-sans font-semibold">Critical Tasks</span>
          <div className="text-2xl font-bold text-slate-900">
            {breakdown.criticalTasksComplete} / {breakdown.criticalTasksTotal}
          </div>
          <Progress
            value={(breakdown.criticalTasksComplete / breakdown.criticalTasksTotal) * 100}
            variant="success"
            className="mt-2"
          />
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-2">
          <span className="text-slate-500 text-xs block font-sans font-semibold">Required Access</span>
          <div className="text-2xl font-bold text-slate-900">
            {breakdown.requiredAccessComplete} / {breakdown.requiredAccessTotal}
          </div>
          <Progress
            value={(breakdown.requiredAccessComplete / breakdown.requiredAccessTotal) * 100}
            variant="default"
            className="mt-2"
          />
        </div>

        <div className="p-5 bg-white border border-rose-200 rounded-3xl shadow-card space-y-2">
          <span className="text-rose-700 text-xs block font-sans font-semibold">Blocking Failures</span>
          <div className="text-2xl font-bold text-rose-600">{breakdown.blockingFailures}</div>
          <span className="text-xs text-slate-500 block font-sans">Jira Rate Limit Error</span>
        </div>

        <div className="p-5 bg-white border border-amber-200 rounded-3xl shadow-card space-y-2">
          <span className="text-amber-800 text-xs block font-sans font-semibold">Pending Approvals</span>
          <div className="text-2xl font-bold text-amber-700">{breakdown.pendingApprovals}</div>
          <span className="text-xs text-slate-500 block font-sans">AWS Production Signoff</span>
        </div>
      </div>

      {/* Weighted Risk Factor Table */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Weighted Risk Factor Decomposition
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of how the 0-100 risk score is computed across security and operations.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {riskFactors.map((rf, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{rf.factor}</span>
                  <StatusBadge status={rf.severity === 'HIGH' ? 'failed' : 'warning'} label={`${rf.severity} Severity`} size="sm" />
                </div>
                <p className="text-slate-600 text-xs">{rf.detail}</p>
              </div>

              <div className="text-right font-mono self-end sm:self-center min-w-[100px]">
                <span className="text-slate-400 text-[10px] block">Risk Contribution</span>
                <span className="text-sm font-bold text-rose-600">+{rf.weight} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

