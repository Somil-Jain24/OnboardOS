import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { client } from '../../services';
import {
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Play,
  Users,
  Shield,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Layers,
  Server,
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Interactive Demo Lab & Scenario Controller (PRD §8.6)"
        description="Jump between role perspectives, inject scripted external API failures, test approval gating, and reset mock state for live hackathon evaluation."
        badge={<Badge variant="purple" dot>Demo Scripting Active</Badge>}
      />

      {actionMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Persona Quick Switcher Grid */}
      <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Persona Quick Switcher (Instant Impersonation)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
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
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-blue-950/30 border-blue-500/60 shadow-sm shadow-blue-500/10'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} size="md" status={isActive ? 'online' : 'offline'} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-100">{p.name}</span>
                      {isActive && (
                        <Badge variant="info" size="sm">
                          Active
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block">{p.title}</span>
                    <span className="text-[10px] font-mono text-purple-300">{p.role} Mode</span>
                  </div>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Scripted Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Scenario 1: Jira Incident Injection */}
        <Card className="p-5 bg-slate-900/90 border-rose-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Scenario A: Scripted API Failure
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Simulates a live Jira rate limit error (HTTP 503) for Rahul Sharma. Tests automated failure isolation, downstream task blocking, Exception Center alerts, and idempotent retry.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              isLoading={loading}
              onClick={handleInjectJiraFailure}
              leftIcon={<Zap className="w-3.5 h-3.5" />}
            >
              Inject Jira 503 Error
            </Button>
            <Link to="/employees/emp-rahul/provisioning">
              <Button size="sm" variant="outline">
                View Provisioning
              </Button>
            </Link>
          </div>
        </Card>

        {/* Scenario 2: Canonical Reset */}
        <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              Scenario B: Store State Reset
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Restores all in-memory mock records, canonical employees (Rahul, Priya, Aman), policy rules (v1.0.0), and approval queues to initial demo state.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              isLoading={loading}
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Mock Data Store
            </Button>
            <Link to="/employees/emp-rahul">
              <Button size="sm" variant="primary">
                Command Center
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Feature Showcase Directory Map */}
      <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Direct Screen Navigation Index (Full Scope)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <Link to="/hr" className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300">
            HR Dashboard
          </Link>
          <Link to="/employees/emp-rahul" className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300">
            Command Center
          </Link>
          <Link to="/employees/emp-rahul/plan" className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300">
            AI Plan Detail
          </Link>
          <Link to="/employees/emp-rahul/access" className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300">
            Access Graph
          </Link>
          <Link to="/employees/emp-rahul/provisioning" className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300">
            Live Provisioning
          </Link>
          <Link to="/employees/emp-rahul/whatif" className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300">
            What-If Sandbox
          </Link>
          <Link to="/manager/approvals" className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300">
            Approval Queue
          </Link>
          <Link to="/hr/exceptions" className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300">
            Exception Center
          </Link>
        </div>
      </Card>
    </div>
  );
}
