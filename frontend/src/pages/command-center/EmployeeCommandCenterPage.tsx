import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { WhyExplanationPanel } from '../../components/shared/WhyExplanationPanel';
import { useEmployee } from '../../hooks/useOnboardOS';
import { client } from '../../services';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  FileText,
  Network,
  PlayCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Server,
  Loader2,
  Briefcase,
  UserX,
  RotateCcw,
  CheckSquare,
  Shield,
  Calendar,
  Lock,
  Mail,
  MessageSquare,
  UserCheck,
  HeartHandshake,
  Check,
  Sparkles,
} from 'lucide-react';
import type { PlanItem, Task } from '../../types';

// Custom Flow Node Component
function CustomAccessNode({ data }: NodeProps) {
  const nodeData = data as {
    label: string;
    sublabel?: string;
    type: 'role' | 'dept' | 'team' | 'app' | 'approval';
    status: 'granted' | 'running' | 'failed' | 'blocked' | 'waiting';
    icon?: React.ReactNode;
  };

  const getStatusStyles = () => {
    switch (nodeData.status) {
      case 'granted':
        return 'border-emerald-200 bg-white shadow-card text-emerald-700 hover:border-emerald-400';
      case 'running':
        return 'border-blue-200 bg-white shadow-card text-blue-700 hover:border-blue-400';
      case 'failed':
        return 'border-rose-300 bg-rose-50/50 shadow-card text-rose-800 animate-pulse';
      case 'blocked':
        return 'border-slate-200 bg-slate-50 text-slate-500 opacity-80';
      case 'waiting':
        return 'border-amber-300 bg-amber-50/50 shadow-card text-amber-800';
      default:
        return 'border-slate-200 bg-white shadow-card text-slate-900';
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-2xl border min-w-[190px] max-w-[230px] transition-all cursor-pointer ${getStatusStyles()}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-600 !w-2.5 !h-2.5 !border-2 !border-white" />
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex-shrink-0">{nodeData.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold truncate text-slate-900">{nodeData.label}</div>
          {nodeData.sublabel && (
            <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
              {nodeData.sublabel}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-600 !w-2.5 !h-2.5 !border-2 !border-white" />
    </div>
  );
}

const nodeTypes = {
  custom: CustomAccessNode,
};

export function EmployeeCommandCenterPage() {
  const { id = 'emp-rahul' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'overview';

  const { employee, plan, tasks, risk, loading, retryTask, refetch } = useEmployee(id);
  const [activeTab, setActiveTab] = useState<'overview' | 'access' | 'tasks' | 'activity'>(
    (activeTabParam as any) || 'overview'
  );

  // Retry & Action state
  const [retrying, setRetrying] = useState(false);
  const [retrySuccess, setRetrySuccess] = useState(false);
  const [selectedPlanItemForWhy, setSelectedPlanItemForWhy] = useState<PlanItem | null>(null);

  // Manual Override / Offboarding state
  const [offboarded, setOffboarded] = useState(false);
  const [offboardingLoading, setOffboardingLoading] = useState(false);

  // Task Filter tab inside Tasks
  const [activeDayFilter, setActiveDayFilter] = useState<'TODAY' | 'DAY 1' | 'DAY 2' | 'DAY 3' | 'DAY 4' | 'DAY 5'>('TODAY');

  const handleTabChange = (tab: 'overview' | 'access' | 'tasks' | 'activity') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleRetryJira = async () => {
    setRetrying(true);
    try {
      await retryTask('task-rahul-jira');
      setRetrySuccess(true);
      setTimeout(() => setRetrySuccess(false), 4000);
      refetch();
    } finally {
      setRetrying(false);
    }
  };

  const handleInjectFailure = async () => {
    await client.injectJiraFailure(id);
    refetch();
  };

  const handleTriggerOffboarding = async () => {
    setOffboardingLoading(true);
    try {
      await client.createOffboardingPlan(id);
      setOffboarded(true);
      refetch();
    } finally {
      setOffboardingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-xs font-medium">Loading Command Center...</span>
      </div>
    );
  }

  // Real-time calculation of Day-1 readiness based on completed tasks
  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalTasksCount = tasks.length || 6;
  const isJiraFailed = tasks.find((t) => t.id === 'task-rahul-jira' || t.adapterType === 'JIRA')?.status === 'FAILED';
  const isAwsPending = tasks.find((t) => t.id === 'task-rahul-aws' || t.adapterType === 'AWS')?.status === 'WAITING_APPROVAL';

  const calculatedReadiness = Math.round((completedTasksCount / totalTasksCount) * 100);
  const readinessScore = calculatedReadiness || (risk?.readinessScore ?? 65);
  const riskScore = isJiraFailed || isAwsPending ? 75 : 15;
  const isBlocked = isJiraFailed || tasks.some((t) => t.status === 'FAILED' || t.status === 'BLOCKED');

  const systems = [
    { name: 'Google Workspace', status: 'COMPLETED', detail: 'Mailbox & 2FA Active', adapter: 'GOOGLE' },
    { name: 'GitHub Enterprise', status: 'COMPLETED', detail: 'payments-backend Repo Access', adapter: 'GITHUB' },
    { name: 'Slack Workplace', status: 'COMPLETED', detail: '#engineering, #payments', adapter: 'SLACK' },
    {
      name: 'Jira Software Backlog',
      status: isJiraFailed ? 'FAILED' : 'COMPLETED',
      detail: isJiraFailed ? 'HTTP 503 Rate Limit Error' : 'Payments Sprint Board Active',
      adapter: 'JIRA',
    },
    {
      name: 'AWS Production IAM',
      status: isAwsPending ? 'WAITING_APPROVAL' : 'COMPLETED',
      detail: isAwsPending ? 'Approval Required by Marcus Vance' : 'IAM Role Assigned',
      adapter: 'AWS',
    },
  ];

  // DAG Nodes & Edges
  const dagNodes = [
    {
      id: 'node-role',
      type: 'custom',
      position: { x: 340, y: 10 },
      data: {
        label: employee?.roleTitle || 'Backend Engineer',
        sublabel: `${employee?.departmentName} • ${employee?.seniority}`,
        type: 'role',
        status: 'granted',
        icon: <Briefcase className="w-4 h-4 text-blue-600" />,
      },
    },
    {
      id: 'node-google',
      type: 'custom',
      position: { x: 120, y: 110 },
      data: {
        label: 'Google Workspace',
        sublabel: 'Mailbox & SSO Identity',
        type: 'app',
        status: 'granted',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      },
    },
    {
      id: 'node-slack',
      type: 'custom',
      position: { x: 120, y: 210 },
      data: {
        label: 'Slack Workplace',
        sublabel: '#engineering, #payments',
        type: 'app',
        status: 'granted',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      },
    },
    {
      id: 'node-github',
      type: 'custom',
      position: { x: 340, y: 110 },
      data: {
        label: 'GitHub Enterprise',
        sublabel: 'payments-backend (Write)',
        type: 'app',
        status: 'granted',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      },
    },
    {
      id: 'node-jira',
      type: 'custom',
      position: { x: 340, y: 210 },
      data: {
        label: 'Jira Software',
        sublabel: isJiraFailed ? 'HTTP 503 Rate Limit' : 'Payments Board Active',
        type: 'app',
        status: isJiraFailed ? 'failed' : 'granted',
        icon: isJiraFailed ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      },
    },
    {
      id: 'node-aws',
      type: 'custom',
      position: { x: 560, y: 110 },
      data: {
        label: 'AWS Production IAM',
        sublabel: isAwsPending ? 'Pending Manager Approval' : 'IAM Role Active',
        type: 'app',
        status: isAwsPending ? 'waiting' : 'granted',
        icon: isAwsPending ? <Clock className="w-4 h-4 text-amber-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      },
    },
  ];

  const dagEdges = [
    { id: 'e-role-google', source: 'node-role', target: 'node-google', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e-google-slack', source: 'node-google', target: 'node-slack', animated: true, style: { stroke: '#10b981' } },
    { id: 'e-role-github', source: 'node-role', target: 'node-github', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e-github-jira', source: 'node-github', target: 'node-jira', animated: isJiraFailed, style: { stroke: isJiraFailed ? '#f43f5e' : '#10b981' } },
    { id: 'e-role-aws', source: 'node-role', target: 'node-aws', animated: isAwsPending, style: { stroke: isAwsPending ? '#f59e0b' : '#10b981' } },
  ];

  // Daily Roadmap Items
  const dailyRoadmap = {
    TODAY: [
      { id: 't-1', title: 'Google Workspace Account Provisioning', category: 'Identity', status: 'COMPLETED' },
      { id: 't-2', title: 'Slack #engineering & #payments Channels', category: 'Communication', status: 'COMPLETED' },
      { id: 't-3', title: 'GitHub Enterprise payments-backend Membership', category: 'Development', status: 'COMPLETED' },
      { id: 't-4', title: 'Jira Software Payments Board Assignment', category: 'Project Management', status: isJiraFailed ? 'FAILED' : 'COMPLETED' },
      { id: 't-5', title: 'AWS Cloud Production IAM Role', category: 'Cloud Infrastructure', status: isAwsPending ? 'WAITING_APPROVAL' : 'COMPLETED' },
    ],
    'DAY 1': [
      { id: 'd1-1', title: 'Hardware Unboxing & MacBook Setup', category: 'Hardware', status: 'COMPLETED' },
      { id: 'd1-2', title: 'Configure Hardware YubiKey & Password Manager', category: 'Security', status: 'COMPLETED' },
      { id: 'd1-3', title: 'Welcome 1:1 with Marcus Vance (Manager)', category: 'Orientation', status: 'COMPLETED' },
    ],
    'DAY 2': [
      { id: 'd2-1', title: 'Payments Architecture Deep Dive with Kavita Rao (Mentor)', category: 'Training', status: 'PENDING' },
      { id: 'd2-2', title: 'Review Service SLA & Incident Management Runbook', category: 'Compliance', status: 'PENDING' },
    ],
    'DAY 3': [
      { id: 'd3-1', title: 'Clone Repository & Spin Up Local Docker Environment', category: 'Development', status: 'PENDING' },
      { id: 'd3-2', title: 'Pick Up and Solve "Good First Issue" on Payments Board', category: 'Development', status: 'PENDING' },
    ],
    'DAY 4': [
      { id: 'd4-1', title: 'Open First Pull Request & Trigger CI/CD Pipeline', category: 'Development', status: 'PENDING' },
      { id: 'd4-2', title: 'Peer Code Review with Team Member', category: 'Collaboration', status: 'PENDING' },
    ],
    'DAY 5': [
      { id: 'd5-1', title: 'First Week Retrospective with Marcus Vance', category: 'Review', status: 'PENDING' },
      { id: 'd5-2', title: 'Submit Anonymous Day-5 Sentiment Feedback', category: 'Pulse', status: 'PENDING' },
    ],
  };

  // Audit Events
  const auditEvents = [
    { id: 'ev-1', title: 'Employee Created & Context Normalized', actor: 'Sarah Chen (HR)', time: '2 hours ago', icon: <Briefcase className="w-4 h-4 text-blue-600" />, hash: 'a1f8c0e' },
    { id: 'ev-2', title: 'AI Onboarding Plan Generated (5 Plan Items)', actor: 'AI Decision Engine', time: '2 hours ago', icon: <Sparkles className="w-4 h-4 text-purple-600" />, hash: 'c9b4e11' },
    { id: 'ev-3', title: 'Google, Slack, and GitHub Provisioned', actor: 'Automated Adapters', time: '1 hour ago', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, hash: 'd84e209' },
    { id: 'ev-4', title: isJiraFailed ? 'Jira Adapter Returned HTTP 503 (Rate Limit)' : 'Jira Adapter Retried and Completed', actor: 'Integration Worker', time: '45 mins ago', icon: isJiraFailed ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />, hash: 'f50e7a2' },
    { id: 'ev-5', title: isAwsPending ? 'AWS IAM Access Request Dispatched to Marcus Vance' : 'AWS IAM Access Approved by Marcus Vance', actor: isAwsPending ? 'Policy Engine' : 'Marcus Vance (Manager)', time: '30 mins ago', icon: isAwsPending ? <Clock className="w-4 h-4 text-amber-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />, hash: 'e39a41b' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header Banner */}
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
                {offboarded ? (
                  <StatusBadge status="blocked" label="Access Revoked / Offboarded" size="sm" showIcon />
                ) : isBlocked ? (
                  <StatusBadge status="blocked" label="Provisioning Interrupted" size="sm" showIcon />
                ) : (
                  <StatusBadge status="completed" label="Day-1 Ready for Work" size="sm" showIcon />
                )}
              </div>
              <span className="text-xs font-normal text-slate-500 block mt-1">
                {employee?.roleTitle} • {employee?.departmentName} ({employee?.teamName}) • Seniority:{' '}
                <span className="font-mono text-slate-700 font-semibold">{employee?.seniority}</span> • Manager:{' '}
                <span className="text-slate-700 font-semibold">{employee?.managerName || 'Marcus Vance'}</span>
              </span>
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {isJiraFailed && (
              <Button
                size="sm"
                variant="destructive"
                isLoading={retrying}
                onClick={handleRetryJira}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Retry Failed Jira
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={handleInjectFailure}
              className="text-xs"
            >
              Simulate Failure
            </Button>
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

      {/* 2. Simplified 4-Tab Navigation Bar */}
      <div className="flex border-b border-slate-200 gap-1 bg-white px-3 pt-2 rounded-2xl shadow-xs">
        <button
          onClick={() => handleTabChange('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => handleTabChange('access')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'access'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Onboarding & Access</span>
          {isBlocked && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
        </button>

        <button
          onClick={() => handleTabChange('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks & Roadmap</span>
        </button>

        <button
          onClick={() => handleTabChange('activity')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Activity & Lifecycle</span>
        </button>
      </div>

      {/* 3. TAB CONTENT VIEWS */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top 3-Column Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Work Context */}
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
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Policy Ruleset</span>
                  <span className="font-mono text-blue-700 font-bold">Engineering Birthright v1.0</span>
                </div>
              </div>
            </div>

            {/* Real-time Readiness & Risk Dual Rings */}
            <div className="lg:col-span-4 flex flex-col justify-center items-center p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card">
              <div className="grid grid-cols-2 gap-6 w-full">
                <ScoreRing
                  score={readinessScore}
                  size="lg"
                  type="readiness"
                  label="Day-1 Readiness"
                  sublabel={`${completedTasksCount} of ${totalTasksCount} Ready`}
                />
                <ScoreRing
                  score={riskScore}
                  size="lg"
                  type="risk"
                  label="Day-1 Risk Index"
                  sublabel={isBlocked ? 'Critical Blocker' : 'Minimal Risk'}
                />
              </div>
            </div>

            {/* Systems Integration Status */}
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

              <div className="space-y-2 text-xs">
                {systems.map((sys) => {
                  const isDone = sys.status === 'COMPLETED';
                  const isFailed = sys.status === 'FAILED';

                  return (
                    <div
                      key={sys.name}
                      className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-slate-200/80"
                    >
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : isFailed ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-[11px]">{sys.name}</p>
                          <p className="text-[10px] text-slate-500">{sys.detail}</p>
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

          {/* Support Team (Manager, Mentor, Buddy, IT) */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Assigned Support Team</h3>
                <p className="text-xs text-slate-500">Dedicated onboarding contacts for mentorship and technical support.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Manager */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name="Marcus Vance" size="md" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Marcus Vance</h4>
                    <p className="text-[11px] text-slate-500">Engineering Manager</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Reporting Manager</span>
                  <a href="mailto:marcus.vance@onboardos.internal" className="text-blue-600 hover:text-blue-800">
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Mentor */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name="Kavita Rao" size="md" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Kavita Rao</h4>
                    <p className="text-[11px] text-slate-500">Senior Staff Engineer</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Technical Mentor</span>
                  <a href="mailto:kavita.rao@onboardos.internal" className="text-blue-600 hover:text-blue-800">
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Buddy */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name="Alex Rivera" size="md" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Alex Rivera</h4>
                    <p className="text-[11px] text-slate-500">Product Designer</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Onboarding Buddy</span>
                  <a href="mailto:alex.rivera@onboardos.internal" className="text-blue-600 hover:text-blue-800">
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* IT Support */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name="David Kim" size="md" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">David Kim</h4>
                    <p className="text-[11px] text-slate-500">IT Operations Lead</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">IT & Hardware</span>
                  <Link to="/me/help" className="text-blue-600 hover:text-blue-800">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ONBOARDING & ACCESS (MERGED AI PLAN + DAG + PROVISIONING LEDGER) */}
      {activeTab === 'access' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* AI Reasoning Rationale Panel */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Onboarding Plan & Policy Rationale</h3>
                  <p className="text-xs text-slate-500">Deterministic birthright evaluation based on role, department, and security rulesets.</p>
                </div>
              </div>
              <Badge variant="default">Policy v1.0 Active</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {plan?.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPlanItemForWhy(item)}
                  className="p-3.5 rounded-2xl border border-slate-200/90 hover:border-blue-300 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">{item.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                        item.finalDecision === 'REQUIRED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.finalDecision === 'APPROVAL_REQUIRED'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.finalDecision}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{item.aiRationale}</p>
                  <div className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 pt-1">
                    <span>View Policy Explanation</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive DAG Graph */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Provisioning Dependency Graph (DAG)</h3>
                  <p className="text-xs text-slate-500">Live acyclic execution graph with topological ordering.</p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-500">Cycle Prevention: Active (PL/pgSQL Trigger)</span>
            </div>

            <div className="h-[320px] w-full rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/50">
              <ReactFlow
                nodes={dagNodes}
                edges={dagEdges}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
              >
                <Background color="#cbd5e1" gap={16} size={1} />
                <Controls />
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
              </ReactFlow>
            </div>
          </div>

          {/* Provisioning Ledger & Action Table */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                  <PlayCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Provisioning Ledger & Execution Status</h3>
                  <p className="text-xs text-slate-500">Idempotent adapter executions and live error reporting.</p>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-12 bg-slate-50 p-3 font-mono font-bold text-slate-600">
                <span className="col-span-3">System / Task</span>
                <span className="col-span-2">Adapter</span>
                <span className="col-span-3">Idempotency Key</span>
                <span className="col-span-2">Status</span>
                <span className="col-span-2 text-right">Actions</span>
              </div>

              {systems.map((sys) => {
                const isFailed = sys.status === 'FAILED';
                const isWaiting = sys.status === 'WAITING_APPROVAL';

                return (
                  <div key={sys.name} className={`grid grid-cols-12 p-3 items-center ${isFailed ? 'bg-rose-50/40' : ''}`}>
                    <div className="col-span-3">
                      <span className="font-bold text-slate-900">{sys.name}</span>
                      <p className="text-[10px] text-slate-500">{sys.detail}</p>
                    </div>
                    <span className="col-span-2 font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded w-fit text-[11px]">
                      {sys.adapter}
                    </span>
                    <span className="col-span-3 font-mono text-[11px] text-slate-500 truncate">
                      {`idemp-${id}-${sys.adapter.toLowerCase()}-v1`}
                    </span>
                    <span className="col-span-2">
                      <StatusBadge
                        status={sys.status === 'COMPLETED' ? 'completed' : isFailed ? 'failed' : 'pending'}
                        label={sys.status}
                        size="sm"
                      />
                    </span>
                    <div className="col-span-2 text-right">
                      {isFailed ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          isLoading={retrying}
                          onClick={handleRetryJira}
                          className="text-xs h-7 px-2.5 rounded-lg"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" /> Retry
                        </Button>
                      ) : isWaiting ? (
                        <Link to="/manager/approvals">
                          <Button size="sm" variant="secondary" className="text-xs h-7 px-2.5 rounded-lg">
                            Review
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-600 font-semibold">✓ Verified</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TASKS & ROADMAP (MERGED ONBOARDING TASKS + 5-DAY ROADMAP) */}
      {activeTab === 'tasks' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Day Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['TODAY', 'DAY 1', 'DAY 2', 'DAY 3', 'DAY 4', 'DAY 5'] as const).map((day) => (
              <button
                key={day}
                onClick={() => setActiveDayFilter(day)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  activeDayFilter === day
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Actionable Checklist */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activeDayFilter} Roadmap & Action Items</h3>
                  <p className="text-xs text-slate-500">Structured tasks and milestone syncs for this phase.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {dailyRoadmap[activeDayFilter].map((item) => {
                const isDone = item.status === 'COMPLETED';
                const isFailed = item.status === 'FAILED';
                const isWaiting = item.status === 'WAITING_APPROVAL';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isDone
                        ? 'border-slate-200 bg-white'
                        : isFailed
                        ? 'border-rose-200 bg-rose-50/30'
                        : isWaiting
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : isFailed ? (
                        <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div>
                        <span className={`font-semibold ${isDone ? 'line-through text-slate-500' : 'text-slate-900 font-bold'}`}>
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>Category: <strong className="text-slate-600">{item.category}</strong></span>
                        </div>
                      </div>
                    </div>

                    <StatusBadge
                      status={isDone ? 'completed' : isFailed ? 'failed' : 'pending'}
                      label={item.status}
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITY & LIFECYCLE (MERGED AUDIT TIMELINE + BASIC OFFBOARDING) */}
      {activeTab === 'activity' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Audit Timeline Stream */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cryptographic Audit Timeline</h3>
                  <p className="text-xs text-slate-500">Append-only chronological audit log with SHA-256 evidence hashes.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {auditEvents.map((ev, idx) => (
                <div key={ev.id} className="flex items-start gap-3.5 relative">
                  {idx < auditEvents.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200 -mb-4" />
                  )}
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 z-10">
                    {ev.icon}
                  </div>
                  <div className="flex-1 min-w-0 p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ev.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{ev.time}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Actor: <strong className="text-slate-700">{ev.actor}</strong></span>
                      <span className="font-mono text-[10px] text-slate-400">hash: {ev.hash}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Lifecycle & Offboarding Control Card */}
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                  <UserX className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Employee Lifecycle & Offboarding Controls</h3>
                  <p className="text-xs text-slate-500">Trigger zero-trust deprovisioning when employee departs the organization.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-rose-950">Immediate Access Revocation & Asset Recovery</h4>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Revokes all active SaaS tokens, disables Google/GitHub/Slack logins, and marks hardware for return.
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                disabled={offboarded}
                isLoading={offboardingLoading}
                onClick={handleTriggerOffboarding}
                className="text-xs whitespace-nowrap"
              >
                {offboarded ? 'Offboarding Executed' : 'Execute Offboarding'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Why Explanation Panel Drawer/Modal */}
      {selectedPlanItemForWhy && (
        <WhyExplanationPanel
          isOpen={!!selectedPlanItemForWhy}
          onClose={() => setSelectedPlanItemForWhy(null)}
          item={selectedPlanItemForWhy}
          employee={employee}
        />
      )}
    </div>
  );
}
