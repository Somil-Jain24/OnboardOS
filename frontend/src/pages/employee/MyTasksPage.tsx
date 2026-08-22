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
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Task } from '../../types';

export function MyTasksPage() {
  const { activeEmployeeId, currentUser } = useAuth();
  const effectiveEmployeeId = currentUser?.role === 'EMPLOYEE' && currentUser.employeeId ? currentUser.employeeId : (activeEmployeeId || 'emp-rahul');
  const { tasks, employee, refetch } = useEmployee(effectiveEmployeeId);
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
      // 1. Dispatch ViaSocket access claim webhook with ownership verification
      await client.claimAccess(task.id).catch((e) => {
        console.warn('ViaSocket claim dispatch notice:', e.message);
      });

      // 2. Fetch active credentials / launch payload
      const res = await client.claimTask(task.id);
      setActiveToolModal({
        task: res.task || task,
        credentials: res.credentials,
      });
      await refetch();
    } catch (err: any) {
      console.warn('Failed to claim task:', err.message);
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
                    {/* Self-Service Workspace Claim Status Badges */}
                    {!task.claimStatus || task.claimStatus === 'NOT_STARTED' ? (
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                        Ready to claim
                      </span>
                    ) : task.claimStatus === 'INVITE_SENT' ? (
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        Invite sent
                      </span>
                    ) : task.claimStatus === 'ACCEPTED' || isDone ? (
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Access verified
                      </span>
                    ) : task.claimStatus === 'FAILED' ? (
                      <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                        Failed — retry available
                      </span>
                    ) : null}
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
                ) : task.claimStatus === 'FAILED' ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    isLoading={claimingTaskId === task.id}
                    onClick={() => handleClaimTool(task)}
                    className="text-xs rounded-xl"
                  >
                    Retry Claim
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
                    {task.claimStatus === 'INVITE_SENT' ? 'Confirming Access...' : 'Claim & Launch Tool'}
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
              {/* 1. Google Workspace */}
              {(activeToolModal.credentials?.toolType === 'GOOGLE_WORKSPACE' ||
                activeToolModal.task.adapterType === 'GOOGLE' ||
                activeToolModal.task.name.toLowerCase().includes('google') ||
                activeToolModal.task.name.toLowerCase().includes('mail')) && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">Corporate Email Address</span>
                      <span className="font-mono font-bold text-slate-900">{activeToolModal.credentials?.email || employee?.email || 'employee@onboardos.internal'}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(activeToolModal.credentials?.email || employee?.email || '', 'email')}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">Temporary One-Time Password</span>
                      <span className="font-mono font-bold text-blue-700">{activeToolModal.credentials?.tempPassword || 'Pass#892134!'}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(activeToolModal.credentials?.tempPassword || 'Pass#892134!', 'pass')}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      {copiedKey === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  </div>

                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    {activeToolModal.credentials?.instructions || 'Use your temporary password on first sign-in and register your 2FA authenticator.'}
                  </p>
                </div>
              )}

              {/* 2. Slack Workspace */}
              {(activeToolModal.credentials?.toolType === 'SLACK_ENTERPRISE' ||
                activeToolModal.task.adapterType === 'SLACK' ||
                activeToolModal.task.name.toLowerCase().includes('slack')) && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">Slack Workspace</span>
                      <span className="font-bold text-slate-900">OnboardOS Enterprise Slack</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Active
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono mb-1.5">
                      Auto-Joined Channels ({activeToolModal.credentials?.channels?.length || 4})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(activeToolModal.credentials?.channels || ['#general', '#announcements', `#${(employee?.departmentName || 'eng').toLowerCase()}`, `#${(employee?.teamName || 'team').toLowerCase().replace(/\s+/g, '-')}`]).map((ch: string) => (
                        <span key={ch} className="px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-800 font-mono font-semibold text-xs border border-emerald-200">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed pt-1">
                    {activeToolModal.credentials?.instructions || 'You have been added to the team Slack workspace. Click below to join and say hello!'}
                  </p>

                  {slackJoinedView && (
                    <div className="p-3 bg-slate-900 rounded-xl text-white font-mono text-[11px] space-y-1 animate-in fade-in">
                      <div className="text-emerald-400 font-bold"># Slack Channel: #{employee?.teamName?.toLowerCase().replace(/\s+/g, '-') || 'payments-core'}</div>
                      <div className="text-slate-400">👋 Bot: "Welcome {employee?.name}! Say hello to your new team members."</div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. GitHub Enterprise */}
              {(activeToolModal.credentials?.toolType === 'GITHUB_ENTERPRISE' ||
                activeToolModal.task.adapterType === 'GITHUB' ||
                activeToolModal.task.name.toLowerCase().includes('github') ||
                activeToolModal.task.name.toLowerCase().includes('repo')) && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">Assigned Repository</span>
                      <span className="font-mono font-bold text-slate-900">Yash-Jhanwar / demo</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-semibold text-[10px]">
                      {activeToolModal.credentials?.role || 'Write / Contributor'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">SSH & HTTPS Clone Command</span>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800">
                      <span>git clone {activeToolModal.credentials?.sshConfig || 'https://github.com/Yash-Jhanwar/demo.git'}</span>
                      <button
                        onClick={() => handleCopy(activeToolModal.credentials?.sshConfig || 'git clone https://github.com/Yash-Jhanwar/demo.git', 'git')}
                        className="p-1 text-slate-500 hover:text-blue-600 cursor-pointer"
                      >
                        {copiedKey === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Jira Software */}
              {(activeToolModal.credentials?.toolType === 'JIRA_SOFTWARE' ||
                activeToolModal.task.adapterType === 'JIRA' ||
                activeToolModal.task.name.toLowerCase().includes('jira')) && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">Sprint Board</span>
                      <span className="font-mono font-bold text-blue-700">{activeToolModal.credentials?.projectKey || 'PAYM-SPRINT-2026'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                      Sprint Active
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Assigned Starter Tickets:</span>
                    {(activeToolModal.credentials?.assignedTickets || [
                      'PAYM-101: Local Environment & Repositories Setup',
                      'PAYM-102: Review Architecture & Team Playbook'
                    ]).map((t: string) => (
                      <div key={t} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] font-medium text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. AWS Cloud IAM */}
              {(activeToolModal.credentials?.toolType === 'AWS_IAM' ||
                activeToolModal.task.adapterType === 'AWS' ||
                activeToolModal.task.name.toLowerCase().includes('aws') ||
                activeToolModal.task.name.toLowerCase().includes('cloud')) && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">IAM User</span>
                      <span className="font-mono font-bold text-amber-800">{activeToolModal.credentials?.iamUser || `${employee?.name?.toLowerCase().replace(/\s+/g, '.')}-staging`}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Staging Account
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">Assume Role ARN</span>
                    <div className="p-2.5 bg-white rounded-xl border font-mono text-[11px] text-slate-700 truncate">
                      {activeToolModal.credentials?.assumedRole || `arn:aws:iam::123456789012:role/${(employee?.roleTitle || 'Developer').replace(/\s+/g, '')}DevRole`}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Figma */}
              {(activeToolModal.credentials?.toolType === 'FIGMA' ||
                activeToolModal.task.name.toLowerCase().includes('figma')) && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">Design Team</span>
                      <span className="font-bold text-purple-700">{activeToolModal.credentials?.team || 'Design Systems & Product UI'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                      {activeToolModal.credentials?.seatType || 'Full Design Editor'}
                    </span>
                  </div>
                </div>
              )}

              {/* 7. Handbook / Training / Compliance / Internal Docs */}
              {(activeToolModal.credentials?.toolType === 'HANDBOOK' ||
                activeToolModal.task.category === 'Training' ||
                activeToolModal.task.name.toLowerCase().includes('playbook') ||
                activeToolModal.task.name.toLowerCase().includes('training') ||
                activeToolModal.task.name.toLowerCase().includes('compliance') ||
                (!['GOOGLE_WORKSPACE', 'SLACK_ENTERPRISE', 'GITHUB_ENTERPRISE', 'JIRA_SOFTWARE', 'AWS_IAM', 'FIGMA'].includes(activeToolModal.credentials?.toolType) &&
                 !activeToolModal.task.name.toLowerCase().includes('google') &&
                 !activeToolModal.task.name.toLowerCase().includes('slack') &&
                 !activeToolModal.task.name.toLowerCase().includes('github') &&
                 !activeToolModal.task.name.toLowerCase().includes('jira') &&
                 !activeToolModal.task.name.toLowerCase().includes('aws') &&
                 !activeToolModal.task.name.toLowerCase().includes('figma'))) && (
                <div className="space-y-2.5">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">Curated Resource</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                        Verified & Active
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs">
                      {activeToolModal.credentials?.title || activeToolModal.task.name}
                    </p>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Assigned to <strong>{employee?.name}</strong> ({employee?.roleTitle} • {employee?.departmentName}). Includes role-specific architectural guidelines, security policies, and standard operating procedures.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <Link
                      to="/knowledge"
                      onClick={() => setActiveToolModal(null)}
                      className="p-2.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium">Company Knowledge</span>
                    </Link>
                    <Link
                      to="/me/schedule"
                      onClick={() => setActiveToolModal(null)}
                      className="p-2.5 bg-white border border-slate-200 hover:border-blue-300 rounded-xl flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">First Week Plan</span>
                    </Link>
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

              {/* Specific Action Buttons for each tool */}
              {(activeToolModal.credentials?.toolType === 'GOOGLE_WORKSPACE' ||
                activeToolModal.task.name.toLowerCase().includes('google') ||
                activeToolModal.task.name.toLowerCase().includes('mail')) ? (
                <a
                  href={activeToolModal.credentials?.webmailUrl || 'https://mail.google.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="sm" leftIcon={<Mail className="w-3.5 h-3.5" />} rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Google Mailbox
                  </Button>
                </a>
              ) : (activeToolModal.credentials?.toolType === 'SLACK_ENTERPRISE' ||
                   activeToolModal.task.name.toLowerCase().includes('slack')) ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSlackJoinedView(!slackJoinedView)}
                  >
                    {slackJoinedView ? 'Hide Preview' : 'Show Chat Preview'}
                  </Button>
                  <a
                    href={
                      activeToolModal.credentials?.slackInviteUrl ||
                      'https://join.slack.com/t/onboard-kz86900/shared_invite/zt-47ltqdl6a-ttlM~yySzcGSegvWDztm0A'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary" size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />} rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                      🚀 Join Real Slack Workspace
                    </Button>
                  </a>
                </div>
              ) : (activeToolModal.credentials?.toolType === 'GITHUB_ENTERPRISE' ||
                   activeToolModal.task.name.toLowerCase().includes('github') ||
                   activeToolModal.task.name.toLowerCase().includes('repo')) ? (
                <a
                  href={activeToolModal.credentials?.repoUrl || 'https://github.com/Yash-Jhanwar/demo'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="sm" leftIcon={<FolderGit2 className="w-3.5 h-3.5" />} rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open GitHub Repository
                  </Button>
                </a>
              ) : (activeToolModal.credentials?.toolType === 'JIRA_SOFTWARE' ||
                   activeToolModal.task.name.toLowerCase().includes('jira')) ? (
                <a
                  href={activeToolModal.credentials?.sprintBoardUrl || 'https://onboardos.atlassian.net'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="sm" leftIcon={<Trello className="w-3.5 h-3.5" />} rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Jira Project Board
                  </Button>
                </a>
              ) : (activeToolModal.credentials?.toolType === 'AWS_IAM' ||
                   activeToolModal.task.name.toLowerCase().includes('aws') ||
                   activeToolModal.task.name.toLowerCase().includes('cloud')) ? (
                <a
                  href={activeToolModal.credentials?.consoleUrl || 'https://signin.aws.amazon.com/console'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="sm" leftIcon={<Cloud className="w-3.5 h-3.5" />} rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open AWS Console
                  </Button>
                </a>
              ) : (activeToolModal.credentials?.toolType === 'FIGMA' ||
                   activeToolModal.task.name.toLowerCase().includes('figma')) ? (
                <a
                  href={activeToolModal.credentials?.workspaceUrl || 'https://www.figma.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="sm" leftIcon={<Figma className="w-3.5 h-3.5" />} rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Figma Workspace
                  </Button>
                </a>
              ) : (
                <Link
                  to="/knowledge"
                  onClick={() => setActiveToolModal(null)}
                >
                  <Button variant="primary" size="sm" leftIcon={<BookOpen className="w-3.5 h-3.5" />} rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Knowledge Portal
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTasksPage;
