import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import { Server, Ticket, Laptop, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Ticket as TicketType, Asset, OffboardingRiskFlag } from '../../types';

export function ITDashboardPage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [risks, setRisks] = useState<OffboardingRiskFlag[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [ticketsData, assetsData, risksData] = await Promise.all([
          client.getTickets(),
          client.getAssets(),
          client.getOffboardingRisks(),
        ]);
        setTickets(ticketsData || []);
        setAssets(assetsData || []);
        setRisks(risksData || []);
      } catch (err) {
        console.warn('Failed to load IT dashboard metrics:', err);
      }
    }
    loadData();
  }, []);

  const openTickets = tickets.filter((t) => t.status !== 'RESOLVED');
  const activeRisks = risks.filter((r) => !r.resolvedAt);

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="IT Systems & Infrastructure Operations"
        description="Monitor automated provisioning adapter health, hardware asset logistics, triage queues, and access revocation compliance."
        badge={<Badge variant="default" dot>All Adapters Connected</Badge>}
      />

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<Server className="w-6 h-6" />}
          iconBgColor="blue"
          value="5"
          label="Adapter Integrations"
          actionText="Google, GitHub, AWS"
          actionHref="/employees/emp-rahul/provisioning"
        />
        <StatCard
          icon={<Ticket className="w-6 h-6" />}
          iconBgColor="purple"
          value={String(openTickets.length)}
          label="Open Helpdesk Tickets"
          actionText="Avg SLA: 4h"
          actionHref="/it/tickets"
        />
        <StatCard
          icon={<Laptop className="w-6 h-6" />}
          iconBgColor="emerald"
          value={String(assets.length)}
          label="Hardware Assigned"
          actionText="Registered Workstations"
          actionHref="/it/assets"
        />
        <StatCard
          icon={<ShieldAlert className="w-6 h-6" />}
          iconBgColor="rose"
          value={String(activeRisks.length)}
          label="Offboarding Risk Flags"
          actionText="Access Review"
          actionHref="/it/offboarding"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-600" />
              Support Ticket Queue
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Triage workplace helpdesk requests with automated AI category and priority tagging.
            </p>
          </div>
          <Link to="/it/tickets" className="block pt-2">
            <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-slate-600" />}>
              Open Queue
            </Button>
          </Link>
        </div>

        <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-600" />
              Hardware Logistics
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track serial numbers, laptop provisioning, monitor assignments, and YubiKeys.
            </p>
          </div>
          <Link to="/it/assets" className="block pt-2">
            <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-slate-600" />}>
              Asset Tracker
            </Button>
          </Link>
        </div>

        <div className="p-6 bg-white border border-rose-200 rounded-3xl shadow-card space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-rose-950 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Access Drift & Security
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Identify residual access on departed accounts and revoke stale OAuth grants.
            </p>
          </div>
          <Link to="/it/offboarding-risks" className="block pt-2">
            <Button size="sm" variant="destructive" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Review Risks (1)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

