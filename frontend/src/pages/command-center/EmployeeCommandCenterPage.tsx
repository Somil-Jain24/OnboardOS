import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { useEmployee } from '../../hooks/useOnboardOS';
import {
  FileText,
  Network,
  PlayCircle,
  Clock,
  SlidersHorizontal,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Lock,
  ArrowLeftRight,
  UserX,
  HeartHandshake,
  Calendar,
  Layers,
  Server,
  Loader2,
  Mail,
  Building,
  Briefcase,
  MapPin,
  Sparkles,
} from 'lucide-react';

export function EmployeeCommandCenterPage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee, plan, tasks, risk, loading, retryTask } = useEmployee(id);
  const [retrying, setRetrying] = useState(false);
  const [retrySuccess, setRetrySuccess] = useState(false);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-xs">Loading Command Center...</span>
      </div>
    );
  }

  const handleRetryJira = async () => {
    setRetrying(true);
    try {
      await retryTask('task-rahul-jira');
      setRetrySuccess(true);
      setTimeout(() => setRetrySuccess(false), 4000);
    } finally {
      setRetrying(false);
    }
  };

  const readinessScore = risk?.readinessScore ?? 65;
  const riskScore = risk?.riskScore ?? 75;
  const isBlocked = tasks.some((t) => t.status === 'FAILED' || t.status === 'BLOCKED');

  const systems = [
    { name: 'Google Workspace', status: 'COMPLETED', detail: 'Mailbox & 2FA Active' },
    { name: 'GitHub Enterprise', status: 'COMPLETED', detail: 'payments-backend Repo Access' },
    { name: 'Slack Workplace', status: 'COMPLETED', detail: '#engineering, #payments' },
    {
      name: 'Jira Software Backlog',
      status: tasks.find((t) => t.id === 'task-rahul-jira')?.status || 'FAILED',
      detail:
        tasks.find((t) => t.id === 'task-rahul-jira')?.status === 'COMPLETED'
          ? 'Payments Sprint Board Active'
          : 'HTTP 503 Rate Limit Error',
    },
    {
      name: 'AWS Production IAM',
      status: tasks.find((t) => t.id === 'task-rahul-aws')?.status || 'WAITING_APPROVAL',
      detail: 'Approval Required by Marcus Vance',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Avatar
              name={employee?.name || 'Rahul Sharma'}
              size="lg"
              status={isBlocked ? 'failed' : 'online'}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-bold text-slate-100">{employee?.name}</span>
                {isBlocked ? (
                  <Badge variant="danger" size="sm" dot>
                    Provisioning Interrupted
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm" dot>
                    Day-1 Ready for Work
                  </Badge>
                )}
              </div>
              <span className="text-xs font-normal text-slate-400 block mt-0.5">
                {employee?.roleTitle} • {employee?.departmentName} ({employee?.teamName}) • Seniority:{' '}
                <span className="font-mono text-slate-300">{employee?.seniority}</span> • Manager:{' '}
                <span className="text-slate-300">{employee?.managerName}</span>
              </span>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/employees/${id}/provisioning`}>
              <Button
                size="sm"
                variant={isBlocked ? 'destructive' : 'secondary'}
                leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
              >
                Live Provisioning
              </Button>
            </Link>
            <Link to={`/employees/${id}/whatif`}>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
              >
                What-If Simulation
              </Button>
            </Link>
          </div>
        }
      />

      {retrySuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            Jira Adapter retry succeeded! Downstream dependencies unblocked automatically.
          </span>
        </div>
      )}

      {/* Centerpiece 3-Column Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Work Context Snapshot */}
        <Card className="lg:col-span-4 space-y-4">
          <CardHeader className="pb-3 border-b border-slate-800/60">
            <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              Work Context Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-0 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/40">
              <span className="text-slate-400">Department</span>
              <span className="font-semibold text-slate-200">{employee?.departmentName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/40">
              <span className="text-slate-400">Team / Pod</span>
              <span className="font-semibold text-slate-200">{employee?.teamName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/40">
              <span className="text-slate-400">Seniority Band</span>
              <span className="font-mono text-slate-200">{employee?.seniority} (L1)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/40">
              <span className="text-slate-400">Location / Mode</span>
              <span className="text-slate-200">{employee?.location}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/40">
              <span className="text-slate-400">Employment Type</span>
              <span className="text-slate-200">{employee?.employmentType}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Policy Ruleset</span>
              <span className="font-mono text-blue-400">v1.0.0 (Engineering Policy)</span>
            </div>
          </CardContent>
        </Card>

        {/* Center Column: Readiness Score & Risk Score Dual Ring */}
        <Card className="lg:col-span-4 flex flex-col justify-center items-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="grid grid-cols-2 gap-6 w-full">
            <ScoreRing
              score={readinessScore}
              size="lg"
              type="readiness"
              label="Ready for Work"
              sublabel={`${risk?.readinessBreakdown.requiredAccessComplete || 3} of ${
                risk?.readinessBreakdown.requiredAccessTotal || 5
              } Ready`}
            />
            <ScoreRing
              score={riskScore}
              size="lg"
              type="risk"
              label="Risk Score"
              sublabel={isBlocked ? 'Gated on Failures' : 'Standard Risk'}
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 w-full flex items-center justify-between text-xs">
            {isBlocked ? (
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                1 Blocking Failure
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                0 Blocking Failures
              </span>
            )}
            <Link to={`/employees/${id}/risk`} className="text-blue-400 hover:underline">
              View Risk Breakdown →
            </Link>
          </div>
        </Card>

        {/* Right Column: Orchestration Navigation Hub */}
        <Card className="lg:col-span-4 space-y-1">
          <CardHeader className="pb-3 border-b border-slate-800/60">
            <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Orchestration Views
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            <Link
              to={`/employees/${id}/plan`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 text-xs text-slate-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Personalized Onboarding Plan
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>
            <Link
              to={`/employees/${id}/access`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 text-xs text-slate-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Network className="w-3.5 h-3.5 text-indigo-400" />
                Access Intelligence Graph
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>
            <Link
              to={`/employees/${id}/provisioning`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 text-xs text-slate-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <PlayCircle className="w-3.5 h-3.5 text-rose-400" />
                Live Provisioning & Retry
              </span>
              {isBlocked && (
                <Badge variant="danger" size="sm">
                  Failed
                </Badge>
              )}
            </Link>
            <Link
              to={`/employees/${id}/timeline`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 text-xs text-slate-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Lifecycle Audit Timeline
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Middle Grid: System Status List + Action Required Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Systems Status Breakdown */}
        <Card className="lg:col-span-7 space-y-3">
          <CardHeader className="pb-2 border-b border-slate-800/60 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-slate-200">System Provisioning Status</CardTitle>
            <span className="text-[11px] font-mono text-slate-400">Adapter Execution Ledger</span>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {systems.map((s, idx) => {
              const isDone = s.status === 'COMPLETED';
              const isFailed = s.status === 'FAILED';
              const isWait = s.status === 'WAITING_APPROVAL';

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                    isFailed
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : isWait
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isFailed ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-200">{s.name}</span>
                      <span className="text-[11px] text-slate-400 block">{s.detail}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      isDone ? 'success' : isFailed ? 'danger' : 'warning'
                    }
                    size="sm"
                  >
                    {isDone ? 'Granted' : isFailed ? 'Failed' : 'Pending Approval'}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Action Required Panel (Jira Incident or Green State) */}
        <Card
          variant={isBlocked ? 'danger' : 'default'}
          className="lg:col-span-5 flex flex-col justify-between"
        >
          <CardHeader className="pb-2 border-b border-slate-800/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Action Required</CardTitle>
              {isBlocked ? (
                <Badge variant="danger" size="sm" dot>
                  1 Critical Action
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  All Systems Clear
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-xs">
            {isBlocked ? (
              <>
                <p className="text-slate-300">
                  <strong className="text-rose-400">Jira Provisioning Error:</strong> External API rate
                  limit (HTTP 503) during project membership assignment.
                </p>
                <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/30 text-[11px] text-rose-200">
                  <strong>Cascading Impact:</strong> 2 downstream sprint backlog tasks are blocked.
                </div>
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full"
                    isLoading={retrying}
                    onClick={handleRetryJira}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Retry Idempotent Action
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-slate-200 font-semibold">No Pending Exceptions</p>
                <p className="text-[11px] text-slate-400">
                  All automated provisioning adapters and human approvals are operating normally.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* P2 Lifecycle Extensions Strip */}
      <Card className="p-4 bg-slate-900/40 border-dashed border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Lifecycle & Platform Extensions (P2)
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Internal transfers, intelligent offboarding, buddy system, and smart first-week schedule.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/employees/${id}/transfer`}>
              <Button size="sm" variant="secondary" leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}>
                Transfer
              </Button>
            </Link>
            <Link to={`/employees/${id}/offboarding`}>
              <Button size="sm" variant="secondary" leftIcon={<UserX className="w-3.5 h-3.5" />}>
                Offboarding
              </Button>
            </Link>
            <Link to={`/employees/${id}/mentor`}>
              <Button size="sm" variant="secondary" leftIcon={<HeartHandshake className="w-3.5 h-3.5" />}>
                Mentor
              </Button>
            </Link>
            <Link to={`/employees/${id}/first-week`}>
              <Button size="sm" variant="secondary" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
                First Week
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
