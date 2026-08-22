import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { client } from '../../services';
import {
  RotateCcw,
  AlertTriangle,
  Users,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function DemoControlPage() {
  const { currentUser, switchRole } = useAuth();
  const navigate = useNavigate();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      await client.resetDemoState();
      setActionMessage('Demo state restored to clean canonical seed state.');
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInjectJiraFailure = async () => {
    setLoading(true);
    try {
      await client.injectJiraFailure('emp-rahul');
      setActionMessage('Injected Jira HTTP 503 Rate Limit failure for Rahul Sharma.');
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const personas = [
    { role: 'HR' as const, name: 'Sarah Chen', title: 'People Operations Lead', target: '/hr' },
    { role: 'MANAGER' as const, name: 'Marcus Vance', title: 'Engineering Director', target: '/manager' },
    { role: 'EMPLOYEE' as const, name: 'Rahul Sharma', title: 'Junior Backend Developer', target: '/employee' },
    { role: 'IT' as const, name: 'David Kim', title: 'IT Systems Administrator', target: '/it' },
    { role: 'ADMIN' as const, name: 'Elena Rostova', title: 'Compliance & Security Architect', target: '/admin/policies' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left pb-12">
      <PageHeader
        title="Interactive Demo Lab & Scenario Controller"
        description="Jump between role perspectives, inject scripted external API failures, test approval gating, and reset mock state for live evaluation."
        badge={<Badge variant="purple" dot>Demo Scripting Active</Badge>}
      />

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{actionMessage}</span>
        </div>
      )}

      {/* Persona Quick Switcher Grid */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Persona Quick Switcher (Instant Impersonation)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch your active authenticated session to evaluate role-specific navigation, permissions, and dashboards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {personas.map((p) => {
            const isActive = currentUser.role === p.role;

            return (
              <div
                key={p.role}
                onClick={() => {
                  switchRole(p.role);
                  navigate(p.target);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} size="md" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{p.name}</span>
                      {isActive && (
                        <Badge variant="default" size="sm">
                          Active
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 block">{p.title}</span>
                    <span className="text-[10px] font-mono font-bold text-blue-700">{p.role} Mode</span>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Scripted Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Scenario 1: Jira Incident Injection */}
        <div className="p-6 bg-white border border-rose-200 rounded-3xl shadow-card space-y-3.5">
          <div className="flex items-center justify-between border-b border-rose-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 font-mono flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Scenario A: Scripted API Failure
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Simulates a live Jira rate limit error (HTTP 503) for Rahul Sharma. Tests automated failure isolation, downstream task blocking, Exception Center alerts, and idempotent retry.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              isLoading={loading}
              onClick={handleInjectJiraFailure}
              leftIcon={<Zap className="w-3.5 h-3.5" />}
              className="rounded-xl text-xs"
            >
              Inject Jira 503 Error
            </Button>
            <Link to="/employees/emp-rahul/provisioning">
              <Button size="sm" variant="secondary" className="rounded-xl text-xs">
                View Provisioning
              </Button>
            </Link>
          </div>
        </div>

        {/* Scenario 2: Canonical Reset */}
        <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-emerald-600" />
              Scenario B: Store State Reset
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Restores all in-memory mock records, canonical employees (Rahul, Priya, Aman), policy rules (v1.0.0), and approval queues to initial demo state.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              isLoading={loading}
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="rounded-xl text-xs"
            >
              Reset Mock Data Store
            </Button>
            <Link to="/employees/emp-rahul">
              <Button size="sm" variant="primary" className="rounded-xl text-xs">
                Command Center
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ⚡ Live ViaSocket & Gemini Automation Controls & Evidence Panel */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Live ViaSocket Webhook & Gemini Copilot Dispatch Controls
              </h3>
              <p className="text-xs text-slate-500">
                Trigger real webhook dispatches with idempotency and verify grounded AI explanations. (Server-Only Secrets Protected)
              </p>
            </div>
          </div>
          <Badge variant="purple" size="sm">
            Live Webhooks Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={async () => {
              setLoading(true);
              try {
                const res = await client.testViaSocketNewEmployee('emp-rahul');
                setActionMessage(`ViaSocket 'employee.created' dispatched successfully to Slack & Google Sheets!`);
                setTimeout(() => setActionMessage(null), 4000);
              } catch (e: any) {
                setActionMessage(`Dispatched: ${e.message}`);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="p-3.5 rounded-2xl bg-blue-50/70 hover:bg-blue-50 border border-blue-200 text-left transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-blue-900 font-mono">1. employee.created</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">POST</span>
            </div>
            <p className="text-[11px] text-blue-700">
              Dispatches new hire joiner card to Slack #general and appends row to Sheet1.
            </p>
          </button>

          <button
            onClick={async () => {
              setLoading(true);
              try {
                await client.testViaSocketEvent('approval.requested', 'emp-rahul');
                setActionMessage(`ViaSocket 'approval.requested' dispatched to Manager Slack!`);
                setTimeout(() => setActionMessage(null), 4000);
              } catch (e: any) {
                setActionMessage(`Dispatched: ${e.message}`);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="p-3.5 rounded-2xl bg-amber-50/70 hover:bg-amber-50 border border-amber-200 text-left transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-900 font-mono">2. approval.requested</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">POST</span>
            </div>
            <p className="text-[11px] text-amber-700">
              Dispatches 1-click cloud access signoff alert to Manager Marcus Vance.
            </p>
          </button>

          <button
            onClick={async () => {
              setLoading(true);
              try {
                await client.testViaSocketEvent('task.failed', 'emp-rahul');
                setActionMessage(`ViaSocket 'task.failed' P1 incident alert dispatched to #it-support-alerts!`);
                setTimeout(() => setActionMessage(null), 4000);
              } catch (e: any) {
                setActionMessage(`Dispatched: ${e.message}`);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="p-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-50 border border-rose-200 text-left transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-rose-900 font-mono">3. task.failed</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">POST</span>
            </div>
            <p className="text-[11px] text-rose-700">
              Dispatches P1 IT incident alert for Jira HTTP 503 rate limit.
            </p>
          </button>

          <button
            onClick={async () => {
              setLoading(true);
              try {
                await client.testViaSocketEvent('task.retry_succeeded', 'emp-rahul');
                setActionMessage(`ViaSocket 'task.retry_succeeded' recovery alert dispatched!`);
                setTimeout(() => setActionMessage(null), 4000);
              } catch (e: any) {
                setActionMessage(`Dispatched: ${e.message}`);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200 text-left transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-emerald-900 font-mono">4. task.retry_succeeded</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">POST</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Dispatches self-healing recovery alert and unblocks downstream tasks.
            </p>
          </button>

          <button
            onClick={async () => {
              setLoading(true);
              try {
                await client.testViaSocketEvent('onboarding.day_one_ready', 'emp-rahul');
                setActionMessage(`ViaSocket 'onboarding.day_one_ready' celebration dispatch triggered!`);
                setTimeout(() => setActionMessage(null), 4000);
              } catch (e: any) {
                setActionMessage(`Dispatched: ${e.message}`);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="p-3.5 rounded-2xl bg-purple-50/70 hover:bg-purple-50 border border-purple-200 text-left transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-purple-900 font-mono">5. onboarding.day_one_ready</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">POST</span>
            </div>
            <p className="text-[11px] text-purple-700">
              Dispatches 100% Day-1 readiness milestone celebration alert.
            </p>
          </button>

          <Link to="/me/assistant">
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-200 text-left transition-all space-y-1 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-900 font-mono">6. Gemini Copilot</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">AI</span>
                </div>
                <p className="text-[11px] text-indigo-700 mt-1">
                  Ask grounded "Why?" questions to Gemini Flash Copilot with live citations.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 mt-2">
                Open AI Assistant →
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* 🏆 Hackathon Winning Demo Sequence Guide */}
      <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border border-indigo-700/50 rounded-3xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-700/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-900 font-extrabold flex items-center justify-center shadow-md">
              🏆
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Hackathon Winning Demo Sequence (90 Seconds)
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Best Use of Data & AI
                </span>
              </h3>
              <p className="text-xs text-indigo-200">
                Follow this 8-step live sequence to demonstrate deterministic policies, DAG unblocking, live cross-role sync, and ViaSocket webhooks.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-[10px]">1</span>
                <span className="font-bold text-white text-xs">HR Creates Employee Profile & Generates Plan</span>
              </div>
              <p className="text-indigo-200 text-[11px] pl-7">
                <span className="text-amber-300 font-semibold">Narrate:</span> "HR enters joiner info; OnboardOS executes deterministic policy rules, creates provisioning DAG, and dispatches real ViaSocket webhook to Slack & Google Sheets."
              </p>
            </div>
            <Link to="/hr/employees/new" className="self-end md:self-center pl-7 md:pl-0">
              <button className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-xs">
                <span>Go to HR New Hire</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">2</span>
                <span className="font-bold text-white text-xs">Manager Marcus Vance Approves AWS Cloud IAM</span>
              </div>
              <p className="text-indigo-200 text-[11px] pl-7">
                <span className="text-amber-300 font-semibold">Narrate:</span> "Manager approves gated high-privilege access in 1 click. Cross-tab domain event bus immediately notifies employee screen without page reload!"
              </p>
            </div>
            <Link to="/manager/approvals" className="self-end md:self-center pl-7 md:pl-0">
              <button className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors shadow-xs">
                <span>Manager Approvals</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-[10px]">3</span>
                <span className="font-bold text-white text-xs">Ask Copilot "Why?" Grounded Decision Intelligence</span>
              </div>
              <p className="text-indigo-200 text-[11px] pl-7">
                <span className="text-amber-300 font-semibold">Narrate:</span> "Rahul asks 'Why does AWS need approval?' Copilot cites live SOC-2 policy POL-CLOUD-01 and manager SLA instead of static hallucinated text."
              </p>
            </div>
            <Link to="/me/assistant" className="self-end md:self-center pl-7 md:pl-0">
              <button className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-xs">
                <span>Ask AI Copilot</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-[10px]">4</span>
                <span className="font-bold text-white text-xs">Inject Jira API 503 Rate Limit Failure</span>
              </div>
              <p className="text-indigo-200 text-[11px] pl-7">
                <span className="text-amber-300 font-semibold">Narrate:</span> "External SaaS fails; DAG isolates the failure and pauses Payments Sprint Backlog while leaving unaffected tools ready."
              </p>
            </div>
            <button
              onClick={handleInjectJiraFailure}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-xs self-end md:self-center pl-7 md:pl-0"
            >
              <Zap className="w-3 h-3" />
              <span>Inject Jira 503</span>
            </button>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">5</span>
                <span className="font-bold text-white text-xs">1-Click IT Retry & Autonomous DAG Unblocking</span>
              </div>
              <p className="text-indigo-200 text-[11px] pl-7">
                <span className="text-amber-300 font-semibold">Narrate:</span> "IT clicks Retry; Jira succeeds, Payments Backlog auto-unblocks, readiness climbs to 90%, and recovery event broadcasts live across roles!"
              </p>
            </div>
            <Link to="/hr/exceptions" className="self-end md:self-center pl-7 md:pl-0">
              <button className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-xs">
                <span>Exception Center</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Showcase Directory Map */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
          Direct Screen Navigation Index (Full Scope)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <Link to="/hr" className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-center">
            HR Dashboard
          </Link>
          <Link to="/employees/emp-rahul" className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-center">
            Command Center
          </Link>
          <Link to="/employees/emp-rahul/plan" className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-center">
            AI Plan Detail
          </Link>
          <Link to="/employees/emp-rahul/access" className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-center">
            Access Graph
          </Link>
          <Link to="/employees/emp-rahul/provisioning" className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-center">
            Live Provisioning
          </Link>
          <Link to="/employees/emp-rahul/whatif" className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-center">
            What-If Sandbox
          </Link>
          <Link to="/manager/approvals" className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-center">
            Approval Queue
          </Link>
          <Link to="/hr/exceptions" className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-center">
            Exception Center
          </Link>
        </div>
      </div>
    </div>
  );
}

