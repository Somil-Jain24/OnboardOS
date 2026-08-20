import { useState } from 'react';
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
  Play,
  RotateCcw,
  SkipForward,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Terminal,
  Server,
  Lock,
  Loader2,
  Layers,
  ArrowRight,
  Shield,
  FileCode,
  Code2,
  XCircle,
  KeyRound,
  Check,
} from 'lucide-react';
import type { Task } from '../../types';

export function ProvisioningPage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee, tasks, loading, retryTask, refetch } = useEmployee(id);
  const [retryingTaskId, setRetryingTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'logs'>('tasks');
  const [skipDialogOpen, setSkipDialogOpen] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState('');

  // TASK-183: Payload Inspector & Manual Intervention Drawer State
  const [selectedTaskForInspector, setSelectedTaskForInspector] = useState<Task | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [overriding, setOverriding] = useState(false);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="text-xs">Loading provisioning orchestrator...</span>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedCount / (tasks.length || 1)) * 100);
  const hasFailure = tasks.some((t) => t.status === 'FAILED');

  const handleRetry = async (taskId: string) => {
    setRetryingTaskId(taskId);
    try {
      await retryTask(taskId);
    } finally {
      setRetryingTaskId(null);
    }
  };

  const handleSkip = async (taskId: string) => {
    if (!skipReason) return;
    await client.skipTask(taskId, skipReason);
    setSkipDialogOpen(null);
    setSkipReason('');
    refetch();
  };

  const handleManualOverride = async () => {
    if (!selectedTaskForInspector || !overrideReason.trim()) return;
    try {
      setOverriding(true);
      await client.manualOverrideTask(selectedTaskForInspector.id, overrideReason);
      setSelectedTaskForInspector(null);
      setOverrideReason('');
      refetch();
    } finally {
      setOverriding(false);
    }
  };

  const handleInjectFailure = async () => {
    await client.injectJiraFailure(id);
    refetch();
  };

  const getTaskPayloadInfo = (task: Task) => {
    const isJira = task.adapterType === 'JIRA';
    const isGitHub = task.adapterType === 'GITHUB';
    const isGoogle = task.adapterType === 'GOOGLE';
    const isAws = task.adapterType === 'AWS';

    const endpoint = isJira
      ? 'https://jira.atlassian.net/rest/api/3/project/PAYMENTS/role/10002'
      : isGitHub
      ? 'https://api.github.com/orgs/onboardos-enterprise/teams/payments-core/memberships'
      : isGoogle
      ? 'https://admin.googleapis.com/admin/directory/v1/users'
      : 'https://iam.amazonaws.com/v1/roles/PaymentsDevSandbox';

    const idempotencyKey = `idemp-${task.id}-${task.attempt || 1}`;

    const requestBody = {
      employeeId: employee?.id || 'emp-rahul',
      employeeEmail: employee?.email || 'rahul.sharma@onboardos.internal',
      operation: task.name,
      adapter: task.adapterType,
      targetScope: isJira ? 'PAYMENTS-Core' : isGitHub ? 'payments-backend (Write)' : 'Standard-Access',
      credentialsProvisioned: true,
      timestamp: new Date().toISOString(),
    };

    const responseHeaders = {
      'content-type': 'application/json; charset=utf-8',
      'x-idempotency-key': idempotencyKey,
      'x-ratelimit-remaining': isJira && task.status === 'FAILED' ? '0' : '4980',
      'x-transaction-id': `txn-${task.id}-992`,
      status: isJira && task.status === 'FAILED' ? '503 Service Unavailable (Rate Limit)' : '200 OK',
    };

    return { endpoint, idempotencyKey, requestBody, responseHeaders };
  };

  const logs = [
    { time: '09:10:05', adapter: 'GOOGLE', level: 'INFO', msg: 'Provisioning Google Workspace user rahul.sharma@onboardos.internal...' },
    { time: '09:10:07', adapter: 'GOOGLE', level: 'SUCCESS', msg: 'Created mailbox, assigned 2FA security key requirement. Status: 200 OK.' },
    { time: '09:10:09', adapter: 'GITHUB', level: 'INFO', msg: 'Dispatching GitHub org invite with team permissions: payments-core...' },
    { time: '09:10:12', adapter: 'GITHUB', level: 'SUCCESS', msg: 'GitHub invitation accepted. Repositories: payments-backend (write).' },
    { time: '09:10:12', adapter: 'SLACK', level: 'INFO', msg: 'Inviting user to Slack workspace and channels #engineering, #payments...' },
    { time: '09:10:14', adapter: 'SLACK', level: 'SUCCESS', msg: 'Slack profile initialized and channels joined.' },
    { time: '09:10:14', adapter: 'JIRA', level: 'ERROR', msg: 'POST /rest/api/3/project/PAYMENTS/role/10002 returned HTTP 503: Rate Limit Exceeded.' },
    { time: '09:10:15', adapter: 'ORCHESTRATOR', level: 'WARN', msg: 'Task task-rahul-jira marked FAILED. Cascading: Set task-rahul-board to BLOCKED.' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Avatar name={employee?.name || 'Rahul Sharma'} size="md" status={hasFailure ? 'failed' : 'online'} />
            <div>
              <div className="flex items-center gap-2">
                <span>Live Provisioning Orchestration: {employee?.name}</span>
                {hasFailure ? (
                  <Badge variant="danger" size="sm" dot>
                    Provisioning Interrupted
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm" dot>
                    Orchestration Ready
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 font-normal">
                {employee?.roleTitle} • {employee?.departmentName} • Idempotent Execution Ledger & Adapter Telemetry
              </p>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleInjectFailure}
              className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Simulate Adapter Failure
            </Button>
            <Link to={`/employees/${id}`}>
              <Button size="sm" variant="secondary">Back to Command Center</Button>
            </Link>
          </div>
        }
      />

      {/* Progress & Overview Bar */}
      <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Orchestration DAG Execution Progress</span>
          <span className="font-mono text-blue-400 font-bold">{progressPercent}% Completed ({completedCount}/{tasks.length} Tasks)</span>
        </div>
        <Progress value={progressPercent} variant={hasFailure ? 'warning' : 'default'} className="h-2" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-slate-800 font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Completed</span>
            <p className="font-bold text-emerald-400 mt-0.5">{completedCount}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase">In-Flight / Ready</span>
            <p className="font-bold text-blue-400 mt-0.5">{tasks.filter((t) => t.status === 'READY' || t.status === 'RUNNING').length}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Blocked on Upstream</span>
            <p className="font-bold text-slate-400 mt-0.5">{tasks.filter((t) => t.status === 'BLOCKED').length}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Failed & Blocked</span>
            <p className="font-bold text-rose-400 mt-0.5">{tasks.filter((t) => t.status === 'FAILED').length}</p>
          </div>
        </div>
      </Card>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <Button
          size="sm"
          variant={activeTab === 'tasks' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('tasks')}
          className="text-xs"
        >
          <Layers className="w-3.5 h-3.5 mr-1.5" />
          Task DAG Execution Items ({tasks.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'logs' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('logs')}
          className="text-xs"
        >
          <Terminal className="w-3.5 h-3.5 mr-1.5" />
          Live Telemetry Stream
        </Button>
      </div>

      {/* Tasks DAG List */}
      {activeTab === 'tasks' ? (
        <div className="space-y-3">
          {tasks.map((task, idx) => {
            const isDone = task.status === 'COMPLETED';
            const isFailed = task.status === 'FAILED';
            const isBlocked = task.status === 'BLOCKED';
            const isWaiting = task.status === 'WAITING_APPROVAL';

            return (
              <Card
                key={task.id}
                className={`p-4 transition-all border ${
                  isFailed
                    ? 'bg-rose-950/20 border-rose-500/50'
                    : isBlocked
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                    : isWaiting
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5">
                      {isDone ? (
                        <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 block">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : isFailed ? (
                        <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 block animate-pulse">
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                      ) : isBlocked ? (
                        <span className="p-1.5 rounded-lg bg-slate-800 text-slate-400 block">
                          <Lock className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 block">
                          <Clock className="w-4 h-4" />
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                        <h4 className="text-sm font-bold text-slate-100">{task.name}</h4>
                        <Badge
                          variant={
                            isDone ? 'success' : isFailed ? 'danger' : isBlocked ? 'muted' : 'warning'
                          }
                          size="sm"
                        >
                          {task.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap font-mono">
                        <span>Adapter: <code className="text-blue-400">{task.adapterType}</code></span>
                        <span>•</span>
                        <span>Attempts: <strong className="text-slate-300">{task.attempt}</strong></span>
                        {task.completedAt && (
                          <>
                            <span>•</span>
                            <span>Completed: <span className="text-slate-300">{new Date(task.completedAt).toLocaleTimeString()}</span></span>
                          </>
                        )}
                      </div>

                      {/* Error & Cascading Impact Box */}
                      {isFailed && task.failureReason && (
                        <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs space-y-1.5">
                          <div className="text-rose-200 font-semibold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Failure Reason: {task.failureReason}</span>
                          </div>
                          {task.impactSummary && (
                            <p className="text-rose-300/90 text-[11px]">
                              {task.impactSummary}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Blocked Explanation */}
                      {isBlocked && (
                        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Gated on completion of upstream dependency: <strong>Jira Task</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    {/* TASK-183: Inspect Payload Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTaskForInspector(task)}
                      className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs h-8"
                    >
                      <Code2 className="w-3.5 h-3.5 mr-1 text-blue-400" /> Inspect Payload
                    </Button>

                    {isFailed && (
                      <Button
                        size="sm"
                        variant="destructive"
                        isLoading={retryingTaskId === task.id}
                        onClick={() => handleRetry(task.id)}
                        className="text-xs h-8"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retry
                      </Button>
                    )}

                    {!isDone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSkipDialogOpen(task.id)}
                        className="border-slate-700 text-slate-400 hover:bg-slate-800 text-xs h-8"
                      >
                        <SkipForward className="w-3.5 h-3.5 mr-1" /> Skip
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Live Adapter Stream Terminal Logs */
        <Card className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Provisioning Stream (Standard Out / Err)
            </span>
            <span>UTF-8 • Log Buffer: 8 entries</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {logs.map((l, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs leading-relaxed">
                <span className="text-slate-500 flex-shrink-0">{l.time}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                    l.level === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : l.level === 'ERROR'
                      ? 'bg-rose-500/20 text-rose-400'
                      : l.level === 'WARN'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {l.adapter}
                </span>
                <span
                  className={
                    l.level === 'ERROR'
                      ? 'text-rose-300'
                      : l.level === 'SUCCESS'
                      ? 'text-emerald-300'
                      : 'text-slate-300'
                  }
                >
                  {l.msg}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TASK-183: Payload Inspector & Manual Intervention Drawer */}
      {selectedTaskForInspector && (() => {
        const payloadData = getTaskPayloadInfo(selectedTaskForInspector);

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 bg-slate-900 border-slate-800 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-400 font-bold">{selectedTaskForInspector.id}</span>
                    <h3 className="font-bold text-slate-100 text-base">{selectedTaskForInspector.name}</h3>
                    <Badge variant={selectedTaskForInspector.status === 'COMPLETED' ? 'default' : 'warning'} size="sm">
                      {selectedTaskForInspector.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Adapter: {selectedTaskForInspector.adapterType}</p>
                </div>
                <button
                  onClick={() => setSelectedTaskForInspector(null)}
                  className="text-slate-500 hover:text-slate-300 text-lg p-1"
                >
                  ✕
                </button>
              </div>

              {/* Endpoint & Idempotency Header */}
              <div className="space-y-2 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 uppercase text-[10px]">Adapter Endpoint Target:</span>
                  <p className="text-blue-300 font-medium truncate mt-0.5">{payloadData.endpoint}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900 text-[11px]">
                  <div>
                    <span className="text-slate-500">Idempotency Key:</span>
                    <p className="text-slate-300">{payloadData.idempotencyKey}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Execution Status:</span>
                    <p className={selectedTaskForInspector.status === 'FAILED' ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                      {payloadData.responseHeaders.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* JSON Payload Viewer */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Raw Outbound JSON Request Body:
                </span>
                <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 text-xs font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(payloadData.requestBody, null, 2)}
                </pre>
              </div>

              {/* Response Headers */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Response Headers Telemetry:
                </span>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono overflow-x-auto">
                  {JSON.stringify(payloadData.responseHeaders, null, 2)}
                </pre>
              </div>

              {/* Manual Override Form */}
              <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-blue-300 font-semibold text-xs">
                  <Shield className="w-4 h-4" />
                  <span>Manual Administrative Override & Verification</span>
                </div>
                <p className="text-xs text-slate-400">
                  If the external tool was manually configured out-of-band, you can force-mark this task as completed. This immediately unblocks downstream dependent tasks on the execution DAG.
                </p>

                <textarea
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Document manual verification justification for the immutable audit log..."
                  className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTaskForInspector(null)}
                    className="border-slate-700 text-slate-300 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!overrideReason.trim() || overriding}
                    onClick={handleManualOverride}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {overriding ? 'Overriding...' : 'Override & Mark Completed'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );
      })()}

      {/* Skip Task Modal */}
      {skipDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-5 space-y-4 bg-slate-900 border-slate-800">
            <h4 className="text-sm font-bold text-slate-100">Skip Task with Audit Reason</h4>
            <p className="text-xs text-slate-400">
              Skipping an onboarding task requires a documented rationale stored immutably in the audit log.
            </p>
            <textarea
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="e.g. User already has legacy enterprise account, verified manually."
              className="w-full h-20 p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setSkipDialogOpen(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={!skipReason.trim()}
                onClick={() => handleSkip(skipDialogOpen)}
              >
                Confirm Skip
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
