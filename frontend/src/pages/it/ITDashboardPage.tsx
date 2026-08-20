import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Server, Ticket, Laptop, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ITDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="IT Systems & Infrastructure Operations"
        description="Monitor automated provisioning adapter health, hardware asset logistics, triage queues, and access revokation compliance."
        badge={<Badge variant="default" dot>All Adapters Connected</Badge>}
      />

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/80 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Adapter Integrations</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-2">5</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Google, GitHub, Slack, Jira, AWS</span>
        </Card>

        <Card className="p-4 bg-slate-900/80 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Open Helpdesk Tickets</span>
            <Ticket className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono mt-2">2</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Avg SLA: 4h response time</span>
        </Card>

        <Card className="p-4 bg-slate-900/80 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Hardware Assigned</span>
            <Laptop className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-2">2</div>
          <span className="text-[11px] text-slate-500 mt-1 block">MacBook Pro & Dell 4K</span>
        </Card>

        <Card className="p-4 bg-slate-900/80 border-rose-500/30">
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span>Offboarding Risk Flags</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-2">1</div>
          <span className="text-[11px] text-rose-300/80 mt-1 block">Residual GitHub Access</span>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-blue-400" />
            Support Ticket Queue
          </h4>
          <p className="text-xs text-slate-400">
            Triage workplace helpdesk requests with automated AI category and priority tagging.
          </p>
          <Link to="/it/tickets" className="block pt-1">
            <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Queue
            </Button>
          </Link>
        </Card>

        <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Laptop className="w-4 h-4 text-emerald-400" />
            Hardware Logistics
          </h4>
          <p className="text-xs text-slate-400">
            Track serial numbers, laptop provisioning, monitor assignments, and YubiKeys.
          </p>
          <Link to="/it/assets" className="block pt-1">
            <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Asset Tracker
            </Button>
          </Link>
        </Card>

        <Card className="p-5 bg-slate-900/80 border-rose-500/30 space-y-3">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Access Drift & Security
          </h4>
          <p className="text-xs text-slate-400">
            Identify residual access on departed accounts and revoke stale OAuth grants.
          </p>
          <Link to="/it/offboarding-risks" className="block pt-1">
            <Button size="sm" variant="destructive" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Review Risks (1)
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
