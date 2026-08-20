import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
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
  Clock,
  ArrowRight,
  Loader2,
  Lock,
  Layers,
  FileCheck,
  TrendingDown,
  Activity,
} from 'lucide-react';

export function RiskReadinessPage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee, risk, tasks, loading } = useEmployee(id);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
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
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Avatar name={employee?.name || 'Rahul Sharma'} size="md" status={isDayOneReady ? 'online' : 'failed'} />
            <div>
              <div className="flex items-center gap-2">
                <span>Risk & Readiness Intelligence: {employee?.name}</span>
                <Badge variant={isDayOneReady ? 'success' : 'danger'} dot>
                  {isDayOneReady ? 'Day-1 Ready' : 'Blocked from Day-1 Work'}
                </Badge>
              </div>
              <span className="text-xs font-normal text-slate-400 block mt-0.5">
                Deterministic mathematical scoring of access completion, gating approvals, and operational risk.
              </span>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
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
        <Card className="p-6 flex flex-col items-center justify-center space-y-4 bg-slate-900/80 border-slate-800">
          <ScoreRing
            score={readinessScore}
            size="lg"
            type="readiness"
            label="Day-1 Readiness Index"
            sublabel={`${breakdown.requiredAccessComplete} of ${breakdown.requiredAccessTotal} Access Items Granted`}
          />
          <div className="text-center max-w-sm text-xs text-slate-400">
            {isDayOneReady ? (
              <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                All Day-1 critical access, training, and accounts have been validated.
              </span>
            ) : (
              <span className="text-rose-400 font-semibold flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Blocked: Requires 100% access completion with 0 failures before Day-1 readiness is granted.
              </span>
            )}
          </div>
        </Card>

        {/* Risk Index */}
        <Card className="p-6 flex flex-col items-center justify-center space-y-4 bg-slate-900/80 border-slate-800">
          <ScoreRing
            score={riskScore}
            size="lg"
            type="risk"
            label="Aggregated Risk Score"
            sublabel="Based on weighted security & availability factors"
          />
          <div className="text-center max-w-sm text-xs text-slate-400">
            {riskScore > 50 ? (
              <span className="text-amber-400 font-semibold flex items-center justify-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Elevated Risk: Active adapter failures and pending privileged approval gates.
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Low Risk: Standard least-privilege policies active with no anomalies.
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Breakdown Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <Card className="p-4 bg-slate-900/80 border-slate-800">
          <span className="text-slate-400 text-[11px] block">Critical Tasks</span>
          <div className="text-lg font-bold text-slate-100 mt-1">
            {breakdown.criticalTasksComplete} / {breakdown.criticalTasksTotal}
          </div>
          <Progress
            value={(breakdown.criticalTasksComplete / breakdown.criticalTasksTotal) * 100}
            variant="success"
            className="mt-2"
          />
        </Card>

        <Card className="p-4 bg-slate-900/80 border-slate-800">
          <span className="text-slate-400 text-[11px] block">Required Access</span>
          <div className="text-lg font-bold text-slate-100 mt-1">
            {breakdown.requiredAccessComplete} / {breakdown.requiredAccessTotal}
          </div>
          <Progress
            value={(breakdown.requiredAccessComplete / breakdown.requiredAccessTotal) * 100}
            variant="default"
            className="mt-2"
          />
        </Card>

        <Card className="p-4 bg-slate-900/80 border-rose-500/30">
          <span className="text-rose-400 text-[11px] block">Blocking Failures</span>
          <div className="text-lg font-bold text-rose-400 mt-1">{breakdown.blockingFailures}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Jira Rate Limit Error</span>
        </Card>

        <Card className="p-4 bg-slate-900/80 border-amber-500/30">
          <span className="text-amber-400 text-[11px] block">Pending Approvals</span>
          <div className="text-lg font-bold text-amber-400 mt-1">{breakdown.pendingApprovals}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">AWS Production Signoff</span>
        </Card>
      </div>

      {/* Weighted Risk Factor Table */}
      <Card className="space-y-4 p-5 bg-slate-900/90 border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Weighted Risk Factor Decomposition (FR-RISK-02)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of how the 0-100 risk score is computed across security and operations.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {riskFactors.map((rf, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{rf.factor}</span>
                  <Badge variant={rf.severity === 'HIGH' ? 'danger' : 'warning'} size="sm">
                    {rf.severity} Severity
                  </Badge>
                </div>
                <p className="text-slate-400 text-[11px]">{rf.detail}</p>
              </div>

              <div className="text-right font-mono self-end sm:self-center min-w-[100px]">
                <span className="text-slate-500 text-[10px] block">Risk Contribution</span>
                <span className="text-sm font-bold text-rose-400">+{rf.weight} pts</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
