import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
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
  Compass,
  X,
  ShieldAlert,
  Check,
} from 'lucide-react';

export function EmployeeCommandCenterPage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee, plan, tasks, risk, loading, retryTask } = useEmployee(id);
  const [retrying, setRetrying] = useState(false);
  const [retrySuccess, setRetrySuccess] = useState(false);

  // TASK-186 Access Drift Inspector Drawer State
  const [driftDrawerOpen, setDriftDrawerOpen] = useState(false);
  const [remediationInitiated, setRemediationInitiated] = useState(false);

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

  const handleInitiateRemediation = async () => {
    setRemediationInitiated(true);
    setTimeout(() => {
      setRemediationInitiated(false);
      setDriftDrawerOpen(false);
    }, 2000);
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
            {/* TASK-186 Access Drift Inspector Trigger */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDriftDrawerOpen(true)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs"
            >
              <Compass className="w-3.5 h-3.5 mr-1 text-purple-400" />
              Inspect Access Drift
            </Button>

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
              label="Day-1 Risk Index"
              sublabel={isBlocked ? '2 Blocker Flags' : 'Minimal Risk'}
            />
          </div>
        </Card>

        {/* Right Column: Systems Integration Status */}
        <Card className="lg:col-span-4 space-y-4">
          <CardHeader className="pb-3 border-b border-slate-800/60">
            <CardTitle className="text-sm text-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" />
                <span>Enterprise Systems Status</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {systems.filter((s) => s.status === 'COMPLETED').length}/{systems.length} Active
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-xs">
            {systems.map((sys) => {
              const isDone = sys.status === 'COMPLETED';
              const isFailed = sys.status === 'FAILED';
              const isPending = sys.status === 'WAITING_APPROVAL';

              return (
                <div
                  key={sys.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60"
                >
                  <div className="flex items-center gap-2.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isFailed ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-200">{sys.name}</p>
                      <p className="text-[10px] text-slate-400">{sys.detail}</p>
                    </div>
                  </div>
                  <Badge
                    variant={isDone ? 'success' : isFailed ? 'danger' : 'warning'}
                    size="sm"
                  >
                    {sys.status}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Sub-Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <Link to={`/employees/${id}/plan`}>
          <Card className="p-3.5 bg-slate-900/60 hover:bg-slate-850 border-slate-800 hover:border-blue-500/40 transition-all text-center space-y-1.5 cursor-pointer">
            <FileText className="w-5 h-5 mx-auto text-blue-400" />
            <p className="text-xs font-bold text-slate-200">AI Plan & Why</p>
            <p className="text-[10px] text-slate-400">Rules & Rationales</p>
          </Card>
        </Link>
        <Link to={`/employees/${id}/access`}>
          <Card className="p-3.5 bg-slate-900/60 hover:bg-slate-850 border-slate-800 hover:border-blue-500/40 transition-all text-center space-y-1.5 cursor-pointer">
            <Network className="w-5 h-5 mx-auto text-emerald-400" />
            <p className="text-xs font-bold text-slate-200">Access Graph</p>
            <p className="text-[10px] text-slate-400">Visual DAG Matrix</p>
          </Card>
        </Link>
        <Link to={`/employees/${id}/provisioning`}>
          <Card className="p-3.5 bg-slate-900/60 hover:bg-slate-850 border-slate-800 hover:border-blue-500/40 transition-all text-center space-y-1.5 cursor-pointer">
            <PlayCircle className="w-5 h-5 mx-auto text-indigo-400" />
            <p className="text-xs font-bold text-slate-200">Provisioning</p>
            <p className="text-[10px] text-slate-400">Ledger & Payload</p>
          </Card>
        </Link>
        <Link to={`/employees/${id}/risk`}>
          <Card className="p-3.5 bg-slate-900/60 hover:bg-slate-850 border-slate-800 hover:border-blue-500/40 transition-all text-center space-y-1.5 cursor-pointer">
            <ShieldCheck className="w-5 h-5 mx-auto text-purple-400" />
            <p className="text-xs font-bold text-slate-200">Risk & Readiness</p>
            <p className="text-[10px] text-slate-400">Blockers & SLA</p>
          </Card>
        </Link>
        <Link to={`/employees/${id}/transfer`}>
          <Card className="p-3.5 bg-slate-900/60 hover:bg-slate-850 border-slate-800 hover:border-blue-500/40 transition-all text-center space-y-1.5 cursor-pointer">
            <ArrowLeftRight className="w-5 h-5 mx-auto text-amber-400" />
            <p className="text-xs font-bold text-slate-200">Role Transfer</p>
            <p className="text-[10px] text-slate-400">Context Diff</p>
          </Card>
        </Link>
        <Link to={`/employees/${id}/offboarding`}>
          <Card className="p-3.5 bg-slate-900/60 hover:bg-slate-850 border-slate-800 hover:border-blue-500/40 transition-all text-center space-y-1.5 cursor-pointer">
            <UserX className="w-5 h-5 mx-auto text-rose-400" />
            <p className="text-xs font-bold text-slate-200">Offboarding</p>
            <p className="text-[10px] text-slate-400">Exit Checklist</p>
          </Card>
        </Link>
      </div>

      {/* TASK-186: Peer Access Drift & Anomaly Inspector Drawer / Modal */}
      {driftDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 bg-slate-900 border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Peer Access Drift & Anomaly Analysis</h3>
                  <p className="text-xs text-slate-400">
                    Comparing <strong>{employee?.name}</strong> against peer baseline: <code>Junior Backend Developers (n=14)</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDriftDrawerOpen(false)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drift Score Meter */}
            <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-purple-400 font-bold">Computed Drift Divergence:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl font-bold text-slate-100">12% Divergence</span>
                  <Badge variant="warning" size="sm">
                    1 Outlier Flagged
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  88% entitlement overlap matches role baseline. One privilege deviation requires security attention.
                </p>
              </div>
              <div className="text-right font-mono text-xs text-purple-300 bg-slate-950 p-2.5 rounded-lg border border-purple-500/20">
                <span>Peer Size: 14</span>
                <br />
                <span className="text-emerald-400">Standard: 4 Apps</span>
              </div>
            </div>

            {/* Side-by-Side Entitlement Comparison */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-200">Side-by-Side Entitlement Comparison Matrix</h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
                <div className="grid grid-cols-12 bg-slate-950 p-2.5 font-mono text-[11px] text-slate-400 font-semibold">
                  <span className="col-span-5">Entitlement / Application</span>
                  <span className="col-span-3 text-center">Peer Cohort %</span>
                  <span className="col-span-4 text-right">Status / Deviation</span>
                </div>

                <div className="grid grid-cols-12 p-2.5 items-center">
                  <span className="col-span-5 text-slate-200 font-medium">Google Workspace Mailbox</span>
                  <span className="col-span-3 text-center font-mono text-slate-400">100% (14/14)</span>
                  <span className="col-span-4 text-right">
                    <Badge variant="success" size="sm">Baseline Match</Badge>
                  </span>
                </div>

                <div className="grid grid-cols-12 p-2.5 items-center">
                  <span className="col-span-5 text-slate-200 font-medium">GitHub payments-backend (Write)</span>
                  <span className="col-span-3 text-center font-mono text-slate-400">100% (14/14)</span>
                  <span className="col-span-4 text-right">
                    <Badge variant="success" size="sm">Baseline Match</Badge>
                  </span>
                </div>

                <div className="grid grid-cols-12 p-2.5 items-center">
                  <span className="col-span-5 text-slate-200 font-medium">Slack #engineering, #payments</span>
                  <span className="col-span-3 text-center font-mono text-slate-400">100% (14/14)</span>
                  <span className="col-span-4 text-right">
                    <Badge variant="success" size="sm">Baseline Match</Badge>
                  </span>
                </div>

                <div className="grid grid-cols-12 p-2.5 items-center bg-rose-950/20">
                  <div className="col-span-5">
                    <span className="text-rose-200 font-semibold">AWS Production IAM Admin</span>
                    <p className="text-[10px] text-rose-300/80">Requested via manual elevation</p>
                  </div>
                  <span className="col-span-3 text-center font-mono text-rose-400 font-bold">0% (0/14 Peers)</span>
                  <span className="col-span-4 text-right">
                    <Badge variant="danger" size="sm">High Anomaly</Badge>
                  </span>
                </div>
              </div>
            </div>

            {/* Remediation Action Box */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Automated Remediation & Certification Action</span>
              </div>
              <p className="text-slate-400 text-xs">
                Initiating remediation will trigger an immediate ad-hoc Access Certification campaign for this user and alert the Security Admin queue.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDriftDrawerOpen(false)}
                  className="border-slate-700 text-slate-300 text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  disabled={remediationInitiated}
                  onClick={handleInitiateRemediation}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {remediationInitiated ? 'Campaign Created!' : 'Initiate Remediation Review'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
