import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
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
  CheckCircle2,
  ArrowLeftRight,
  UserX,
  Server,
  Loader2,
  Briefcase,
  Compass,
  X,
  ShieldAlert,
} from 'lucide-react';

export function EmployeeCommandCenterPage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee, plan, tasks, risk, loading, retryTask } = useEmployee(id);
  const [retrying, setRetrying] = useState(false);
  const [retrySuccess, setRetrySuccess] = useState(false);

  // Access Drift Inspector Drawer State
  const [driftDrawerOpen, setDriftDrawerOpen] = useState(false);
  const [remediationInitiated, setRemediationInitiated] = useState(false);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <PageHeader
        title={
          <div className="flex items-center gap-4">
            <Avatar
              name={employee?.name || 'Rahul Sharma'}
              size="lg"
              status={isBlocked ? 'failed' : 'online'}
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-2xl font-bold text-slate-900">{employee?.name}</span>
                {isBlocked ? (
                  <StatusBadge status="blocked" label="Provisioning Interrupted" size="sm" showIcon />
                ) : (
                  <StatusBadge status="completed" label="Day-1 Ready for Work" size="sm" showIcon />
                )}
              </div>
              <span className="text-xs font-normal text-slate-500 block mt-1">
                {employee?.roleTitle} • {employee?.departmentName} ({employee?.teamName}) • Seniority:{' '}
                <span className="font-mono text-slate-700 font-semibold">{employee?.seniority}</span> • Manager:{' '}
                <span className="text-slate-700 font-semibold">{employee?.managerName}</span>
              </span>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setDriftDrawerOpen(true)}
              className="text-xs"
            >
              <Compass className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
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
                leftIcon={<SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />}
              >
                What-If Simulation
              </Button>
            </Link>
          </div>
        }
      />

      {retrySuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Jira Adapter retry succeeded! Downstream dependencies unblocked automatically.
          </span>
        </div>
      )}

      {/* Centerpiece 3-Column Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Work Context Snapshot */}
        <div className="lg:col-span-4 p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Work Context Snapshot</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Department</span>
              <span className="font-semibold text-slate-800">{employee?.departmentName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Team / Pod</span>
              <span className="font-semibold text-slate-800">{employee?.teamName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Seniority Band</span>
              <span className="font-mono text-slate-800 font-semibold">{employee?.seniority} (L1)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Location / Mode</span>
              <span className="text-slate-800">{employee?.location}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Employment Type</span>
              <span className="text-slate-800">{employee?.employmentType}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Policy Ruleset</span>
              <span className="font-mono text-blue-700 font-bold">v1.0.0 (Engineering Policy)</span>
            </div>
          </div>
        </div>

        {/* Center Column: Readiness Score & Risk Score Dual Ring */}
        <div className="lg:col-span-4 flex flex-col justify-center items-center p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card">
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
        </div>

        {/* Right Column: Systems Integration Status */}
        <div className="lg:col-span-4 p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Systems Status</h3>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              {systems.filter((s) => s.status === 'COMPLETED').length}/{systems.length} Active
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {systems.map((sys) => {
              const isDone = sys.status === 'COMPLETED';
              const isFailed = sys.status === 'FAILED';

              return (
                <div
                  key={sys.name}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="flex items-center gap-2.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : isFailed ? (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                    <div>
                      <p className="font-bold text-slate-900">{sys.name}</p>
                      <p className="text-[11px] text-slate-500">{sys.detail}</p>
                    </div>
                  </div>
                  <StatusBadge
                    status={isDone ? 'completed' : isFailed ? 'failed' : 'pending'}
                    label={sys.status}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sub-Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link to={`/employees/${id}/plan`}>
          <div className="p-4 bg-white hover:bg-blue-50/50 border border-slate-200/90 hover:border-blue-300 rounded-3xl shadow-card transition-all text-center space-y-2 cursor-pointer group">
            <div className="w-10 h-10 mx-auto rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">AI Plan & Why</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Rules & Rationales</p>
            </div>
          </div>
        </Link>

        <Link to={`/employees/${id}/access`}>
          <div className="p-4 bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-300 rounded-3xl shadow-card transition-all text-center space-y-2 cursor-pointer group">
            <div className="w-10 h-10 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Access Graph</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Visual DAG Matrix</p>
            </div>
          </div>
        </Link>

        <Link to={`/employees/${id}/provisioning`}>
          <div className="p-4 bg-white hover:bg-indigo-50/50 border border-slate-200/90 hover:border-indigo-300 rounded-3xl shadow-card transition-all text-center space-y-2 cursor-pointer group">
            <div className="w-10 h-10 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Provisioning</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Ledger & Payload</p>
            </div>
          </div>
        </Link>

        <Link to={`/employees/${id}/risk`}>
          <div className="p-4 bg-white hover:bg-purple-50/50 border border-slate-200/90 hover:border-purple-300 rounded-3xl shadow-card transition-all text-center space-y-2 cursor-pointer group">
            <div className="w-10 h-10 mx-auto rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Risk & Readiness</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Blockers & SLA</p>
            </div>
          </div>
        </Link>

        <Link to={`/employees/${id}/transfer`}>
          <div className="p-4 bg-white hover:bg-amber-50/50 border border-slate-200/90 hover:border-amber-300 rounded-3xl shadow-card transition-all text-center space-y-2 cursor-pointer group">
            <div className="w-10 h-10 mx-auto rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Role Transfer</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Context Diff</p>
            </div>
          </div>
        </Link>

        <Link to={`/employees/${id}/offboarding`}>
          <div className="p-4 bg-white hover:bg-rose-50/50 border border-slate-200/90 hover:border-rose-300 rounded-3xl shadow-card transition-all text-center space-y-2 cursor-pointer group">
            <div className="w-10 h-10 mx-auto rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Offboarding</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Exit Checklist</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Peer Access Drift & Anomaly Inspector Modal */}
      {driftDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 bg-white border border-slate-200 rounded-3xl shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Peer Access Drift & Anomaly Analysis</h3>
                  <p className="text-xs text-slate-500">
                    Comparing <strong>{employee?.name}</strong> against peer baseline: <code>Junior Backend Developers (n=14)</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDriftDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drift Score Meter */}
            <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-purple-700 font-bold">Computed Drift Divergence:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl font-bold text-slate-900">12% Divergence</span>
                  <StatusBadge status="warning" label="1 Outlier Flagged" size="sm" />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  88% entitlement overlap matches role baseline. One privilege deviation requires security attention.
                </p>
              </div>
              <div className="text-right font-mono text-xs text-purple-800 bg-white p-3 rounded-2xl border border-purple-200 shadow-xs">
                <span>Peer Size: 14</span>
                <br />
                <span className="text-emerald-600 font-bold">Standard: 4 Apps</span>
              </div>
            </div>

            {/* Side-by-Side Entitlement Comparison */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Side-by-Side Entitlement Comparison Matrix</h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                <div className="grid grid-cols-12 bg-slate-50 p-3 font-mono text-xs text-slate-600 font-bold">
                  <span className="col-span-5">Entitlement / Application</span>
                  <span className="col-span-3 text-center">Peer Cohort %</span>
                  <span className="col-span-4 text-right">Status / Deviation</span>
                </div>

                <div className="grid grid-cols-12 p-3 items-center">
                  <span className="col-span-5 text-slate-800 font-medium">Google Workspace Mailbox</span>
                  <span className="col-span-3 text-center font-mono text-slate-500">100% (14/14)</span>
                  <span className="col-span-4 text-right">
                    <StatusBadge status="completed" label="Baseline Match" size="sm" />
                  </span>
                </div>

                <div className="grid grid-cols-12 p-3 items-center">
                  <span className="col-span-5 text-slate-800 font-medium">GitHub payments-backend (Write)</span>
                  <span className="col-span-3 text-center font-mono text-slate-500">100% (14/14)</span>
                  <span className="col-span-4 text-right">
                    <StatusBadge status="completed" label="Baseline Match" size="sm" />
                  </span>
                </div>

                <div className="grid grid-cols-12 p-3 items-center">
                  <span className="col-span-5 text-slate-800 font-medium">Slack #engineering, #payments</span>
                  <span className="col-span-3 text-center font-mono text-slate-500">100% (14/14)</span>
                  <span className="col-span-4 text-right">
                    <StatusBadge status="completed" label="Baseline Match" size="sm" />
                  </span>
                </div>

                <div className="grid grid-cols-12 p-3 items-center bg-rose-50/70">
                  <div className="col-span-5">
                    <span className="text-rose-950 font-bold">AWS Production IAM Admin</span>
                    <p className="text-[11px] text-rose-700">Requested via manual elevation</p>
                  </div>
                  <span className="col-span-3 text-center font-mono text-rose-700 font-bold">0% (0/14 Peers)</span>
                  <span className="col-span-4 text-right">
                    <StatusBadge status="blocked" label="High Anomaly" size="sm" showIcon />
                  </span>
                </div>
              </div>
            </div>

            {/* Remediation Action Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Automated Remediation & Certification Action</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Initiating remediation will trigger an immediate ad-hoc Access Certification campaign for this user and alert the Security Admin queue.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200/80">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setDriftDrawerOpen(false)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  disabled={remediationInitiated}
                  onClick={handleInitiateRemediation}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-xl"
                >
                  {remediationInitiated ? 'Campaign Created!' : 'Initiate Remediation Review'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

