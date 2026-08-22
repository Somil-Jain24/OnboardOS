import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useEmployee } from '../../hooks/useOnboardOS';
import { useAuth } from '../../context/AuthContext';
import { client } from '../../services';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  CheckSquare,
  HelpCircle,
  Sparkles,
  BookOpen,
  X,
  Award,
  ArrowRight,
  ShieldCheck,
  Check,
  ExternalLink,
  Copy,
  Terminal,
  Zap,
  Layers,
  Code2,
  Send,
  MessageSquare,
  Mail,
  FolderGit2,
  Trello,
  Cloud,
  Figma,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Task } from '../../types';

export function MyTasksPage() {
  const { activeEmployeeId } = useAuth();
  const { tasks, employee, refetch } = useEmployee(activeEmployeeId || 'emp-rahul');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null);
  const [activeToolModal, setActiveToolModal] = useState<{
    task: Task;
    credentials: any;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [slackJoinedView, setSlackJoinedView] = useState(false);

  // Training Modules
  const trainingModules = [
    {
      id: 'train-soc2',
      title: 'SOC 2 Type II Security Awareness & Least-Privilege Hygiene',
      description: 'Mandatory annual training covering password managers, phishing defense, and 2FA key management.',
      slides: [
        {
          title: 'Module 1: Password & Credential Security',
          content:
            'Never share credentials or store plaintext API keys in git repositories. All team members must enforce hardware-backed 2FA security keys (YubiKey or Google Titan) for GitHub and AWS Console logins.',
        },
        {
          title: 'Module 2: Phishing & Social Engineering Defense',
          content:
            'Be vigilant of urgent emails requesting gift cards, wire transfers, or immediate password resets. Always inspect the sender domain and report suspicious Slack/Email messages to #sec-ops immediately.',
        },
        {
          title: 'Module 3: Data Protection & Customer PII',
          content:
            'Never export raw customer payment logs or production database dumps to local storage or unapproved personal devices. Production queries must go through audited bastion hosts with JIT approval.',
        },
      ],
      quiz: {
        question: 'Which of the following is strictly prohibited when handling production infrastructure?',
        options: [
          'Requesting time-bound JIT elevation with an incident ticket number',
          'Exporting raw customer cardholder data to a local unencrypted laptop drive',
          'Enforcing hardware 2FA for AWS and GitHub logins',
        ],
        correct: 1,
      },
    },
  ];

  const [activeTrainingModal, setActiveTrainingModal] = useState<
    (typeof trainingModules)[0] | null
  >(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [completedTrainings, setCompletedTrainings] = useState<string[]>([]);

  const categories = ['ALL', 'Identity', 'Communication', 'Development', 'Project', 'Cloud', 'Training'];

  const filteredTasks =
    activeCategory === 'ALL'
      ? tasks
      : tasks.filter((t) => t.category === activeCategory);

  const handleClaimTool = async (task: Task) => {
    setClaimingTaskId(task.id);
    try {
      const res = await client.claimTask(task.id);
      setActiveToolModal({
        task: res.task || task,
        credentials: res.credentials,
      });
      await refetch();
    } catch (err) {
      console.warn('Failed to claim task:', err);
    } finally {
      setClaimingTaskId(null);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const getToolIcon = (adapterType?: string, name = '') => {
    const text = (adapterType + ' ' + name).toLowerCase();
    if (text.includes('google') || text.includes('mail')) return <Mail className="w-5 h-5 text-rose-600" />;
    if (text.includes('slack')) return <MessageSquare className="w-5 h-5 text-emerald-600" />;
    if (text.includes('github') || text.includes('git')) return <FolderGit2 className="w-5 h-5 text-slate-900" />;
    if (text.includes('jira') || text.includes('project')) return <Trello className="w-5 h-5 text-blue-600" />;
    if (text.includes('aws') || text.includes('cloud')) return <Cloud className="w-5 h-5 text-amber-600" />;
    if (text.includes('figma')) return <Figma className="w-5 h-5 text-purple-600" />;
    return <BookOpen className="w-5 h-5 text-indigo-600" />;
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Onboarding Tool Suite: ${employee?.name || 'Rahul Sharma'}`}
        description={`Role-synthesized tool provisioning, credentials activation, and workspace access for ${employee?.roleTitle || 'Backend Developer'} in ${employee?.departmentName || 'Engineering'}.`}
        badge={
          <Badge variant="default" dot>
            {tasks.filter((t) => t.status === 'COMPLETED').length} of {tasks.length || 6} Active
          </Badge>
        }
        actions={
          <Link to="/me/help">
            <Button size="sm" variant="secondary" leftIcon={<HelpCircle className="w-3.5 h-3.5 text-slate-600" />}>
              Need Help? Open Ticket
            </Button>
          </Link>
        }
      />

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Role Tools' : cat}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="space-y-3.5">
        {filteredTasks.map((task) => {
          const isDone = task.status === 'COMPLETED';
          const isWaitingApproval = task.status === 'WAITING_APPROVAL';

          return (
            <div
              key={task.id}
              className={`p-5 bg-white border rounded-3xl shadow-card transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isDone
                  ? 'border-emerald-200 ring-1 ring-emerald-100 bg-emerald-50/20'
                  : isWaitingApproval
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getToolIcon(task.adapterType, task.name)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-400">#{task.adapterType}</span>
                    <h4 className="text-sm font-bold text-slate-900">{task.name}</h4>
                    <StatusBadge
                      status={isDone ? 'completed' : isWaitingApproval ? 'pending' : 'ready'}
                      label={isDone ? 'ACTIVATED' : isWaitingApproval ? 'WAITING SIGN-OFF' : 'READY TO CLAIM'}
                      size="sm"
                    />
                  </div>

                  <p className="text-xs text-slate-500">
                    Category: <strong className="text-slate-700 font-semibold">{task.category}</strong> • System:{' '}
                    <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-[11px]">
                      {task.adapterType}
                    </span>
                    {task.completedAt && (
                      <span className="text-emerald-700 font-medium ml-2">
                        • Activated at {new Date(task.completedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2.5 self-end sm:self-center">
                {isWaitingApproval ? (
                  <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Gated on Manager Signoff</span>
                  </div>
                ) : isDone ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleClaimTool(task)}
                    className="text-xs rounded-xl text-emerald-800 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  >
                    View Active Credentials
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={claimingTaskId === task.id}
                    onClick={() => handleClaimTool(task)}
                    className="text-xs rounded-xl"
                    leftIcon={<Zap className="w-3.5 h-3.5 text-white" />}
                  >
                    Claim & Launch Tool
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Tool Activation & Launch Modal */}
      {activeToolModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-5 text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  {getToolIcon(activeToolModal.task.adapterType, activeToolModal.task.name)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeToolModal.task.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status="completed" label="PROVISIONED & ACTIVE" size="sm" />
                    <span className="text-[11px] font-mono text-slate-400">
                      Assigned to {employee?.name}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveToolModal(null);
                  setSlackJoinedView(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Credentials / Details Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-3">
              {/* Google Workspace */}
              {activeToolModal.credentials?.toolType === 'GOOGLE_WORKSPACE' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">Corporate Email Address</span>
                      <span className="font-mono font-bold text-slate-900">{activeToolModal.credentials.email}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(activeToolModal.credentials.email, 'email')}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-50"
                    >
                      {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">Temporary One-Time Password</span>
                      <span className="font-mono font-bold text-blue-700">{activeToolModal.credentials.tempPassword}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(activeToolModal.credentials.tempPassword, 'pass')}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-50"
                    >
                      {copiedKey === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    {activeToolModal.credentials.instructions}
                  </p>
                </div>
              )}

              {/* Slack Workspace */}
              {activeToolModal.credentials?.toolType === 'SLACK_ENTERPRISE' && (
                <div className="space-y-2.5">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono mb-1.5">
                      Auto-Joined Channels ({activeToolModal.credentials.channels?.length || 3})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeToolModal.credentials.channels?.map((ch: string) => (
                        <span key={ch} className="px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-800 font-mono font-semibold text-xs border border-emerald-200">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed pt-1">
                    {activeToolModal.credentials.instructions}
                  </p>

                  {slackJoinedView && (
                    <div className="p-3 bg-slate-900 rounded-xl text-white font-mono text-[11px] space-y-1">
                      <div className="text-emerald-400 font-bold"># Slack Channel: #{employee?.teamName?.toLowerCase() || 'payments-team'}</div>
                      <div className="text-slate-400">👋 Bot: "Welcome {employee?.name}! Say hello to your new team members."</div>
                    </div>
                  )}
                </div>
              )}

              {/* GitHub */}
              {activeToolModal.credentials?.toolType === 'GITHUB_ENTERPRISE' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Assigned Repositories:</span>
                    <span className="font-mono font-bold text-slate-800">{activeToolModal.credentials.repositories?.join(', ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Access Permission:</span>
                    <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-semibold">{activeToolModal.credentials.role}</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border font-mono text-[11px] text-slate-700">
                    git clone {activeToolModal.credentials.sshConfig}
                  </div>
                </div>
              )}

              {/* Jira Software */}
              {activeToolModal.credentials?.toolType === 'JIRA_SOFTWARE' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Sprint Board:</span>
                    <span className="font-mono font-bold text-blue-700">{activeToolModal.credentials.projectKey}</span>
                  </div>
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Assigned Starter Tickets:</span>
                    {activeToolModal.credentials.assignedTickets?.map((t: string) => (
                      <div key={t} className="p-2 bg-white rounded-lg border text-[11px] font-medium text-slate-800">
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AWS Cloud IAM */}
              {activeToolModal.credentials?.toolType === 'AWS_IAM' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">IAM User:</span>
                    <span className="font-mono font-bold text-amber-800">{activeToolModal.credentials.iamUser}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Role ARN:</span>
                    <span className="font-mono text-[11px] text-slate-700 truncate max-w-[240px]">{activeToolModal.credentials.assumedRole}</span>
                  </div>
                </div>
              )}

              {/* Figma */}
              {activeToolModal.credentials?.toolType === 'FIGMA' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Design Team:</span>
                    <span className="font-bold text-purple-700">{activeToolModal.credentials.team}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">License Seat:</span>
                    <span className="font-semibold text-slate-800">{activeToolModal.credentials.seatType}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Launch Workspace Direct Action */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setActiveToolModal(null);
                  setSlackJoinedView(false);
                }}
              >
                Close
              </Button>

              {activeToolModal.credentials?.toolType === 'SLACK_ENTERPRISE' ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSlackJoinedView(!slackJoinedView)}
                  >
                    {slackJoinedView ? 'Hide Live Preview' : 'Show Chat Preview'}
                  </Button>
                  <a
                    href={
                      activeToolModal.credentials?.slackInviteUrl ||
                      'https://join.slack.com/t/onboard-kz86900/shared_invite/zt-47ltqdl6a-ttlM~yySzcGSegvWDztm0A'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                      🚀 Join Real Slack Workspace
                    </Button>
                  </a>
                </div>
              ) : (
                <a
                  href={
                    activeToolModal.credentials?.webmailUrl ||
                    activeToolModal.credentials?.repoUrl ||
                    activeToolModal.credentials?.sprintBoardUrl ||
                    activeToolModal.credentials?.consoleUrl ||
                    activeToolModal.credentials?.workspaceUrl ||
                    '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Tool in New Tab
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTasksPage;
