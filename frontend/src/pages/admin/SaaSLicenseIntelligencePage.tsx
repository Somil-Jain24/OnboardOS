import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  CreditCard,
  DollarSign,
  TrendingDown,
  Layers,
  Sparkles,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Monitored SaaS Platforms</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">{licenses.length}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Direct SCIM & API telemetry</p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Monthly Reclaimable Savings</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">${totalPotentialSavings}/mo</h3>
          <p className="text-[11px] text-emerald-500/80 mt-1">${totalPotentialSavings * 12}/year annualized</p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Average Inactive Seat Rate</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">14.8%</h3>
          <p className="text-[11px] text-slate-500 mt-1">&gt;30-day zero login usage</p>
        </Card>
      </div>

      <div className="space-y-3">
        {licenses.map((lic) => {
          const utilPct = Math.round((lic.assignedSeats / lic.totalSeats) * 100);

          return (
            <Card key={lic.id} className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-base">{lic.appName}</h3>
                    <Badge variant="outline" size="sm">{lic.tier}</Badge>
                    <Badge
                      variant={lic.status === 'OPTIMAL' ? 'default' : 'warning'}
                      size="sm"
                    >
                      {lic.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    ${lic.costPerSeatMonthly}/seat/mo • {lic.assignedSeats} of {lic.totalSeats} seats allocated ({utilPct}% utilization)
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-500">Reclaimable Savings</span>
                  <p className="text-base font-bold text-emerald-400 font-mono">
                    +${lic.potentialMonthlySavings}/mo
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Allocated Seats</span>
                  <p className="font-bold text-slate-200 mt-0.5">{lic.assignedSeats} / {lic.totalSeats}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">30-Day Inactive Seats</span>
                  <p className="font-bold text-rose-400 mt-0.5">{lic.inactiveSeats30d} seats dormant</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Optimization Action</span>
                  <p className="font-bold text-blue-400 mt-0.5">Reclaim Inactive Seats</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
