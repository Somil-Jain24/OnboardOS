import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { StatCard } from '../../components/ui/StatCard';
import { client } from '../../services';
import {
  CreditCard,
  DollarSign,
  Layers,
} from 'lucide-react';
import type { SaaSLicense } from '../../types';

export function SaaSLicenseIntelligencePage() {
  const [licenses, setLicenses] = useState<SaaSLicense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLicenses();
  }, []);

  async function loadLicenses() {
    try {
      setLoading(true);
      const data = await client.getSaaSLicenses();
      setLicenses(data);
    } finally {
      setLoading(false);
    }
  }

  const totalPotentialSavings = licenses.reduce((acc, l) => acc + l.potentialMonthlySavings, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-left">
      <PageHeader
        title="SaaS & License Cost Intelligence"
        description="Analyze software seat allocation, detect dormant paid licenses, and automate tier downgrades or seat de-allocations to recover IT spend."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>License Telemetry Active</Badge>
            <Badge variant="purple">P2-27</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Monitored SaaS Platforms"
          value={licenses.length}
          subtitle="Direct SCIM & API telemetry"
          icon={<Layers className="w-5 h-5" />}
          iconColor="blue"
        />
        <StatCard
          title="Monthly Reclaimable Savings"
          value={`$${totalPotentialSavings}/mo`}
          subtitle={`$${totalPotentialSavings * 12}/year annualized`}
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="emerald"
        />
        <StatCard
          title="Average Inactive Seat Rate"
          value="14.8%"
          subtitle=">30-day zero login usage"
          icon={<CreditCard className="w-5 h-5" />}
          iconColor="amber"
        />
      </div>

      <div className="space-y-3">
        {licenses.map((lic) => {
          const utilPct = Math.round((lic.assignedSeats / lic.totalSeats) * 100);

          return (
            <div key={lic.id} className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{lic.appName}</h3>
                    <Badge variant="secondary" size="sm">{lic.tier}</Badge>
                    <StatusBadge
                      status={lic.status === 'OPTIMAL' ? 'completed' : 'warning'}
                      label={lic.status}
                      size="sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    ${lic.costPerSeatMonthly}/seat/mo • {lic.assignedSeats} of {lic.totalSeats} seats allocated ({utilPct}% utilization)
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Reclaimable Savings</span>
                  <p className="text-base font-bold text-emerald-600 font-mono">
                    +${lic.potentialMonthlySavings}/mo
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Allocated Seats</span>
                  <p className="font-bold text-slate-900 mt-0.5">{lic.assignedSeats} / {lic.totalSeats}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">30-Day Inactive Seats</span>
                  <p className="font-bold text-rose-600 mt-0.5">{lic.inactiveSeats30d} seats dormant</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Optimization Action</span>
                  <p className="font-bold text-blue-600 mt-0.5">Reclaim Inactive Seats</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

