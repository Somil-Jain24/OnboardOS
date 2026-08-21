import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { Avatar } from '../../components/ui/Avatar';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  RotateCcw,
  SkipForward,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Terminal,
  Lock,
  Loader2,
  Layers,
  Shield,
  Code2,
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

  // Payload Inspector & Manual Intervention Drawer State
  const [selectedTaskForInspector, setSelectedTaskForInspector] = useState<Task | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [overriding, setOverriding] = useState(false);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
    <div className="space-y-6 text-left">
      <PageHeader
        title={
          <div className="flex items-center gap-3.5">
            <Avatar name={employee?.name || 'Rahul Sharma'} size="md" status={hasFailure ? 'failed' : 'online'} />
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-slate-900">Live Provisioning: {employee?.name}</span>
                {hasFailure ? (
                  <StatusBadge status="blocked" label="Provisioning Interrupted" size="sm" showIcon />
                ) : (
                  <StatusBadge status="completed" label="Orchestration Ready" size="sm" showIcon />
                )}
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {employee?.roleTitle} • {employee?.departmentName} • Idempotent Execution Ledger & Adapter Telemetry
              </p>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleInjectFailure}
              className="text-xs"
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
      <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
        <div className="flex items-center justify-between text-xs md:text-sm">
          <span className="text-slate-700 font-bold">Orchestration DAG Execution Progress</span>
          <span className="font-mono text-blue-600 font-bold">{progressPercent}% Completed ({completedCount}/{tasks.length} Tasks)</span>
        </div>
        <Progress value={progressPercent} variant={hasFailure ? 'warning' : 'default'} className="h-2.5" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs border-t border-slate-100 font-mono">
          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
            <span className="text-[10px] text-emerald-800 uppercase font-bold">Completed</span>
            <p className="font-bold text-emerald-600 text-lg mt-0.5">{completedCount}</p>
          </div>
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl">
            <span className="text-[10px] text-blue-800 uppercase font-bold">In-Flight / Ready</span>
            <p className="font-bold text-blue-600 text-lg mt-0.5">{tasks.filter((t) => t.status === 'READY' || t.status === 'RUNNING').length}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] text-slate-600 uppercase font-bold">Blocked on Upstream</span>
            <p className="font-bold text-slate-700 text-lg mt-0.5">{tasks.filter((t) => t.status === 'BLOCKED').length}</p>
          </div>
          <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-2xl">
            <span className="text-[10px] text-rose-800 uppercase font-bold">Failed & Blocked</span>
            <p className="font-bold text-rose-600 text-lg mt-0.5">{tasks.filter((t) => t.status === 'FAILED').length}</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 pb-1">
        <Button
          size="sm"
          variant={activeTab === 'tasks' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('tasks')}
          className="text-xs rounded-xl"
        >
          <Layers className="w-3.5 h-3.5 mr-1.5" />
          Task DAG Execution Items ({tasks.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'logs' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('logs')}
          className="text-xs rounded-xl"
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
              <div
                key={task.id}
                className={`p-5 rounded-3xl transition-all border bg-white shadow-card space-y-3 ${
                  isFailed
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isBlocked
                    ? 'border-slate-200/80 opacity-75'
                    : isWaiting
                    ? 'border-amber-300'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5">
                      {isDone ? (
                        <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 block">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : isFailed ? (
                        <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 block animate-pulse">
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                      ) : isBlocked ? (
                        <span className="p-2 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 block">
                          <Lock className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 block">
                          <Clock className="w-4 h-4" />
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-400 font-semibold">#{idx + 1}</span>
                        <h4 className="text-sm font-bold text-slate-900">{task.name}</h4>
                        <StatusBadge
                          status={isDone ? 'completed' : isFailed ? 'failed' : isBlocked ? 'blocked' : 'pending'}
                          label={task.status}
                          size="sm"
                        />
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-mono">
                        <span>Adapter: <code className="text-blue-600 font-semibold">{task.adapterType}</code></span>
                        <span>•</span>
                        <span>Attempts: <strong className="text-slate-700">{task.attempt}</strong></span>
                        {task.completedAt && (
                          <>
                            <span>•</span>
                            <span>Completed: <span className="text-slate-700">{new Date(task.completedAt).toLocaleTimeString()}</span></span>
                          </>
                        )}
                      </div>

                      {/* Error & Cascading Impact Box */}
                      {isFailed && task.failureReason && (
                        <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-1.5">
                          <div className="text-rose-900 font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Failure Reason: {task.failureReason}</span>
                          </div>
                          {task.impactSummary && (
                            <p className="text-rose-700 text-xs leading-relaxed">
                              {task.impactSummary}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Blocked Explanation */}
                      {isBlocked && (
                        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Gated on completion of upstream dependency: <strong>Jira Task</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedTaskForInspector(task)}
                      className="text-xs h-8 rounded-xl"
                    >
                      <Code2 className="w-3.5 h-3.5 mr-1 text-blue-600" /> Inspect Payload
                    </Button>

                    {isFailed && (
                      <Button
                        size="sm"
                        variant="destructive"
                        isLoading={retryingTaskId === task.id}
                        onClick={() => handleRetry(task.id)}
                        className="text-xs h-8 rounded-xl"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retry
                      </Button>
                    )}

                    {!isDone && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSkipDialogOpen(task.id)}
                        className="text-xs h-8 rounded-xl text-slate-600"
                      >
                        <SkipForward className="w-3.5 h-3.5 mr-1" /> Skip
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Live Adapter Stream Terminal Logs */
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl font-mono text-xs space-y-3 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 text-xs">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Provisioning Stream (Standard Out / Err)
            </span>
            <span>UTF-8 • Log Buffer: 8 entries</span>
          </div>

          <div className="space-y-2 pt-1">
            {logs.map((l, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs leading-relaxed">
                <span className="text-slate-500 flex-shrink-0">{l.time}</span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex-shrink-0 ${
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
        </div>
      )}

      {/* Payload Inspector & Manual Intervention Modal */}
      {selectedTaskForInspector && (() => {
        const payloadData = getTaskPayloadInfo(selectedTaskForInspector);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 bg-white border border-slate-200 rounded-3xl shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-600 font-bold">{selectedTaskForInspector.id}</span>
                    <h3 className="font-bold text-slate-900 text-base">{selectedTaskForInspector.name}</h3>
                    <StatusBadge status={selectedTaskForInspector.status === 'COMPLETED' ? 'completed' : 'pending'} label={selectedTaskForInspector.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Adapter: {selectedTaskForInspector.adapterType}</p>
                </div>
                <button
                  onClick={() => setSelectedTaskForInspector(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              {/* Endpoint & Idempotency Header */}
              <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Adapter Endpoint Target:</span>
                  <p className="text-blue-700 font-medium truncate mt-0.5">{payloadData.endpoint}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500">Idempotency Key:</span>
                    <p className="text-slate-800 font-semibold">{payloadData.idempotencyKey}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Execution Status:</span>
                    <p className={selectedTaskForInspector.status === 'FAILED' ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {payloadData.responseHeaders.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* JSON Payload Viewer */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Raw Outbound JSON Request Body:
                </span>
                <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-emerald-400 text-xs font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(payloadData.requestBody, null, 2)}
                </pre>
              </div>

              {/* Response Headers */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Response Headers Telemetry:
                </span>
                <pre className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 text-xs font-mono overflow-x-auto">
                  {JSON.stringify(payloadData.responseHeaders, null, 2)}
                </pre>
              </div>

              {/* Manual Override Form */}
              <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Manual Administrative Override & Verification</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If the external tool was manually configured out-of-band, you can force-mark this task as completed. This immediately unblocks downstream dependent tasks on the execution DAG.
                </p>

                <textarea
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Document manual verification justification for the immutable audit log..."
                  className="w-full p-3 text-xs bg-white border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans"
                />

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedTaskForInspector(null)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    disabled={!overrideReason.trim() || overriding}
                    onClick={handleManualOverride}
                    className="text-xs"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {overriding ? 'Overriding...' : 'Override & Mark Completed'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Skip Task Modal */}
      {skipDialogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <h4 className="text-base font-bold text-slate-900">Skip Task with Audit Reason</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Skipping an onboarding task requires a documented rationale stored immutably in the audit log.
            </p>
            <textarea
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="e.g. User already has legacy enterprise account, verified manually."
              className="w-full h-24 p-3 text-xs bg-white border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
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
          </div>
        </div>
      )}
    </div>
  );
}

