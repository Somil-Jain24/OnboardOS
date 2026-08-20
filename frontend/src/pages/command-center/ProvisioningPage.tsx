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
} from 'lucide-react';
import type { Task } from '../../types';

export function ProvisioningPage() {
  const { id = 'emp-rahul' } = useParams();
  const { employee, tasks, loading, retryTask, refetch } = useEmployee(id);
  const [retryingTaskId, setRetryingTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'logs'>('tasks');
  const [skipDialogOpen, setSkipDialogOpen] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState('');

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

  const handleInjectFailure = async () => {
    await client.injectJiraFailure(id);
    refetch();
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
              <span className="text-xs font-normal text-slate-400 block mt-0.5">
                Idempotent execution engine with automated dependency resolution & failure isolation.
              </span>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleInjectFailure}
              leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
            >
              Inject Jira 503 Failure
            </Button>
            <Link to={`/employees/${id}`}>
              <Button size="sm" variant="secondary">
                Back to Command Center
              </Button>
            </Link>
          </div>
        }
      />

      {/* Progress & Orchestration Metrics Banner */}
      <Card className="p-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-100">
                Execution Progress ({completedCount}/{tasks.length} Complete)
              </h4>
              <Badge variant={progressPercent === 100 ? 'success' : 'info'} size="sm">
                {progressPercent}%
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              All tasks execute in strict DAG topological dependency order with isolated idempotency keys.
            </p>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-400 block">Completed</span>
              <span className="text-sm font-bold text-emerald-400">{completedCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-400 block">Failures</span>
              <span className={`text-sm font-bold ${hasFailure ? 'text-rose-400' : 'text-slate-400'}`}>
                {tasks.filter((t) => t.status === 'FAILED').length}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-400 block">Blocked</span>
              <span className="text-sm font-bold text-amber-400">
                {tasks.filter((t) => t.status === 'BLOCKED').length}
              </span>
            </div>
          </div>
        </div>

        <Progress value={progressPercent} variant={hasFailure ? 'danger' : 'success'} />
      </Card>

      {/* View Switcher: Task Steps vs Adapter Logs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Provisioning DAG Steps ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Live Adapter Stream Logs
          </button>
        </div>
      </div>

      {activeTab === 'tasks' ? (
        /* Task DAG Execution List */
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

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                        <span>Adapter: <code className="text-slate-300 font-mono">{task.adapterType}</code></span>
                        <span>•</span>
                        <span>Attempts: <strong className="font-mono text-slate-300">{task.attempt}</strong></span>
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
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isFailed && (
                      <Button
                        size="sm"
                        variant="destructive"
                        isLoading={retryingTaskId === task.id}
                        onClick={() => handleRetry(task.id)}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      >
                        Retry Action
                      </Button>
                    )}

                    {!isDone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSkipDialogOpen(task.id)}
                        leftIcon={<SkipForward className="w-3.5 h-3.5" />}
                      >
                        Skip
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
