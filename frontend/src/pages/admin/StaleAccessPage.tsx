import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  ClockAlert,
  Trash2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import type { StaleAccessItem } from '../../types';

export function StaleAccessPage() {
  const [items, setItems] = useState<StaleAccessItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      const data = await client.getStaleAccessItems();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  const handleReclaim = async (id: string, action: 'REVOKE_IMMEDIATE' | 'KEPT_WITH_JUSTIFICATION') => {
    await client.reclaimStaleAccess(id, action);
    await loadItems();
  };

  const totalCostWaste = items
    .filter((i) => i.status === 'FLAGGED')
    .reduce((acc, i) => acc + (i.monthlyCostUsd || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Usage-Aware Stale Access Detection"
        description="Detect dormant permissions and inactive application licenses (90+ days unused) to reduce attack surface and reclaim software seat costs."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="default" dot>Usage Monitor Active</Badge>
            <Badge variant="purple">P1-25</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Flagged Dormant Grants</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">
            {items.filter((i) => i.status === 'FLAGGED').length}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">&gt;90 days zero login activity</p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Monthly Inactive Waste</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">${totalCostWaste}/mo</h3>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Reclaimable SaaS license cost
          </p>
        </Card>
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Reclaimed This Month</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">
            {items.filter((i) => i.status === 'REVOKED').length}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Least privilege enforced</p>
        </Card>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const isRevoked = item.status === 'REVOKED';

          return (
            <Card
              key={item.id}
              className={`p-5 border transition-all ${
                isRevoked ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {item.id}
                    </span>
                    <h4 className="font-semibold text-slate-100 text-sm">{item.entitlementName}</h4>
                    <Badge variant="outline" size="sm">{item.app}</Badge>
                    <Badge variant={isRevoked ? 'default' : 'warning'} size="sm">
                      {item.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300">
                    Employee: <strong className="text-slate-100">{item.employeeName}</strong> ({item.roleTitle} - {item.department})
                  </p>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                    <span className="text-rose-400 font-semibold">⚠️ {item.daysInactive} days inactive</span>
                    <span>Last login: {new Date(item.lastActivityAt).toLocaleDateString()}</span>
                    {item.monthlyCostUsd && (
                      <span className="text-amber-300">Cost: ${item.monthlyCostUsd}/mo</span>
                    )}
                  </div>
                </div>

                {!isRevoked && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleReclaim(item.id, 'REVOKE_IMMEDIATE')}
                      className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Reclaim & Revoke
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReclaim(item.id, 'KEPT_WITH_JUSTIFICATION')}
                      className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs h-8"
                    >
                      Keep (Business Need)
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
